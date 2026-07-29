import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { Calendar } from 'react-date-range';
import dayjs from 'dayjs';
import classNames from 'classnames';
import DateTimePickerPopover from './DateTimePickerPopover';
import {
	combineDateAndTime,
	emitInputChange,
	parseLocalDateTime,
	toDateTimeLocalValue,
} from './utils';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './datetime-local-input.scss';

export { toDateTimeLocalValue } from './utils';

export interface DateTimeLocalInputProps {
	name?: string;
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	min?: string;
	max?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	id?: string;
	placeholder?: string;
	/** Calendar highlight color. Defaults to VITE_PRIMARY_COLOR or Bootstrap primary. */
	primaryColor?: string;
}

const DEFAULT_PRIMARY_COLOR =
	(typeof import.meta !== 'undefined' &&
		import.meta.env?.VITE_PRIMARY_COLOR &&
		String(import.meta.env.VITE_PRIMARY_COLOR)) ||
	'#0d6efd';

const DateTimeLocalInput: FC<DateTimeLocalInputProps> = ({
	name,
	value,
	onChange,
	min,
	max,
	required,
	disabled,
	className,
	id,
	placeholder = 'Select date & time',
	primaryColor = DEFAULT_PRIMARY_COLOR,
}) => {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [pendingDate, setPendingDate] = useState<Date>(() => new Date());
	const [pendingTime, setPendingTime] = useState('00:00');

	const parsedValue = useMemo(() => parseLocalDateTime(value), [value]);
	const minDateTime = useMemo(() => parseLocalDateTime(min), [min]);
	const maxDateTime = useMemo(() => parseLocalDateTime(max), [max]);

	const displayValue = parsedValue ? parsedValue.format('MMM D, YYYY h:mm A') : '';

	const calendarMinDate = minDateTime?.startOf('day').toDate();
	const calendarMaxDate = maxDateTime?.endOf('day').toDate();

	const timeMin = useMemo(() => {
		if (!minDateTime) return undefined;
		if (dayjs(pendingDate).isSame(minDateTime, 'day')) {
			return minDateTime.format('HH:mm');
		}
		return undefined;
	}, [minDateTime, pendingDate]);

	const timeMax = useMemo(() => {
		if (!maxDateTime) return undefined;
		if (dayjs(pendingDate).isSame(maxDateTime, 'day')) {
			return maxDateTime.format('HH:mm');
		}
		return undefined;
	}, [maxDateTime, pendingDate]);

	useEffect(() => {
		if (!popoverOpen) return;
		const base = parsedValue ?? dayjs();
		setPendingDate(base.toDate());
		setPendingTime(base.format('HH:mm'));
	}, [popoverOpen, parsedValue]);

	const handleApply = () => {
		let next = dayjs(combineDateAndTime(pendingDate, pendingTime));

		if (minDateTime && next.isBefore(minDateTime)) {
			next = minDateTime;
		}
		if (maxDateTime && next.isAfter(maxDateTime)) {
			next = maxDateTime;
		}

		emitInputChange(onChange, name, next.format('YYYY-MM-DDTHH:mm'));
		setPopoverOpen(false);
	};

	const handleClear = () => {
		emitInputChange(onChange, name, '');
		setPopoverOpen(false);
	};

	const triggerField = (
		<div
			className={classNames('datetime-local-input w-100', className, {
				'datetime-local-input--disabled': disabled,
			})}>
			<div className='input-group'>
				<input
					type='text'
					readOnly
					id={id}
					name={name}
					className='form-control datetime-local-input__trigger'
					value={displayValue}
					placeholder={placeholder}
					required={required && !displayValue}
					disabled={disabled}
					autoComplete='off'
				/>
				<span className='input-group-text datetime-local-input__icon' aria-hidden='true'>
					<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18' fill='currentColor'>
						<path d='M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z' />
					</svg>
				</span>
			</div>
		</div>
	);

	if (disabled) {
		return triggerField;
	}

	const pickerBody = (
		<div className='datetime-local-input__popover'>
			<Calendar
				onChange={(date: Date) => setPendingDate(date)}
				date={pendingDate}
				minDate={calendarMinDate}
				maxDate={calendarMaxDate}
				color={primaryColor}
			/>
			<div className='datetime-local-input__time-row px-3 pb-2'>
				<label htmlFor={`${id ?? name ?? 'dt'}-time`} className='form-label datetime-local-input__time-label'>
					Time
				</label>
				<input
					type='time'
					id={`${id ?? name ?? 'dt'}-time`}
					className='form-control'
					value={pendingTime}
					min={timeMin}
					max={timeMax}
					onChange={(e) => setPendingTime(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Backspace') e.preventDefault();
					}}
				/>
			</div>
			<div className='datetime-local-input__actions d-flex justify-content-end gap-2 px-3 pb-3'>
				<button type='button' className='btn btn-sm btn-danger btn-light' onClick={handleClear}>
					Clear
				</button>
				<button type='button' className='btn btn-sm btn-primary' onClick={handleApply}>
					OK
				</button>
			</div>
		</div>
	);

	return (
		<DateTimePickerPopover
			isOpen={popoverOpen}
			onOpenChange={setPopoverOpen}
			className='datetime-local-input__popover-shell'
			bodyClassName='p-0'
			content={pickerBody}>
			{triggerField}
		</DateTimePickerPopover>
	);
};

export default DateTimeLocalInput;

import React, { FC, useEffect, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import classNames from 'classnames';
import DateTimePickerPopover from '../DateTimeLocalInput/DateTimePickerPopover';
import {
	combineDateAndTime,
	parseLocalDateTime,
} from '../DateTimeLocalInput/utils';
import './modern-date-time-picker.scss';

export interface ModernDateTimePickerProps {
	id?: string;
	value?: string;
	onChange?: (value: string) => void;
	onBlur?: (value: string) => void;
	min?: string;
	max?: string;
	disabled?: boolean;
	required?: boolean;
	className?: string;
	placeholder?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const clampToBounds = (next: Dayjs, minDt: Dayjs | null, maxDt: Dayjs | null): Dayjs => {
	let out = next;
	if (minDt && out.isBefore(minDt)) out = minDt;
	if (maxDt && out.isAfter(maxDt)) out = maxDt;
	return out;
};

const to12HourParts = (d: Dayjs): { hour12: number; minute: number; isPm: boolean } => {
	const hour24 = d.hour();
	const isPm = hour24 >= 12;
	const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
	return { hour12, minute: d.minute(), isPm };
};

const partsToTimeString = (hour12: number, minute: number, isPm: boolean): string => {
	let hour24 = hour12 % 12;
	if (isPm) hour24 += 12;
	return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

/**
 * Reusable modern date + time picker.
 * Value format matches `datetime-local`: `YYYY-MM-DDTHH:mm`.
 */
const ModernDateTimePicker: FC<ModernDateTimePickerProps> = ({
	id,
	value = '',
	onChange,
	onBlur,
	min,
	max,
	disabled,
	required,
	className,
	placeholder = 'Select date & time',
}) => {
	const [open, setOpen] = useState(false);
	const [viewMonth, setViewMonth] = useState(() => dayjs().startOf('month'));
	const [pendingDate, setPendingDate] = useState<Date>(() => new Date());
	const [hour12, setHour12] = useState(12);
	const [minute, setMinute] = useState(0);
	const [isPm, setIsPm] = useState(false);

	const parsedValue = useMemo(() => parseLocalDateTime(value), [value]);
	const minDateTime = useMemo(() => parseLocalDateTime(min), [min]);
	const maxDateTime = useMemo(() => parseLocalDateTime(max), [max]);

	const displayValue = parsedValue
		? parsedValue.format('MMM D, YYYY · h:mm A')
		: '';

	useEffect(() => {
		if (!open) return;
		const base = parsedValue ?? dayjs();
		const parts = to12HourParts(base);
		setPendingDate(base.toDate());
		setViewMonth(base.startOf('month'));
		setHour12(parts.hour12);
		setMinute(parts.minute);
		setIsPm(parts.isPm);
	}, [open, parsedValue]);

	const calendarDays = useMemo(() => {
		const start = viewMonth.startOf('month').startOf('week');
		const end = viewMonth.endOf('month').endOf('week');
		const days: Dayjs[] = [];
		let cursor = start;
		while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
			days.push(cursor);
			cursor = cursor.add(1, 'day');
		}
		return days;
	}, [viewMonth]);

	const isDayDisabled = (day: Dayjs): boolean => {
		if (minDateTime && day.endOf('day').isBefore(minDateTime)) return true;
		if (maxDateTime && day.startOf('day').isAfter(maxDateTime)) return true;
		return false;
	};

	const commitValue = (localValue: string) => {
		onChange?.(localValue);
		onBlur?.(localValue);
		setOpen(false);
	};

	const handleApply = () => {
		const time = partsToTimeString(hour12, minute, isPm);
		let next = dayjs(combineDateAndTime(pendingDate, time));
		next = clampToBounds(next, minDateTime, maxDateTime);
		commitValue(next.format('YYYY-MM-DDTHH:mm'));
	};

	const handleClear = () => {
		commitValue('');
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (disabled) return;
		if (!nextOpen && open) {
			onBlur?.(value);
		}
		setOpen(nextOpen);
	};

	const pendingSelected = dayjs(pendingDate);

	const trigger = (
		<button
			type='button'
			id={id}
			disabled={disabled}
			aria-haspopup='dialog'
			aria-expanded={open}
			aria-required={required || undefined}
			className={classNames('mdp-trigger form-control rounded-3', className, {
				'mdp-trigger--empty': !displayValue,
				'mdp-trigger--open': open,
			})}>
			<span className='mdp-trigger__value text-truncate'>
				{displayValue || placeholder}
			</span>
			<span className='mdp-trigger__icon' aria-hidden>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18' fill='currentColor'>
					<path d='M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z' />
				</svg>
			</span>
		</button>
	);

	if (disabled) {
		return trigger;
	}

	const pickerBody = (
		<div className='mdp-panel'>
			<div className='mdp-panel__header'>
				<button
					type='button'
					className='mdp-nav-btn'
					aria-label='Previous month'
					onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}>
					‹
				</button>
				<div className='mdp-panel__month'>{viewMonth.format('MMMM YYYY')}</div>
				<button
					type='button'
					className='mdp-nav-btn'
					aria-label='Next month'
					onClick={() => setViewMonth((m) => m.add(1, 'month'))}>
					›
				</button>
			</div>

			<div className='mdp-weekdays'>
				{WEEKDAYS.map((d) => (
					<span key={d} className='mdp-weekday'>
						{d}
					</span>
				))}
			</div>

			<div className='mdp-grid'>
				{calendarDays.map((day) => {
					const outside = !day.isSame(viewMonth, 'month');
					const selected = day.isSame(pendingSelected, 'day');
					const isToday = day.isSame(dayjs(), 'day');
					const dayDisabled = isDayDisabled(day);
					return (
						<button
							key={day.format('YYYY-MM-DD')}
							type='button'
							disabled={dayDisabled}
							className={classNames('mdp-day', {
								'mdp-day--outside': outside,
								'mdp-day--selected': selected,
								'mdp-day--today': isToday && !selected,
								'mdp-day--disabled': dayDisabled,
							})}
							onClick={() => setPendingDate(day.toDate())}>
							{day.date()}
						</button>
					);
				})}
			</div>

			<div className='mdp-time'>
				<div className='mdp-time__label'>Time</div>
				<div className='mdp-time__controls'>
					<label className='mdp-time__field'>
						<span className='mdp-time__field-label'>Hour</span>
						<select
							className='mdp-time__select'
							value={hour12}
							onChange={(e) => setHour12(Number(e.target.value))}>
							{Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
								<option key={h} value={h}>
									{h}
								</option>
							))}
						</select>
					</label>
					<span className='mdp-time__colon' aria-hidden>
						:
					</span>
					<label className='mdp-time__field'>
						<span className='mdp-time__field-label'>Min</span>
						<select
							className='mdp-time__select'
							value={minute}
							onChange={(e) => setMinute(Number(e.target.value))}>
							{Array.from({ length: 60 }, (_, i) => i).map((m) => (
								<option key={m} value={m}>
									{String(m).padStart(2, '0')}
								</option>
							))}
						</select>
					</label>
					<div className='mdp-ampm' role='group' aria-label='AM or PM'>
						<button
							type='button'
							className={classNames('mdp-ampm__btn', { 'is-active': !isPm })}
							onClick={() => setIsPm(false)}>
							AM
						</button>
						<button
							type='button'
							className={classNames('mdp-ampm__btn', { 'is-active': isPm })}
							onClick={() => setIsPm(true)}>
							PM
						</button>
					</div>
				</div>
			</div>

			<div className='mdp-actions'>
				<button type='button' className='mdp-btn mdp-btn--ghost' onClick={handleClear}>
					Clear
				</button>
				<button type='button' className='mdp-btn mdp-btn--primary' onClick={handleApply}>
					Apply
				</button>
			</div>
		</div>
	);

	return (
		<DateTimePickerPopover
			isOpen={open}
			onOpenChange={handleOpenChange}
			className='mdp-popover-shell'
			bodyClassName='p-0'
			content={pickerBody}>
			{trigger}
		</DateTimePickerPopover>
	);
};

export default ModernDateTimePicker;

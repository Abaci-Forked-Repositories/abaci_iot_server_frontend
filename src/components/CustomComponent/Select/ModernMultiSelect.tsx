import React from 'react';
import Select, {
	components,
	type GroupBase,
	type OptionProps,
	type StylesConfig,
} from 'react-select';
import useDarkMode from '../../../hooks/useDarkMode';

export type ModernMultiSelectOption = {
	value: number | string;
	label: string;
};

interface ModernMultiSelectProps {
	options: ModernMultiSelectOption[];
	value: ModernMultiSelectOption[];
	onChange: (value: ModernMultiSelectOption[]) => void;
	placeholder?: string;
	isDisabled?: boolean;
}

const MenuPortal = (props: React.ComponentProps<typeof components.MenuPortal>) => (
	<components.MenuPortal
		{...props}
		innerProps={
			{
				...props.innerProps,
				'data-modal-ignore-backdrop': 'true',
			} as React.ComponentProps<typeof components.MenuPortal>['innerProps']
		}
	/>
);

const ClearIndicator = (props: React.ComponentProps<typeof components.ClearIndicator>) => (
	<components.ClearIndicator
		{...props}
		innerProps={{
			...props.innerProps,
			onMouseDown: (event) => {
				event.preventDefault();
				event.stopPropagation();
				props.innerProps?.onMouseDown?.(event);
			},
			onClick: (event) => {
				event.stopPropagation();
				props.innerProps?.onClick?.(event);
			},
		}}
	/>
);

const CheckboxOption = (props: OptionProps<ModernMultiSelectOption, true>) => (
	<components.Option {...props}>
		<div className='d-flex align-items-center gap-2 py-1'>
			<span
				className={[
					'd-inline-flex align-items-center justify-content-center rounded-1 flex-shrink-0 border',
					props.isSelected
						? 'bg-primary border-primary text-white'
						: 'bg-body border-secondary border-opacity-50',
				].join(' ')}
				style={{ width: 18, height: 18, fontSize: 11, lineHeight: 1 }}>
				{props.isSelected ? '✓' : ''}
			</span>
			<span className={props.isSelected ? 'fw-semibold text-body' : 'text-body'}>
				{props.label}
			</span>
		</div>
	</components.Option>
);

const MultiValueRemove = (props: React.ComponentProps<typeof components.MultiValueRemove>) => (
	<components.MultiValueRemove
		{...props}
		innerProps={{
			...props.innerProps,
			onMouseDown: (event) => {
				event.preventDefault();
				event.stopPropagation();
				props.innerProps?.onMouseDown?.(event);
			},
			onClick: (event) => {
				event.stopPropagation();
				props.innerProps?.onClick?.(event);
			},
		}}>
		<span aria-hidden='true' style={{ fontSize: 14, lineHeight: 1 }}>
			×
		</span>
	</components.MultiValueRemove>
);

const buildStyles = (darkMode: boolean): StylesConfig<ModernMultiSelectOption, true> => {
	const border = darkMode ? '#3d4449' : '#dee2e6';
	const surface = darkMode ? '#212529' : '#ffffff';
	const surfaceMuted = darkMode ? '#2b3035' : '#f8f9fa';
	const text = darkMode ? '#f8f9fa' : '#212529';
	const textMuted = darkMode ? '#adb5bd' : '#6c757d';
	const primary = '#0d6efd';
	const primarySoft = darkMode ? 'rgba(13, 110, 253, 0.22)' : 'rgba(13, 110, 253, 0.12)';

	return {
		control: (base, state) => ({
			...base,
			minHeight: 48,
			borderRadius: 12,
			borderColor: state.isFocused ? primary : border,
			backgroundColor: surface,
			boxShadow: state.isFocused ? `0 0 0 3px ${darkMode ? 'rgba(13, 110, 253, 0.25)' : 'rgba(13, 110, 253, 0.15)'}` : 'none',
			cursor: 'pointer',
			padding: '2px 4px',
			':hover': {
				borderColor: state.isFocused ? primary : darkMode ? '#4a5258' : '#ced4da',
			},
		}),
		valueContainer: (base) => ({
			...base,
			padding: '4px 8px',
			gap: 4,
			maxHeight: 132,
			overflowY: 'auto',
		}),
		multiValue: (base) => ({
			...base,
			backgroundColor: primarySoft,
			borderRadius: 999,
			border: `1px solid ${darkMode ? 'rgba(13, 110, 253, 0.35)' : 'rgba(13, 110, 253, 0.2)'}`,
			margin: 2,
		}),
		multiValueLabel: (base) => ({
			...base,
			color: primary,
			fontWeight: 600,
			fontSize: 12,
			padding: '3px 2px 3px 8px',
		}),
		multiValueRemove: (base) => ({
			...base,
			color: primary,
			borderRadius: 999,
			':hover': {
				backgroundColor: darkMode ? 'rgba(13, 110, 253, 0.35)' : 'rgba(13, 110, 253, 0.18)',
				color: primary,
			},
		}),
		placeholder: (base) => ({
			...base,
			color: textMuted,
			fontSize: 14,
			fontWeight: 500,
		}),
		input: (base) => ({
			...base,
			color: text,
			fontSize: 14,
			margin: 0,
			padding: 0,
		}),
		indicatorsContainer: (base) => ({
			...base,
			paddingRight: 8,
		}),
		dropdownIndicator: (base, state) => ({
			...base,
			color: state.isFocused ? primary : textMuted,
			padding: 6,
			':hover': {
				color: primary,
			},
		}),
		clearIndicator: (base) => ({
			...base,
			color: textMuted,
			padding: 6,
			':hover': {
				color: '#dc3545',
			},
		}),
		menuPortal: (base) => ({
			...base,
			zIndex: 9999,
		}),
		menu: (base) => ({
			...base,
			borderRadius: 12,
			overflow: 'hidden',
			border: `1px solid ${border}`,
			boxShadow: darkMode
				? '0 12px 32px rgba(0, 0, 0, 0.45)'
				: '0 12px 32px rgba(15, 23, 42, 0.12)',
			backgroundColor: surface,
			marginTop: 6,
		}),
		menuList: (base) => ({
			...base,
			padding: 6,
			maxHeight: 220,
		}),
		option: (base, state) => ({
			...base,
			borderRadius: 8,
			margin: '2px 0',
			padding: '8px 10px',
			backgroundColor: state.isSelected
				? primarySoft
				: state.isFocused
					? surfaceMuted
					: 'transparent',
			color: text,
			cursor: 'pointer',
			':active': {
				backgroundColor: primarySoft,
			},
		}),
		noOptionsMessage: (base) => ({
			...base,
			color: textMuted,
			fontSize: 13,
		}),
	};
};

const ModernMultiSelect: React.FC<ModernMultiSelectProps> = ({
	options,
	value,
	onChange,
	placeholder = 'Select options',
	isDisabled = false,
}) => {
	const { darkModeStatus } = useDarkMode();
	const styles = buildStyles(darkModeStatus);

	return (
		<div data-modal-ignore-backdrop>
			<Select<ModernMultiSelectOption, true, GroupBase<ModernMultiSelectOption>>
				isMulti
				isDisabled={isDisabled}
				isClearable
				closeMenuOnSelect={false}
				hideSelectedOptions={false}
				blurInputOnSelect={false}
				options={options}
				value={value}
				onChange={(selected) => onChange([...(selected || [])])}
				placeholder={placeholder}
				styles={styles}
				classNamePrefix='modern-multi-select'
				components={{
					Option: CheckboxOption,
					MultiValueRemove,
					ClearIndicator,
					MenuPortal,
				}}
				menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
				menuPosition='fixed'
			/>
		</div>
	);
};

export default ModernMultiSelect;

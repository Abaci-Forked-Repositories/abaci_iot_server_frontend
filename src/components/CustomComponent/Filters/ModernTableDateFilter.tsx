import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import useDarkMode from '../../../hooks/useDarkMode';
import { modernTableFilterClearButtonSx, modernTableFilterInputSx } from './modernTableFilterStyles';
import type { MaterialTableFilterProps } from './materialTableFilterTypes';

const toDayjsValue = (value: unknown): Dayjs | null => {
	if (!value) return null;
	if (dayjs.isDayjs(value)) return value;
	const parsed = dayjs(value as string | Date);
	return parsed.isValid() ? parsed : null;
};

const ModernTableDateFilter: React.FC<MaterialTableFilterProps> = ({
	columnDef,
	onFilterChanged,
}) => {
	const { darkModeStatus } = useDarkMode();
	const columnId = columnDef?.tableData?.id;
	const value = toDayjsValue(columnDef?.tableData?.filterValue);

	const handleChange = (next: Dayjs | null) => {
		if (typeof columnId !== 'number') return;
		onFilterChanged(columnId, next ? next.startOf('day').toDate() : null);
	};

	const handleClear = () => {
		if (typeof columnId !== 'number') return;
		onFilterChanged(columnId, null);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 200 }}>
				<DatePicker
					value={value}
					onChange={handleChange}
					disableFuture
					format='DD MMM YYYY'
					slotProps={{
						textField: {
							size: 'small',
							placeholder: 'Select date',
							fullWidth: true,
							sx: modernTableFilterInputSx(darkModeStatus),
						},
						popper: {
							sx: {
								'& .MuiPaper-root': {
									borderRadius: '16px',
									border: darkModeStatus
										? '1px solid rgba(255,255,255,0.08)'
										: '1px solid rgba(15,23,42,0.08)',
									boxShadow: darkModeStatus
										? '0 16px 36px rgba(0, 0, 0, 0.45)'
										: '0 16px 36px rgba(15, 23, 42, 0.14)',
									backgroundColor: darkModeStatus ? '#171c22' : '#ffffff',
								},
								'& .MuiPickersCalendarHeader-root': {
									paddingLeft: 2,
									paddingRight: 1.5,
									paddingTop: 1.5,
								},
								'& .MuiPickersCalendarHeader-label': {
									fontSize: '0.95rem',
									fontWeight: 700,
								},
								'& .MuiDayCalendar-weekDayLabel': {
									fontSize: '0.68rem',
									fontWeight: 600,
									opacity: 0.65,
								},
								'& .MuiPickersDay-root': {
									borderRadius: '10px',
									fontWeight: 600,
									fontSize: '0.78rem',
								},
								'& .MuiPickersDay-root.Mui-selected': {
									backgroundColor: '#2f5bea',
									color: '#fff',
								},
								'& .MuiPickersDay-root.Mui-selected:hover': {
									backgroundColor: '#274bcc',
								},
								'& .MuiPickersDay-root.MuiPickersDay-today': {
									borderColor: '#2f5bea',
								},
							},
						},
					}}
				/>
				<Tooltip title='Clear date'>
					<span>
						<IconButton
							size='small'
							onClick={handleClear}
							disabled={!value}
							aria-label='Clear date filter'
							sx={modernTableFilterClearButtonSx}>
							<ClearIcon fontSize='small' />
						</IconButton>
					</span>
				</Tooltip>
			</Box>
		</LocalizationProvider>
	);
};

export default ModernTableDateFilter;

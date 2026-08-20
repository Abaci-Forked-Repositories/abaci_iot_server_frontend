import React from 'react';
import {
	Box,
	FormControl,
	IconButton,
	MenuItem,
	Select,
	Tooltip,
	type SelectChangeEvent,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import useDarkMode from '../../../hooks/useDarkMode';
import { modernTableFilterClearButtonSx, modernTableFilterSelectSx } from './modernTableFilterStyles';
import type { MaterialTableFilterProps } from './materialTableFilterTypes';

type ModernTableSelectFilterProps = MaterialTableFilterProps & {
	lookup?: Record<string, string>;
	placeholder?: string;
};

const ModernTableSelectFilter: React.FC<ModernTableSelectFilterProps> = ({
	columnDef,
	onFilterChanged,
	lookup = {},
	placeholder = 'All',
}) => {
	const { darkModeStatus } = useDarkMode();
	const columnId = columnDef?.tableData?.id;
	const value = columnDef?.tableData?.filterValue;
	const selected = value == null || value === '' ? '' : String(value);

	const handleChange = (event: SelectChangeEvent<string>) => {
		if (typeof columnId !== 'number') return;
		const next = event.target.value;
		onFilterChanged(columnId, next === '' ? undefined : next);
	};

	const handleClear = () => {
		if (typeof columnId !== 'number') return;
		onFilterChanged(columnId, undefined);
	};

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 160 }}>
			<FormControl size='small' fullWidth>
				<Select
					value={selected}
					onChange={handleChange}
					displayEmpty
					sx={modernTableFilterSelectSx(darkModeStatus)}>
					<MenuItem value=''>
						<em>{placeholder}</em>
					</MenuItem>
					{Object.entries(lookup).map(([key, label]) => (
						<MenuItem key={key} value={key}>
							{label}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Tooltip title='Clear filter'>
				<span>
					<IconButton
						size='small'
						onClick={handleClear}
						disabled={!selected}
						aria-label='Clear select filter'
						sx={modernTableFilterClearButtonSx}>
						<ClearIcon fontSize='small' />
					</IconButton>
				</span>
			</Tooltip>
		</Box>
	);
};

export default ModernTableSelectFilter;

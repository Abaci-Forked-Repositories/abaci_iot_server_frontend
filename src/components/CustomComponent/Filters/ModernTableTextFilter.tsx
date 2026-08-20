import React, { useEffect, useState } from 'react';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import useDarkMode from '../../../hooks/useDarkMode';
import { modernTableFilterClearButtonSx, modernTableFilterInputSx } from './modernTableFilterStyles';
import type { MaterialTableFilterProps } from './materialTableFilterTypes';

type ModernTableTextFilterProps = MaterialTableFilterProps & {
	placeholder?: string;
};

const ModernTableTextFilter: React.FC<ModernTableTextFilterProps> = ({
	columnDef,
	onFilterChanged,
	placeholder = 'Filter…',
}) => {
	const { darkModeStatus } = useDarkMode();
	const columnId = columnDef?.tableData?.id;
	const filterValue = columnDef?.tableData?.filterValue;
	const [value, setValue] = useState(() => (filterValue == null ? '' : String(filterValue)));

	useEffect(() => {
		const next = filterValue == null ? '' : String(filterValue);
		setValue(next);
	}, [filterValue]);

	const commit = (next: string) => {
		if (typeof columnId !== 'number') return;
		onFilterChanged(columnId, next.trim() === '' ? undefined : next);
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = event.target.value;
		setValue(next);
		commit(next);
	};

	const handleClear = () => {
		setValue('');
		if (typeof columnId !== 'number') return;
		onFilterChanged(columnId, undefined);
	};

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 160 }}>
			<TextField
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				size='small'
				fullWidth
				sx={modernTableFilterInputSx(darkModeStatus)}
			/>
			<Tooltip title='Clear filter'>
				<span>
					<IconButton
						size='small'
						onClick={handleClear}
						disabled={!value}
						aria-label='Clear text filter'
						sx={modernTableFilterClearButtonSx}>
						<ClearIcon fontSize='small' />
					</IconButton>
				</span>
			</Tooltip>
		</Box>
	);
};

export default ModernTableTextFilter;

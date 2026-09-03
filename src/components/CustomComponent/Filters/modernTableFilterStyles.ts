import type { SxProps, Theme } from '@mui/material';

const filterFieldSurface = (darkMode: boolean) => ({
	height: 36,
	borderRadius: '10px',
	fontSize: 12,
	backgroundColor: darkMode ? '#1e2329' : '#f8fafc',
	border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.14)',
	transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
	'&:hover': {
		borderColor: darkMode ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.22)',
	},
	'&.Mui-focused': {
		borderColor: '#2f5bea',
		boxShadow: darkMode
			? '0 0 0 3px rgba(47, 91, 234, 0.25)'
			: '0 0 0 3px rgba(47, 91, 234, 0.15)',
	},
});

export const modernTableFilterInputSx = (darkMode: boolean): SxProps<Theme> => ({
	'& .MuiInputBase-root': filterFieldSurface(darkMode),
	'& .MuiInputBase-input': {
		padding: '8px 10px',
		color: darkMode ? '#f1f5f9' : '#0f172a',
		'&::placeholder': {
			color: darkMode ? 'rgba(241,245,249,0.45)' : 'rgba(15,23,42,0.45)',
			opacity: 1,
		},
	},
	'& .MuiOutlinedInput-notchedOutline': {
		border: 'none',
	},
});

/** Styles for MUI Select used as a MaterialTable filter (Select is the InputBase root). */
export const modernTableFilterSelectSx = (darkMode: boolean): SxProps<Theme> => ({
	...filterFieldSurface(darkMode),
	color: darkMode ? '#f1f5f9' : '#0f172a',
	'& .MuiSelect-select': {
		padding: '8px 10px',
		fontSize: 12,
		display: 'flex',
		alignItems: 'center',
	},
	'& .MuiOutlinedInput-notchedOutline': {
		border: 'none',
	},
	'&:hover .MuiOutlinedInput-notchedOutline': {
		border: 'none',
	},
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
		border: 'none',
	},
});

export const modernTableFilterClearButtonSx = {
	width: 28,
	height: 28,
	color: 'text.secondary',
	'&:hover': {
		color: 'text.primary',
		backgroundColor: 'action.hover',
	},
};

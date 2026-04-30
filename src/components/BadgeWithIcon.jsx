import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import useDarkMode from '../hooks/useDarkMode';
import { useTranslation } from 'react-i18next';
const StatusBadge = ({ status, is_active }) => {
	const { themeStatus } = useDarkMode();
	const { t } = useTranslation();
	const getStatusBadgeStyles = (key) => {
		const styles = {
			'In progress': {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FFF4E6 0%, #FFE8CC 100%)',
				color: '#D97706',
				dotColor: '#F59E0B',
			},
			Entry: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Exit: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
			Tag: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
				color: '#2563EB',
				dotColor: '#3B82F6'
			},
			Untag: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FFF4E6 0%, #FFE8CC 100%)',
				color: '#D97706',
				dotColor: '#F59E0B',
			},
			Check: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
				color: '#9E9E9E',
				dotColor: '#9E9E9E',
			},
			Completed: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Active: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			ACTIVE: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Create: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Cancelled: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
			Delete: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
			DELETED: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
			Inactive: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
			Booked: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
				color: '#2563EB',
				dotColor: '#3B82F6',
			},
			Scheduled: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
				color: '#2563EB',
				dotColor: '#3B82F6',
			},
			active: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Disabled: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
			'In use': {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
				color: '#2563EB',
				dotColor: '#3B82F6',
			},
			Lost: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},

			Available: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Success: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
				color: '#059669',
				dotColor: '#10B981',
			},
			Skipped: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
				color: '#2563EB',
				dotColor: '#3B82F6',
			},
			Update: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
				color: '#2563EB',
				dotColor: '#3B82F6',
			},
			Error: {
				bg:
					themeStatus === 'dark'
						? 'inherit'
						: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
				color: '#DC2626',
				dotColor: '#EF4444',
			},
		};

		return (
			styles[key] || {
				bg:
					themeStatus === 'dark'
						? 'linear-gradient(135deg, #1F2128 0%, #2F3138 100%)'
						: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
				color: '#4B5563',
				dotColor: '#6B7280',
			}
		);
	};

	/* ---------- Decide label & style source ---------- */
	let label = '----';
	let styleKey = null;

	if (status) {
		label = status;
		styleKey = status;
	} else if (typeof is_active === 'boolean') {
		label = is_active ? 'Active' : 'Disabled';
		styleKey = is_active ? 'active' : 'disabled';
	}

	const badgeStyles = getStatusBadgeStyles(styleKey);

	if (!status && typeof is_active !== 'boolean') {
		return '----';
	}

	return (
		<Tooltip title={label} arrow placement='top'>
			<span
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '6px',
					padding: '6px 14px',
					background: badgeStyles.bg,
					color: badgeStyles.color,
					borderRadius: '20px',
					fontSize: '12px',
					fontWeight: '600',
					letterSpacing: '0.3px',
					whiteSpace: 'nowrap',
				}}>
				<span
					style={{
						width: '8px',
						height: '8px',
						borderRadius: '50%',
						backgroundColor: badgeStyles.dotColor,
					}}
				/>
				{t(label)}
			</span>
		</Tooltip>
	);
};

StatusBadge.propTypes = {
	status: PropTypes.string,
	is_active: PropTypes.bool,
};

StatusBadge.defaultProps = {
	status: null,
	is_active: undefined,
};

export default StatusBadge;

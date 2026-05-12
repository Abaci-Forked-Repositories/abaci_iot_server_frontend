import React from 'react';
import Button from '../bootstrap/Button';
import type { TColor } from '../../type/color-type';

interface StatusBadgeProps {
	status?: string | null;
	isAvailable?: boolean;
	/** When status is empty and `isAvailable` is not used, show this instead of the default unknown chip. */
	emptyFallback?: string;
}

const toTitleCase = (value: string) =>
	value
		.replace(/_/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());

const STATUS_COLOR_MAP: Record<string, TColor> = {
	active: 'success',
	assigned: 'success',
	available: 'success',
	running: 'success',
	scheduled: 'primary',
	onhold: 'warning',
	on_hold: 'warning',
	completed: 'info',
	cancelled: 'danger',
	canceled: 'danger',
	busy: 'danger',
	inactive: 'secondary',
	unassigned: 'secondary',
	disabled: 'secondary',
	/** Token pipeline */
	registred: 'secondary',
	reported: 'warning',
	serving: 'info',
	postponed: 'secondary',
	no_show: 'danger',
};

const STATUS_ICON_MAP: Record<string, string> = {
	active: 'CheckCircle',
	assigned: 'AssignmentInd',
	available: 'EventAvailable',
	running: 'PlayCircle',
	scheduled: 'Schedule',
	onhold: 'PauseCircle',
	on_hold: 'PauseCircle',
	completed: 'TaskAlt',
	cancelled: 'Cancel',
	canceled: 'Cancel',
	busy: 'DoNotDisturbOn',
	inactive: 'Block',
	unassigned: 'PersonOff',
	disabled: 'Block',
	unknown: 'HelpOutline',
	registred: 'AppRegistration',
	reported: 'NotificationsActive',
	serving: 'SupportAgent',
	postponed: 'Update',
	no_show: 'PersonOff',
};

/** Correct common API typo for display only */
const STATUS_LABEL_OVERRIDE: Record<string, string> = {
	registred: 'Registered',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isAvailable, emptyFallback }) => {
	const normalized = (status || '').toLowerCase().trim();
	if (!normalized && isAvailable === undefined && emptyFallback != null) {
		return <span className='text-muted small'>{emptyFallback}</span>;
	}
	const fallbackStatus = isAvailable === true ? 'available' : isAvailable === false ? 'busy' : 'unknown';
	const finalStatus = normalized || fallbackStatus;
	const color = STATUS_COLOR_MAP[finalStatus] ?? 'secondary';
	const label =
		STATUS_LABEL_OVERRIDE[normalized] ??
		(finalStatus === 'unknown' ? 'Unknown' : toTitleCase(finalStatus));
	const icon = STATUS_ICON_MAP[finalStatus] ?? STATUS_ICON_MAP.unknown;

	return (
		<Button
			isOutline={false}
			size='sm'
			color={color}
			isLight
			className='text-nowrap pe-none'
			style={{ borderRadius: '10px', pointerEvents: 'none' }}
			icon={icon}>
			{label}
		</Button>
	);
};

export default StatusBadge;

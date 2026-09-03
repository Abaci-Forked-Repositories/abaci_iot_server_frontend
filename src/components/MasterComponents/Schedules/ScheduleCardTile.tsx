import React from 'react';
import type { QueueSchedule } from '../../../services/queueManagementApi';
import Icon from '../../icon/Icon';
import StatusBadge from '../../BadgeWithIcon.jsx';
import { formatDate } from '../QueueManagement/queueManagementUtils';

interface ScheduleCardTileProps {
	schedule: QueueSchedule;
	onSelect: (schedule: QueueSchedule) => void;
}

const statusToModifier = (status?: string) => {
	const s = (status || '').toLowerCase().trim().replace(/\s+/g, '_');
	if (s === 'running') return 'running';
	if (s === 'scheduled') return 'scheduled';
	if (s === 'on_hold' || s === 'onhold') return 'on_hold';
	if (s === 'completed') return 'completed';
	if (s === 'cancelled' || s === 'canceled') return 'cancelled';
	return 'default';
};

const ScheduleCardTile: React.FC<ScheduleCardTileProps> = ({ schedule, onSelect }) => {
	const queueTitle =
		schedule.queue_name?.trim() || (schedule.queue != null ? `Queue #${schedule.queue}` : '—');
	const subtitle = schedule.description?.trim() || 'No description';
	const fromLabel = formatDate(schedule.from_datetime);
	const toLabel = formatDate(schedule.to_datetime);
	const windowSummary =
		fromLabel === '-' && toLabel === '-'
			? 'No start / end window'
			: `${fromLabel} → ${toLabel}`;
	const titleAttr = [queueTitle, windowSummary, schedule.status].filter(Boolean).join(' · ');
	const mod = statusToModifier(schedule.status);
	const hasLimit = schedule.limit != null;
	const hasTokens = schedule.token_from != null && schedule.token_to != null;
	const footerSingle = (hasLimit && !hasTokens) || (!hasLimit && hasTokens);

	return (
		<div
			className={`queue-modern-card schedule-modern-card schedule-modern-card--${mod}`}
			onClick={() => onSelect(schedule)}
			role='button'
			tabIndex={0}
			title={titleAttr}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onSelect(schedule);
				}
			}}>
			<div className='queue-modern-card__body schedule-modern-card__body'>
				<div className='queue-modern-card__head'>
					<div className='queue-modern-card__identity'>
						<div className='queue-modern-card__icon-box' aria-hidden>
							<Icon icon='Event' className='queue-modern-card__icon' />
						</div>
						<div className='queue-modern-card__title' title={queueTitle}>
							{queueTitle}
						</div>
					</div>
					<div className='queue-modern-card__actions'>
						<StatusBadge status={schedule.status} emptyFallback='—' />
					</div>
				</div>

				<p className='queue-modern-card__desc' title={subtitle}>
					{subtitle}
				</p>

				<div className='schedule-modern-card__window'>
					<Icon icon='DateRange' size='sm' className='schedule-modern-card__window-icon' />
					<div className='min-w-0'>
						<div className='schedule-modern-card__window-label'>Window</div>
						<div className='schedule-modern-card__window-value text-break'>{windowSummary}</div>
					</div>
				</div>
			</div>

			{(hasLimit || hasTokens) && (
				<div
					className={`queue-modern-card__footer ${footerSingle ? 'queue-modern-card__footer--single' : ''}`}>
					{hasLimit && (
						<div className='queue-modern-card__meta-item'>
							<span className='queue-modern-card__meta-label'>
								<Icon icon='FormatListNumbered' className='queue-modern-card__meta-icon' />
								Limit
							</span>
							<span className='queue-modern-card__meta-value'>{schedule.limit}</span>
						</div>
					)}
					{hasTokens && (
						<div className='queue-modern-card__meta-item'>
							<span className='queue-modern-card__meta-label'>
								<Icon icon='Tag' className='queue-modern-card__meta-icon' />
								Tokens
							</span>
							<span className='queue-modern-card__meta-value'>
								{schedule.token_from}–{schedule.token_to}
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ScheduleCardTile;

import React from 'react';
import type { QueueSchedule } from '../../../services/queueManagementApi';
import Icon from '../../icon/Icon';
import StatusBadge from '../../CustomComponent/StatusBadge';
import { formatDate } from '../QueueManagement/queueManagementUtils';

interface ScheduleCardTileProps {
	schedule: QueueSchedule;
	onSelect: (schedule: QueueSchedule) => void;
}

const ScheduleCardTile: React.FC<ScheduleCardTileProps> = ({ schedule, onSelect }) => {
	const queueTitle =
		schedule.queue_name?.trim() || (schedule.queue != null ? `Queue #${schedule.queue}` : '—');
	const subtitle =
		schedule.description?.trim() ||
		(schedule.queue_name?.trim() ? `Schedule #${schedule.id}` : undefined);
	const fromLabel = formatDate(schedule.from_datetime);
	const toLabel = formatDate(schedule.to_datetime);
	const windowSummary =
		fromLabel === '-' && toLabel === '-'
			? 'No start / end window'
			: `${fromLabel} → ${toLabel}`;
	const titleAttr = [queueTitle, windowSummary, schedule.status].filter(Boolean).join(' · ');

	return (
		<div
			className='queue-modern-card'
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
			<div className='queue-modern-card__header'>
				<div className='queue-modern-card__header-main d-flex align-items-center gap-3'>
					<div className='queue-modern-card__icon-box'>
						<Icon icon='Event' className='queue-modern-card__icon' />
					</div>
					<div className='min-w-0 flex-grow-1'>
						<div className='queue-modern-card__title text-truncate' title={queueTitle}>
							{queueTitle}
						</div>
						{subtitle && (
							<div className='small text-muted text-truncate' title={subtitle}>
								{subtitle}
							</div>
						)}
					</div>
				</div>
				<div className='queue-modern-card__header-actions d-flex align-items-center gap-2 flex-shrink-0'>
					<StatusBadge status={schedule.status} emptyFallback='—' />
				</div>
			</div>

			<div className='queue-modern-card__desc small text-muted mt-1'>
				<div className='d-flex justify-content-between gap-2'>
					<span className='text-nowrap'>From</span>
					<span className='text-end text-truncate'>{fromLabel}</span>
				</div>
				<div className='d-flex justify-content-between gap-2'>
					<span className='text-nowrap'>To</span>
					<span className='text-end text-truncate'>{toLabel}</span>
				</div>
			</div>

			<hr className='queue-modern-card__divider' />

			<div className='d-flex flex-wrap gap-2'>
				{schedule.current_token_number != null && schedule.current_token_number !== '' && (
					<div className='queue-modern-card__meta-pill'>
						<Icon icon='ConfirmationNumber' className='queue-modern-card__meta-icon' />
						<span className='queue-modern-card__meta-label'>Now</span>
						<span className='queue-modern-card__meta-value'>{schedule.current_token_number}</span>
					</div>
				)}
				{schedule.limit != null && (
					<div className='queue-modern-card__meta-pill'>
						<Icon icon='FormatListNumbered' className='queue-modern-card__meta-icon' />
						<span className='queue-modern-card__meta-label'>Limit</span>
						<span className='queue-modern-card__meta-value'>{schedule.limit}</span>
					</div>
				)}
				{schedule.token_from != null && schedule.token_to != null && (
					<div className='queue-modern-card__meta-pill'>
						<Icon icon='Tag' className='queue-modern-card__meta-icon' />
						<span className='queue-modern-card__meta-label'>Tokens</span>
						<span className='queue-modern-card__meta-value'>
							{schedule.token_from}–{schedule.token_to}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default ScheduleCardTile;

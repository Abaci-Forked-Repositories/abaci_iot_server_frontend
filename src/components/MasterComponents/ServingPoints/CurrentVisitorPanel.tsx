import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import Icon from '../../icon/Icon';
import StatusBadge from '../../BadgeWithIcon.jsx';

type FieldCardAccent = 'primary' | 'info' | 'success' | 'warning' | 'secondary';

const FIELD_CARD_ACCENT: Record<
	FieldCardAccent,
	{ card: string; iconBg: string; iconColor: FieldCardAccent }
> = {
	primary: {
		card: 'schedule-detail-hover-card--primary',
		iconBg: 'rgba(34, 73, 158, 0.14)',
		iconColor: 'primary',
	},
	info: {
		card: 'schedule-detail-hover-card--info',
		iconBg: 'rgba(54, 153, 255, 0.14)',
		iconColor: 'info',
	},
	success: {
		card: 'schedule-detail-hover-card--success',
		iconBg: 'rgba(27, 197, 189, 0.16)',
		iconColor: 'success',
	},
	warning: {
		card: 'schedule-detail-hover-card--warning',
		iconBg: 'rgba(255, 168, 0, 0.16)',
		iconColor: 'warning',
	},
	secondary: {
		card: 'schedule-detail-hover-card--secondary',
		iconBg: 'rgba(125, 138, 156, 0.14)',
		iconColor: 'secondary',
	},
};

const CurrentTokenFieldCard: React.FC<{
	label: string;
	icon: string;
	accent?: FieldCardAccent;
	index?: number;
	span?: 'full' | 'half' | 'third';
	children: React.ReactNode;
}> = ({ label, icon, accent = 'primary', index = 0, span = 'full', children }) => {
	const reduceMotion = useReducedMotion();
	const meta = FIELD_CARD_ACCENT[accent];
	const colClass =
		span === 'third'
			? 'col-12 col-sm-6 col-md-4'
			: span === 'half'
				? 'col-12 col-sm-6'
				: 'col-12';

	return (
		<motion.div
			className={colClass}
			initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{
				type: 'spring',
				stiffness: 420,
				damping: 30,
				delay: reduceMotion ? 0 : Math.min(index, 8) * 0.045,
			}}>
			<div
				className={`schedule-detail-hover-card ${meta.card} p-3 h-100 d-flex align-items-start gap-3`}>
				<span
					className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
					style={{ width: 34, height: 34, backgroundColor: meta.iconBg }}>
					<Icon icon={icon} color={meta.iconColor} />
				</span>
				<div className='min-w-0 flex-grow-1'>
					<div className='text-muted small mb-1'>{label}</div>
					<div className='fw-semibold text-break'>{children}</div>
				</div>
			</div>
		</motion.div>
	);
};

export type CurrentVisitorPanelProps = {
	tokenDisplay: string;
	visitorName: string | null;
	tokenStatus: string;
	/** When omitted, the Queue field is hidden. Pass `null` to show an empty queue value. */
	queueLink?: { id: number; name: string } | null;
	canViewQueue?: boolean;
	onOpenQueue?: (queueId: number) => void;
	detailRows: Array<{ icon: string; label: string; value: string }>;
};

const CurrentVisitorPanel: React.FC<CurrentVisitorPanelProps> = ({
	tokenDisplay,
	visitorName,
	tokenStatus,
	queueLink,
	canViewQueue = false,
	onOpenQueue,
	detailRows,
}) => {
	const reduceMotion = useReducedMotion();
	const showQueue = queueLink !== undefined;
	const hasVisitor = Boolean(visitorName);
	/** Compact primary fields share one row when values are short. */
	const primarySpan: 'third' | 'half' = hasVisitor || showQueue ? 'third' : 'half';

	const queueContent = showQueue ? (
		queueLink ? (
			canViewQueue && onOpenQueue ? (
				<Tooltip title='View queue details' arrow placement='top'>
					<span
						role='button'
						tabIndex={0}
						className='d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1 small fw-semibold bg-primary bg-opacity-10 text-body border border-primary border-opacity-25'
						style={{ cursor: 'pointer' }}
						onClick={() => onOpenQueue(queueLink.id)}
						onKeyDown={(ev) => {
							if (ev.key === 'Enter' || ev.key === ' ') {
								ev.preventDefault();
								onOpenQueue(queueLink.id);
							}
						}}>
						<Icon icon='OpenInNew' size='sm' />
						{queueLink.name}
					</span>
				</Tooltip>
			) : (
				<span className='fw-semibold'>{queueLink.name}</span>
			)
		) : (
			<span className='text-muted'>—</span>
		)
	) : null;

	return (
		<motion.div
			className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary p-3 p-md-4 h-100'
			initial={reduceMotion ? false : { opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
			<div className='d-flex align-items-center gap-2 mb-3'>
				<span
					className='d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0'
					style={{
						width: 36,
						height: 36,
						backgroundColor: 'color-mix(in srgb, var(--bs-primary) 12%, #ffffff)',
					}}>
					<Icon icon='Person' color='primary' size='sm' />
				</span>
				<span className='small text-uppercase fw-semibold text-muted'>Current visitor</span>
			</div>

			<div className='row g-3 schedule-detail-hover-grid'>
				<CurrentTokenFieldCard
					label='Token'
					icon='ConfirmationNumber'
					accent='primary'
					index={0}
					span={primarySpan}>
					<span className='fs-4 fw-bold text-primary lh-sm'>{tokenDisplay}</span>
				</CurrentTokenFieldCard>

				{hasVisitor ? (
					<CurrentTokenFieldCard
						label='Visitor'
						icon='Badge'
						accent='info'
						index={1}
						span={primarySpan}>
						<span className='fs-5 fw-semibold text-body-emphasis'>{visitorName}</span>
					</CurrentTokenFieldCard>
				) : null}

				<CurrentTokenFieldCard
					label='Token status'
					icon='NotificationsActive'
					accent='warning'
					index={2}
					span={primarySpan}>
					<StatusBadge status={tokenStatus || undefined} />
				</CurrentTokenFieldCard>

				{showQueue ? (
					<CurrentTokenFieldCard
						label='Queue'
						icon='Queue'
						accent='info'
						index={3}
						span={hasVisitor ? 'half' : 'third'}>
						{queueContent}
					</CurrentTokenFieldCard>
				) : null}

				{detailRows.map((row, idx) => (
					<CurrentTokenFieldCard
						key={row.label}
						label={row.label}
						icon={row.icon}
						accent={
							row.label === 'Email' || row.label === 'Phone'
								? 'primary'
								: row.label === 'Age'
									? 'warning'
									: 'secondary'
						}
						index={4 + idx}
						span={row.label === 'Remarks' || detailRows.length === 1 ? 'full' : 'half'}>
						{row.value}
					</CurrentTokenFieldCard>
				))}
			</div>
		</motion.div>
	);
};

export default CurrentVisitorPanel;

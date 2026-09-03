import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Icon from '../../../icon/Icon';
import type { TokenServingHistory } from '../../../../services/queueManagementApi';
import { formatDate } from '../../QueueManagement/queueManagementUtils';

type FieldAccent = 'primary' | 'info' | 'success' | 'warning' | 'secondary' | 'danger';

const FIELD_ACCENT: Record<FieldAccent, { card: string; iconBg: string; iconColor: FieldAccent }> = {
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
	danger: {
		card: 'schedule-detail-hover-card--danger',
		iconBg: 'rgba(246, 78, 96, 0.16)',
		iconColor: 'danger',
	},
};

const trimStr = (v: unknown): string | undefined => {
	if (v === null || v === undefined) return undefined;
	const s = String(v).trim();
	return s === '' ? undefined : s;
};

const servingHistoryEntryEnded = (h: TokenServingHistory): boolean => {
	if (h.exited_at) return true;
	if (
		h.completed_at ||
		h.cancelled_at ||
		h.no_show_marked_at ||
		h.postponed_at ||
		h.skipped_at
	)
		return true;
	const rel = h.relationship != null && String(h.relationship).trim() !== '';
	if (rel && h.duration != null && String(h.duration).trim() !== '') return true;
	return false;
};

const servingHistoryActor = (
	username?: string | null,
	userId?: number | null,
): string | undefined => {
	const u = trimStr(username);
	if (u) return u;
	if (userId != null && !Number.isNaN(Number(userId))) return `User #${userId}`;
	return undefined;
};

const formatWhen = (iso?: string | null): { dateLine: string; timeLine: string } => {
	if (!iso) return { dateLine: '—', timeLine: '' };
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return { dateLine: formatDate(iso), timeLine: '' };
	return {
		dateLine: d.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}),
		timeLine: d.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
		}),
	};
};

type HistoryField = {
	label: string;
	value: string;
	icon: string;
	accent: FieldAccent;
};

const buildHistoryFields = (h: TokenServingHistory, ended: boolean): HistoryField[] => {
	const fields: HistoryField[] = [];
	const rel = h.relationship?.toLowerCase();

	if (rel === 'parent') {
		const td = h.token_display?.trim();
		fields.push({
			label: 'Relationship',
			value: td ? `Parent token #${td}` : 'Parent token',
			icon: 'AccountTree',
			accent: 'primary',
		});
	} else if (rel === 'self') {
		fields.push({
			label: 'Relationship',
			value: 'This token',
			icon: 'ConfirmationNumber',
			accent: 'info',
		});
	}

	if (!ended) {
		fields.push({
			label: 'State',
			value: 'Still at counter',
			icon: 'HourglassTop',
			accent: 'info',
		});
	} else {
		const hasTerminal =
			!!h.completed_at ||
			!!h.cancelled_at ||
			!!h.no_show_marked_at ||
			!!h.postponed_at ||
			!!h.skipped_at ||
			!!h.exited_at;
		if (!hasTerminal) {
			fields.push({
				label: 'State',
				value: 'Visit ended',
				icon: 'Flag',
				accent: 'secondary',
			});
		}
	}

	const sp = trimStr(h.serving_point_name);
	if (sp) {
		fields.push({
			label: 'Serving point',
			value: sp,
			icon: 'Monitor',
			accent: 'info',
		});
	}

	if (h.entered_at) {
		fields.push({
			label: 'Entered at',
			value: formatDate(h.entered_at),
			icon: 'Login',
			accent: 'secondary',
		});
	}

	const served = servingHistoryActor(h.served_by_username, h.served_by);
	if (served) {
		fields.push({
			label: 'Served by',
			value: served,
			icon: 'SupportAgent',
			accent: 'primary',
		});
	}

	if (h.completed_at) {
		fields.push({
			label: 'Completed at',
			value: formatDate(h.completed_at),
			icon: 'TaskAlt',
			accent: 'success',
		});
	}
	const completedBy = servingHistoryActor(h.completed_by_username, h.completed_by);
	if (completedBy) {
		fields.push({
			label: 'Completed by',
			value: completedBy,
			icon: 'Person',
			accent: 'success',
		});
	}

	if (h.postponed_at) {
		fields.push({
			label: 'Postponed at',
			value: formatDate(h.postponed_at),
			icon: 'Update',
			accent: 'secondary',
		});
	}
	const postponedBy = servingHistoryActor(h.postponed_by_username, h.postponed_by);
	if (postponedBy) {
		fields.push({
			label: 'Postponed by',
			value: postponedBy,
			icon: 'Person',
			accent: 'secondary',
		});
	}

	if (h.cancelled_at) {
		fields.push({
			label: 'Cancelled at',
			value: formatDate(h.cancelled_at),
			icon: 'Cancel',
			accent: 'danger',
		});
	}
	const cancelledBy = servingHistoryActor(h.cancelled_by_username, h.cancelled_by);
	if (cancelledBy) {
		fields.push({
			label: 'Cancelled by',
			value: cancelledBy,
			icon: 'Person',
			accent: 'danger',
		});
	}

	if (h.skipped_at) {
		fields.push({
			label: 'Skipped at',
			value: formatDate(h.skipped_at),
			icon: 'SkipNext',
			accent: 'warning',
		});
	}
	const skippedBy = servingHistoryActor(h.skipped_by_username, h.skipped_by);
	if (skippedBy) {
		fields.push({
			label: 'Skipped by',
			value: skippedBy,
			icon: 'Person',
			accent: 'warning',
		});
	}

	if (h.no_show_marked_at) {
		fields.push({
			label: 'No-show at',
			value: formatDate(h.no_show_marked_at),
			icon: 'PersonOff',
			accent: 'warning',
		});
	}
	const noShowBy = servingHistoryActor(h.no_show_marked_by_username, h.no_show_marked_by);
	if (noShowBy) {
		fields.push({
			label: 'No-show by',
			value: noShowBy,
			icon: 'Person',
			accent: 'warning',
		});
	}

	if (h.exited_at) {
		fields.push({
			label: 'Exited at',
			value: formatDate(h.exited_at),
			icon: 'Logout',
			accent: 'secondary',
		});
	}

	const dur = trimStr(h.duration);
	if (dur) {
		fields.push({
			label: 'Duration',
			value: dur,
			icon: 'Timer',
			accent: 'info',
		});
	}

	const notes = trimStr(h.notes);
	if (notes) {
		fields.push({
			label: 'Notes',
			value: notes,
			icon: 'Notes',
			accent: 'secondary',
		});
	}

	return fields;
};

const entryAccent = (h: TokenServingHistory, ended: boolean): FieldAccent => {
	if (!ended) return 'info';
	if (h.completed_at) return 'success';
	if (h.cancelled_at) return 'danger';
	if (h.skipped_at || h.no_show_marked_at) return 'warning';
	if (h.postponed_at) return 'secondary';
	if (h.relationship?.toLowerCase() === 'parent') return 'primary';
	return 'success';
};

const entryIcon = (h: TokenServingHistory, ended: boolean): string => {
	if (!ended) return 'PlayCircle';
	if (h.completed_at) return 'TaskAlt';
	if (h.cancelled_at) return 'Cancel';
	if (h.skipped_at) return 'SkipNext';
	if (h.no_show_marked_at) return 'PersonOff';
	if (h.postponed_at) return 'Update';
	return 'Timeline';
};

const HistoryFieldTile: React.FC<{ field: HistoryField; index: number }> = ({ field, index }) => {
	const reduceMotion = useReducedMotion();
	const meta = FIELD_ACCENT[field.accent];

	return (
		<motion.div
			className='col-12 col-sm-6'
			initial={reduceMotion ? false : { opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				type: 'spring',
				stiffness: 420,
				damping: 30,
				delay: reduceMotion ? 0 : Math.min(index, 12) * 0.03,
			}}>
			<div
				className={`schedule-detail-hover-card schedule-detail-hover-card--no-top-accent ${meta.card} p-2 px-3 h-100 d-flex align-items-start gap-2`}>
				<span
					className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
					style={{ width: 28, height: 28, backgroundColor: meta.iconBg }}>
					<Icon icon={field.icon} color={meta.iconColor} size='sm' />
				</span>
				<div className='min-w-0 flex-grow-1'>
					<div className='text-muted' style={{ fontSize: '0.7rem' }}>
						{field.label}
					</div>
					<div className='fw-semibold small text-break' style={{ whiteSpace: 'pre-wrap' }}>
						{field.value}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export type TokenServingHistoryTimelineProps = {
	history: TokenServingHistory[];
	queueName?: string | null;
	scheduleLabel?: string | null;
	emptyText?: string;
	emptyHelpText?: string;
};

const TokenServingHistoryTimeline: React.FC<TokenServingHistoryTimelineProps> = ({
	history,
	queueName,
	scheduleLabel,
	emptyText = 'No serving history yet.',
	emptyHelpText = 'Visits to counters will appear here once recorded.',
}) => {
	const reduceMotion = useReducedMotion();

	const sorted = useMemo(() => {
		return [...history].sort((a, b) => {
			const ta = a.entered_at ? Date.parse(a.entered_at) : 0;
			const tb = b.entered_at ? Date.parse(b.entered_at) : 0;
			return ta - tb;
		});
	}, [history]);

	if (!sorted.length) {
		return (
			<div className='text-center py-5 px-3'>
				<div
					className='d-inline-flex align-items-center justify-content-center rounded-4 mb-3'
					style={{
						width: 56,
						height: 56,
						backgroundColor: 'color-mix(in srgb, var(--bs-primary) 12%, #ffffff)',
					}}>
					<Icon icon='Timeline' color='primary' />
				</div>
				<div className='fw-semibold text-body mb-1'>{emptyText}</div>
				<div className='small text-muted'>{emptyHelpText}</div>
			</div>
		);
	}

	const railCenterPx = 15;

	return (
		<div
			className='overflow-auto pe-1 token-serving-history-scroll'
			style={{ maxHeight: 'min(52vh, 28rem)' }}>
			<div className='position-relative pt-1 pb-1'>
				<div
					className='position-absolute top-0 bottom-0 rounded-pill opacity-90'
					aria-hidden
					style={{
						left: railCenterPx,
						width: 3,
						transform: 'translateX(-50%)',
						background:
							'linear-gradient(180deg, color-mix(in srgb, var(--bs-primary) 45%, transparent) 0%, var(--bs-secondary-bg) 100%)',
					}}
				/>

				<ul className='list-unstyled mb-0' aria-label='Serving history timeline'>
					{sorted.map((h, idx) => {
						const ended = servingHistoryEntryEnded(h);
						const accent = entryAccent(h, ended);
						const accentMeta = FIELD_ACCENT[accent];
						const icon = entryIcon(h, ended);
						const fields = buildHistoryFields(h, ended);
						const { dateLine, timeLine } = formatWhen(h.entered_at);
						const isLast = idx === sorted.length - 1;
						const isParent = h.relationship?.toLowerCase() === 'parent';
						const pointLabel =
							h.serving_point_name?.trim() || `Serving point #${h.serving_point}`;
						const title =
							isParent && h.token_display?.trim()
								? `Parent token #${h.token_display.trim()}`
								: ended
									? pointLabel
									: `At counter · ${pointLabel}`;
						const actor =
							trimStr(h.served_by_username) ||
							trimStr(h.completed_by_username) ||
							trimStr(h.postponed_by_username) ||
							trimStr(h.cancelled_by_username) ||
							trimStr(h.skipped_by_username) ||
							trimStr(h.no_show_marked_by_username) ||
							undefined;

						return (
							<motion.li
								key={`sh-${h.id}-${idx}`}
								className={`position-relative ${isLast ? '' : 'pb-4'}`}
								initial={reduceMotion ? false : { opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									type: 'spring',
									stiffness: 380,
									damping: 28,
									delay: reduceMotion ? 0 : Math.min(idx, 8) * 0.05,
								}}>
								<div
									className='position-absolute rounded-circle'
									aria-hidden
									style={{
										width: 14,
										height: 14,
										left: railCenterPx - 7,
										top: 22,
										borderWidth: 2,
										borderStyle: 'solid',
										borderColor: `var(--bs-${accent})`,
										backgroundColor: `var(--bs-${accent})`,
										boxShadow: '0 0 0 3px var(--bs-body-bg)',
									}}
								/>

								<div style={{ paddingLeft: '2.85rem' }}>
									<div
										className={`schedule-detail-hover-card schedule-detail-hover-card--no-top-accent schedule-detail-hover-card--lift-left ${accentMeta.card} rounded-4 p-3 overflow-hidden`}
										style={{
											borderInlineStartWidth: 4,
											borderInlineStartStyle: 'solid',
											borderInlineStartColor: `var(--bs-${accent})`,
										}}>
										<div className='d-flex flex-wrap align-items-start justify-content-between gap-2 mb-3'>
											<div className='d-flex align-items-start gap-3 min-w-0'>
												<span
													className='d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0'
													style={{
														width: 42,
														height: 42,
														backgroundColor: accentMeta.iconBg,
													}}>
													<Icon icon={icon} color={accentMeta.iconColor} />
												</span>
												<div className='min-w-0'>
													<h6 className='mb-1 fw-semibold text-body lh-sm'>{title}</h6>
													<div className='d-flex flex-wrap align-items-center gap-2'>
														{isParent ? (
															<span className='badge rounded-pill bg-primary bg-opacity-10 text-primary'>
																Parent
															</span>
														) : h.relationship?.toLowerCase() === 'self' ? (
															<span className='badge rounded-pill bg-info bg-opacity-10 text-info'>
																This token
															</span>
														) : null}
														{!ended ? (
															<span className='badge rounded-pill bg-info bg-opacity-10 text-info'>
																Active
															</span>
														) : null}
													</div>
												</div>
											</div>
											<div className='text-end flex-shrink-0'>
												<div className='fw-semibold text-body text-nowrap small'>{dateLine}</div>
												{timeLine ? (
													<div
														className='text-muted small fw-medium'
														style={{ fontVariantNumeric: 'tabular-nums' }}>
														{timeLine}
													</div>
												) : null}
											</div>
										</div>

										{fields.length > 0 ? (
											<div className='row g-2 schedule-detail-hover-grid mb-3'>
												{fields.map((field, fi) => (
													<HistoryFieldTile key={`${field.label}-${fi}`} field={field} index={fi} />
												))}
											</div>
										) : null}

										{(actor || queueName || scheduleLabel || h.serving_point_name) && (
											<div className='d-flex flex-wrap align-items-center gap-2 pt-1 border-top border-secondary border-opacity-25'>
												{actor ? (
													<span className='d-inline-flex align-items-center gap-1 small'>
														<Icon icon='Person' size='sm' />
														<span className='fw-medium text-body'>{actor}</span>
													</span>
												) : null}
												{queueName ? (
													<span className='badge rounded-pill border border-secondary text-body fw-normal bg-transparent'>
														{queueName}
													</span>
												) : null}
												{scheduleLabel ? (
													<span
														className='badge rounded-pill border border-primary text-primary-emphasis fw-normal bg-transparent text-truncate'
														style={{ maxWidth: '100%' }}
														title={scheduleLabel}>
														{scheduleLabel}
													</span>
												) : null}
												{h.serving_point_name ? (
													<span className='d-inline-flex align-items-center gap-1 small text-body-secondary'>
														<Icon icon='Monitor' size='sm' color='info' />
														<span className='text-body'>{h.serving_point_name}</span>
													</span>
												) : null}
											</div>
										)}
									</div>
								</div>
							</motion.li>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

export default TokenServingHistoryTimeline;

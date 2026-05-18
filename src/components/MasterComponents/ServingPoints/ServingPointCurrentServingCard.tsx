import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import SplitDropdownButton from '../../CustomComponent/Buttons/SplitDropdownButton';
import Icon from '../../icon/Icon';
import StatusBadge from '../../BadgeWithIcon.jsx';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type CurrentServingWindowResponse,
	type QueueSchedule,
	type ScheduleServingPoint,
	type ServingPoint,
	type Token,
	queuesApi,
	schedulesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';
import {
	formatDate,
	getNextAllowedServingPointStatuses,
	getTokenDisplay,
	getWindowServingPointStatus,
	normalizeServingPointStatus,
	SP_STATUS_LABELS,
} from '../QueueManagement/queueManagementUtils';

export interface ServingPointCurrentServingCardProps {
	servingPointId: number;
	/** Bump to refetch after parent updates the serving point. */
	refreshKey?: number;
	onServingPointUpdated?: (point: ServingPoint) => void;
}

const getCurrentToken = (row: ScheduleServingPoint): Token | null => {
	const nested = row.current_token;
	if (
		nested &&
		typeof nested === 'object' &&
		nested !== null &&
		('token_number' in nested || 'token_display' in nested)
	) {
		return nested as Token;
	}
	return null;
};

const getWindowCurrentTokenDisplay = (row: ScheduleServingPoint): string | null => {
	const t = getCurrentToken(row);
	if (t) {
		const label = getTokenDisplay(t);
		if (label !== '—') return label;
	}
	if (row.current_token_number != null && String(row.current_token_number).trim() !== '') {
		return String(row.current_token_number).trim();
	}
	const nested = row.current_token;
	if (typeof nested === 'number') return String(nested);
	return null;
};

const getWindowCurrentTokenStatusRaw = (row: ScheduleServingPoint): string => {
	if (row.current_token_status) return row.current_token_status;
	const t = getCurrentToken(row);
	if (t?.status) return t.status;
	return '';
};

const normalizeTokenStatus = (status?: string) => (status || '').toLowerCase().trim();

const ServingPointCurrentServingCard: React.FC<ServingPointCurrentServingCardProps> = ({
	servingPointId,
	refreshKey,
	onServingPointUpdated,
}) => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [payload, setPayload] = useState<CurrentServingWindowResponse | null>(null);
	const [schedule, setSchedule] = useState<QueueSchedule | null>(null);

	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	const onServingPointUpdatedRef = useRef(onServingPointUpdated);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);
	useEffect(() => {
		onServingPointUpdatedRef.current = onServingPointUpdated;
	}, [onServingPointUpdated]);

	const load = useCallback(async () => {
		if (!servingPointId || Number.isNaN(servingPointId)) {
			setPayload(null);
			setSchedule(null);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const res = await queuesApi.currentServingWindow(servingPointId);
			setPayload(res);
			onServingPointUpdatedRef.current?.(res.serving_point);
			if (res.active_window?.queue_schedule) {
				try {
					const sched = await schedulesApi.get(res.active_window.queue_schedule);
					setSchedule(sched);
				} catch {
					setSchedule(null);
				}
			} else {
				setSchedule(null);
			}
		} catch (err) {
			errorNotifierRef.current(err);
			setPayload(null);
			setSchedule(null);
		} finally {
			setLoading(false);
		}
	}, [servingPointId]);

	useEffect(() => {
		void load();
	}, [load, refreshKey]);

	const windowRow = payload?.active_window ?? null;
	const servingPoint = payload?.serving_point ?? null;

	const triggerWindowAction = async (
		row: ScheduleServingPoint,
		action: 'start' | 'complete' | 'cancel' | 'no_show' | 'postpone',
		opts?: { serving_point_status?: string },
	) => {
		setActionLoading(`${action}-${row.id}`);
		const apiOpts = opts?.serving_point_status?.trim()
			? { serving_point_status: opts.serving_point_status.trim() }
			: undefined;
		try {
			if (action === 'start') await scheduleServingPointsApi.startServing(row.id);
			if (action === 'complete') await scheduleServingPointsApi.complete(row.id, apiOpts);
			if (action === 'cancel') await scheduleServingPointsApi.cancel(row.id, apiOpts);
			if (action === 'no_show') await scheduleServingPointsApi.noShow(row.id, apiOpts);
			if (action === 'postpone') await scheduleServingPointsApi.postpone(row.id, apiOpts);
			const st = opts?.serving_point_status?.trim();
			if (st) {
				const slab = SP_STATUS_LABELS[st] ?? st.replace(/_/g, ' ');
				const prefix =
					action === 'complete'
						? 'Service completed'
						: action === 'cancel'
							? 'Token cancelled'
							: action === 'no_show'
								? 'No show recorded'
								: 'Token postponed';
				showSuccessNotification(`${prefix}; counter set to ${slab}.`);
			} else {
				showSuccessNotification('Window token updated successfully.');
			}
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setActionLoading(null);
		}
	};

	const triggerSkipToken = async (
		row: ScheduleServingPoint,
		opts?: { serving_point_status?: string },
	) => {
		setActionLoading(`skip-${row.id}`);
		try {
			await scheduleServingPointsApi.skipToken(
				row.id,
				opts?.serving_point_status?.trim()
					? { serving_point_status: opts.serving_point_status.trim() }
					: undefined,
			);
			const st = opts?.serving_point_status?.trim();
			showSuccessNotification(
				st
					? `Token skipped; counter set to ${SP_STATUS_LABELS[st] ?? st.replace(/_/g, ' ')}.`
					: 'Token skipped. The queue will advance to the next token.',
			);
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setActionLoading(null);
		}
	};

	const visibleTokenActions = useMemo(() => {
		if (!windowRow) return [];
		const tokenStatus = normalizeTokenStatus(getWindowCurrentTokenStatusRaw(windowRow));
		const canStart = tokenStatus === 'registred' || tokenStatus === 'reported';
		const canComplete = tokenStatus === 'serving';
		const canCancel =
			tokenStatus === 'registred' || tokenStatus === 'reported' || tokenStatus === 'serving';
		const canNoShow = canCancel;
		const canPostpone = canCancel && Boolean(schedule?.allow_postpone);
		const allowed = { canStart, canComplete, canCancel, canNoShow, canPostpone };
		const rows: Array<{
			key: 'start' | 'complete' | 'cancel' | 'no_show' | 'postpone';
			label: string;
			icon: string;
			color: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
			show: boolean;
			outline?: boolean;
			tooltip: string;
		}> = [
			{
				key: 'start',
				label: 'Start serving',
				icon: 'PlayCircle',
				color: 'primary',
				show: allowed.canStart,
				tooltip: 'Begin serving this token at this window (registered or reported).',
			},
			{
				key: 'complete',
				label: 'Complete',
				icon: 'TaskAlt',
				color: 'success',
				show: allowed.canComplete,
				tooltip: 'Mark the current service as finished for this token.',
			},
			{
				key: 'postpone',
				label: 'Postpone',
				icon: 'Update',
				color: 'secondary',
				show: allowed.canPostpone,
				tooltip: 'Return this token to the queue to be called again later.',
			},
			{
				key: 'no_show',
				label: 'No show',
				icon: 'PersonOff',
				color: 'warning',
				show: allowed.canNoShow,
				tooltip: 'Record that the customer did not arrive for this token.',
			},
			{
				key: 'cancel',
				label: 'Cancel token',
				icon: 'Cancel',
				color: 'danger',
				show: allowed.canCancel,
				tooltip: 'Cancel this token at this window.',
			},
		];
		return rows.filter((r) => r.show);
	}, [windowRow, schedule?.allow_postpone]);

	const windowSpStatus = windowRow
		? getWindowServingPointStatus(windowRow) ?? servingPoint?.status
		: servingPoint?.status;

	const openWindowDetail = () => {
		if (!windowRow?.id) return;
		navigate(`/serving-points/${servingPointId}/windows/${windowRow.id}`, {
			state: {
				from: 'serving-point',
				servingPointPath: `/serving-points/${servingPointId}`,
				servingPointName: servingPoint?.name,
			},
		});
	};

	return (
		<Card className='border-0 shadow-sm rounded-4 overflow-visible'>
			<CardHeader>
				<CardLabel icon='ConfirmationNumber'>
					<CardTitle tag='h5'>Current token</CardTitle>
				</CardLabel>
				{windowRow?.id != null && (
					<Button color='info' isLight size='sm' icon='OpenInNew' onClick={openWindowDetail}>
						Open serving window
					</Button>
				)}
			</CardHeader>
			<CardBody className='p-0'>
				{loading ? (
					<div className='d-flex justify-content-center align-items-center gap-2 py-5 text-muted'>
						<Spinner color='primary' />
						<span>Loading current token…</span>
					</div>
				) : !windowRow ? (
					<div className='text-muted p-4 p-lg-5 d-flex align-items-center gap-4'>
						<div className='queue-modern-card__icon-box flex-shrink-0 rounded-3 opacity-75'>
							<Icon icon='ConfirmationNumber' className='queue-modern-card__icon' />
						</div>
						<div>
							<div className='fw-semibold text-body fs-5'>No token at this counter</div>
							<div className='small mt-1 text-body-secondary'>
								{payload?.detail?.trim() ||
									'No current token is assigned to any serving window on this counter.'}
							</div>
						</div>
					</div>
				) : (
					(() => {
						const tokenDisplay = getWindowCurrentTokenDisplay(windowRow);
						const token = getCurrentToken(windowRow);
						const tokStatus = getWindowCurrentTokenStatusRaw(windowRow);
						const user = token?.token_user;

						const detailRows: Array<{ icon: string; label: string; value: string }> = [];
						if (user?.email?.trim())
							detailRows.push({ icon: 'Email', label: 'Email', value: user.email.trim() });
						if (user?.phone?.trim())
							detailRows.push({ icon: 'Phone', label: 'Phone', value: user.phone.trim() });
						if (user?.age != null && String(user.age).trim() !== '')
							detailRows.push({ icon: 'Cake', label: 'Age', value: String(user.age) });
						if (user?.place?.trim())
							detailRows.push({ icon: 'Place', label: 'Place', value: user.place.trim() });
						if (user?.remarks?.trim())
							detailRows.push({ icon: 'Notes', label: 'Remarks', value: user.remarks.trim() });

						const spStatusMenuChoices = ['on_hold', 'completed', 'cancelled'] as const;
						const allowedSpTransitions = getNextAllowedServingPointStatuses(windowSpStatus);
						const showCounterStatusMenu = normalizeServingPointStatus(windowSpStatus) === 'running';

						const skipMenuItems = showCounterStatusMenu
							? spStatusMenuChoices
									.filter((st) => allowedSpTransitions.includes(st))
									.map((st) => ({
										label: `Skip & set counter to ${SP_STATUS_LABELS[st] ?? st.replace(/_/g, ' ')}`,
										onClick: () => {
											void triggerSkipToken(windowRow, { serving_point_status: st });
										},
									}))
							: [];

						type TokenSplitActionKey = 'complete' | 'cancel' | 'no_show' | 'postpone';
						const tokenActionMenuVerb: Record<TokenSplitActionKey, string> = {
							complete: 'Complete',
							cancel: 'Cancel token',
							no_show: 'No show',
							postpone: 'Postpone',
						};

						const tokenActionStatusMenuItems = (action: TokenSplitActionKey) =>
							showCounterStatusMenu
								? spStatusMenuChoices
										.filter((st) => allowedSpTransitions.includes(st))
										.map((st) => ({
											label: `${tokenActionMenuVerb[action]} & set counter to ${
												SP_STATUS_LABELS[st] ?? st.replace(/_/g, ' ')
											}`,
											onClick: () => {
												void triggerWindowAction(windowRow, action, { serving_point_status: st });
											},
										}))
								: [];

						if (!tokenDisplay) {
							return (
								<div className='text-muted p-4 p-lg-5'>
									<div className='fw-semibold text-body'>Active window</div>
									<div className='small mt-1'>
										{windowRow.serving_point_name || servingPoint?.name} ·{' '}
										{formatDate(windowRow.from_datetime)} – {formatDate(windowRow.to_datetime)}
									</div>
									<div className='small mt-2 text-body-secondary'>
										A serving window is active but no token details are available yet.
									</div>
									<Button
										color='info'
										isLight
										size='sm'
										className='mt-3'
										icon='OpenInNew'
										onClick={openWindowDetail}>
										Open serving window
									</Button>
								</div>
							);
						}

						return (
							<div className='p-4'>
								<div className='d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3'>
									<div className='d-flex align-items-center gap-2'>
										<Icon icon='Person' className='text-primary' size='sm' />
										<span className='small text-uppercase fw-semibold text-muted'>
											Current visitor
										</span>
									</div>
									<div className='d-flex flex-wrap align-items-center gap-2 small text-muted'>
										<span>Window #{windowRow.id}</span>
										<span>·</span>
										<span>
											{formatDate(windowRow.from_datetime)} –{' '}
											{formatDate(windowRow.to_datetime)}
										</span>
										<StatusBadge status={windowSpStatus || undefined} emptyFallback='—' />
									</div>
								</div>
								<div className='row g-4 align-items-start'>
									<div className='col-12 col-lg-6'>
										<div className='display-5 fw-bold text-primary lh-sm mb-1'>{tokenDisplay}</div>
										{user?.name?.trim() ? (
											<div className='fs-4 fw-semibold text-body-emphasis mb-3'>
												{user.name.trim()}
											</div>
										) : null}
										<div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
											<span className='text-muted small'>Token status</span>
											<StatusBadge status={tokStatus || undefined} />
										</div>
										{detailRows.length > 0 && (
											<ul className='list-unstyled mb-0 d-flex flex-column gap-2'>
												{detailRows.map((row) => (
													<li key={row.label} className='d-flex align-items-start gap-2'>
														<Icon
															icon={row.icon}
															color='primary'
															size='sm'
															className='mt-1 flex-shrink-0'
														/>
														<div>
															<span className='text-muted small'>{row.label}: </span>
															<span className='fw-medium text-break'>{row.value}</span>
														</div>
													</li>
												))}
											</ul>
										)}
									</div>
									<div className='col-12 col-lg-6 d-flex flex-wrap align-items-start gap-2 pt-lg-1'>
										{visibleTokenActions.map((a) => {
											if (a.key === 'start') {
												return (
													<Tooltip key={a.key} title={a.tooltip} arrow placement='top'>
														<span className='d-inline-flex'>
															<Button
																color={a.color}
																isOutline={Boolean(a.outline)}
																isLight={!a.outline}
																icon={a.icon}
																isDisable={actionLoading === `${a.key}-${windowRow.id}`}
																onClick={() => void triggerWindowAction(windowRow, a.key)}>
																{a.label}
															</Button>
														</span>
													</Tooltip>
												);
											}
											const statusMenuItems = tokenActionStatusMenuItems(a.key);
											return (
												<Tooltip
													key={a.key}
													title={
														statusMenuItems.length > 0
															? `${a.tooltip} Use the menu to perform the same action and set the counter (on hold, completed, or cancelled).`
															: a.tooltip
													}
													arrow
													placement='top'>
													<span className='d-inline-flex'>
														<SplitDropdownButton
															mainLabel={a.label}
															mainIcon={a.icon}
															color={a.color}
															mainIsLight={!a.outline}
															isOutline={Boolean(a.outline)}
															dropdownDirection='down'
															mainTitle={
																statusMenuItems.length > 0
																	? `${String(a.label)} only (counter status unchanged).`
																	: undefined
															}
															isDisable={actionLoading === `${a.key}-${windowRow.id}`}
															onMainClick={() => void triggerWindowAction(windowRow, a.key)}
															menuItems={statusMenuItems}
														/>
													</span>
												</Tooltip>
											);
										})}
										<Tooltip
											title={
												skipMenuItems.length > 0
													? 'Skip token: main advances only. Menu skips and sets counter (on hold, completed, or cancelled).'
													: 'Skip this token and advance to the next in line.'
											}
											arrow
											placement='top'>
											<span className='d-inline-flex'>
												<SplitDropdownButton
													mainLabel='Skip token'
													mainIcon='SkipNext'
													color='dark'
													mainIsLight
													dropdownDirection='down'
													mainTitle='Skip this token and advance (no counter status change).'
													isDisable={actionLoading === `skip-${windowRow.id}`}
													onMainClick={() => void triggerSkipToken(windowRow)}
													menuItems={skipMenuItems}
												/>
											</span>
										</Tooltip>
										{visibleTokenActions.length === 0 && (
											<p className='text-muted small mb-0 w-100'>
												No actions are available for this token right now.
											</p>
										)}
									</div>
								</div>
							</div>
						);
					})()
				)}
			</CardBody>
		</Card>
	);
};

export default ServingPointCurrentServingCard;

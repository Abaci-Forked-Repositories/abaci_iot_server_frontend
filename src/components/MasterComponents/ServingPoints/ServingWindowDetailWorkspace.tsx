import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Card, { CardBody } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import StatusBadge from '../../BadgeWithIcon.jsx';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type QueueSchedule,
	type ScheduleServingPoint,
	type ServingPoint,
	type Token,
	queuesApi,
	schedulesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';
import { setBreadcrumbs, setHeaderTitle } from '../../../store/uiSlice';
import {
	formatDate,
	getNextAllowedServingPointStatuses,
	getWindowServingPointStatus,
	isServingWindowEndInFuture,
	SP_STATUS_COLORS,
	SP_STATUS_LABELS,
	servingPointQueueIds,
} from '../QueueManagement/queueManagementUtils';

export type ServingWindowNavState = {
	from?: 'schedule' | 'serving-point';
	queueId?: number;
	queueName?: string;
	queueDetailPath?: string;
	scheduleId?: number;
	schedulePath?: string;
	servingPointPath?: string;
	servingPointName?: string;
};

const getCurrentToken = (row: ScheduleServingPoint): Token | null => {
	const nested = row.current_token;
	if (nested && typeof nested === 'object' && nested !== null && 'token_number' in nested) {
		return nested as Token;
	}
	return null;
};

const getWindowCurrentTokenNumber = (row: ScheduleServingPoint): string | null => {
	const t = getCurrentToken(row);
	if (t?.token_number) return t.token_number;
	if (row.current_token_number) return row.current_token_number;
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

const ServingWindowDetailWorkspace: React.FC = () => {
	const { servingPointId, windowId } = useParams<{ servingPointId: string; windowId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const nav = (location.state as ServingWindowNavState | null) ?? null;
	const scheduleEntryPath = nav?.schedulePath;
	const servingPointEntryPath = nav?.servingPointPath;
	const servingPointEntryName = nav?.servingPointName;
	const queueNameFromNav = nav?.queueName;
	const queueDetailPathFromNav = nav?.queueDetailPath;
	const queueIdFromNav = nav?.queueId;
	const pointParam = Number(servingPointId);
	const windowNumericId = Number(windowId);

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [windowRow, setWindowRow] = useState<ScheduleServingPoint | null>(null);
	const [servingPoint, setServingPoint] = useState<ServingPoint | null>(null);
	const [schedule, setSchedule] = useState<QueueSchedule | null>(null);
	const [statusModalWindow, setStatusModalWindow] = useState<ScheduleServingPoint | null>(null);
	const [statusFormValue, setStatusFormValue] = useState('');
	const [statusSaving, setStatusSaving] = useState(false);

	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const load = useCallback(async () => {
		if (!windowNumericId || Number.isNaN(windowNumericId)) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const win = await scheduleServingPointsApi.get(windowNumericId);
			if (Number.isFinite(pointParam) && !Number.isNaN(pointParam) && win.serving_point !== pointParam) {
				navigate(`/serving-points/${win.serving_point}/windows/${win.id}`, {
					replace: true,
					state: location.state,
				});
				return;
			}
			const [pointRes, scheduleRes] = await Promise.all([
				queuesApi.getServingPoint(win.serving_point),
				schedulesApi.get(win.queue_schedule),
			]);
			setWindowRow(win);
			setServingPoint(pointRes);
			setSchedule(scheduleRes);
		} catch (err) {
			errorNotifierRef.current(err);
			setWindowRow(null);
			setServingPoint(null);
			setSchedule(null);
		} finally {
			setLoading(false);
		}
	}, [windowNumericId, pointParam, navigate, location.state]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!statusModalWindow) return;
		const allowed = getNextAllowedServingPointStatuses(getWindowServingPointStatus(statusModalWindow));
		setStatusFormValue(allowed[0] ?? '');
	}, [statusModalWindow]);

	const handleSubmitServingPointStatus = useCallback(
		async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (!statusModalWindow?.serving_point) return;
			const current = getWindowServingPointStatus(statusModalWindow);
			const allowed = getNextAllowedServingPointStatuses(current);
			if (!statusFormValue || !allowed.includes(statusFormValue)) {
				showErrorNotification('Selected status transition is not allowed.');
				return;
			}
			setStatusSaving(true);
			try {
				await queuesApi.updateServingPoint(statusModalWindow.serving_point, { status: statusFormValue });
				showSuccessNotification('Serving point status updated successfully.');
				setStatusModalWindow(null);
				await load();
			} catch (err) {
				showErrorNotification(err);
			} finally {
				setStatusSaving(false);
			}
		},
		[statusModalWindow, statusFormValue, load, showErrorNotification, showSuccessNotification],
	);

	const backTarget = useMemo(() => {
		if (scheduleEntryPath) {
			return { path: scheduleEntryPath, label: 'Back to schedule' };
		}
		const spId =
			windowRow?.serving_point ??
			(Number.isFinite(pointParam) && !Number.isNaN(pointParam) ? pointParam : null);
		const path =
			servingPointEntryPath ??
			(spId != null && !Number.isNaN(spId) ? `/serving-points/${spId}` : '/serving-points');
		return { path, label: 'Back to serving point' };
	}, [scheduleEntryPath, servingPointEntryPath, windowRow?.serving_point, pointParam]);

	useEffect(() => {
		if (!windowRow) return;
		const currentPath = location.pathname;
		const spPath =
			servingPointEntryPath ?? `/serving-points/${windowRow.serving_point}`;
		const spLabel =
			servingPointEntryName ??
			windowRow.serving_point_name ??
			`Serving point ${windowRow.serving_point}`;

		if (scheduleEntryPath) {
			const qId = schedule?.queue ?? queueIdFromNav;
			const qLabel =
				queueNameFromNav ?? schedule?.queue_name ?? (qId ? `Queue ${qId}` : 'Queue');
			const queuePath =
				queueDetailPathFromNav ??
				(qId != null && qId > 0 ? `/queue-management/${qId}` : '/queue-management');
			const schedId = schedule?.id ?? nav?.scheduleId ?? windowRow.queue_schedule;
			const schedLabel =
				schedule?.description?.trim() ||
				(typeof schedId === 'number' ? `Schedule #${schedId}` : 'Schedule');
			dispatch(setHeaderTitle({ name: `${spLabel} · Serving window`, isEditable: false }));
			dispatch(
				setBreadcrumbs([
					{ label: 'Queue Management', path: '/queue-management' },
					{ label: qLabel, path: queuePath },
					{ label: schedLabel, path: scheduleEntryPath },
					{ label: 'Serving window', path: currentPath },
				]),
			);
			return;
		}

		dispatch(setHeaderTitle({ name: `${spLabel} · Serving window`, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: 'Serving points', path: '/serving-points' },
				{ label: spLabel, path: spPath },
				{ label: 'Serving window', path: currentPath },
			]),
		);
	}, [
		dispatch,
		location.pathname,
		schedule,
		scheduleEntryPath,
		windowRow,
		queueDetailPathFromNav,
		queueIdFromNav,
		queueNameFromNav,
		nav?.scheduleId,
		servingPointEntryName,
		servingPointEntryPath,
	]);

	useEffect(
		() => () => {
			dispatch(setBreadcrumbs([]));
		},
		[dispatch],
	);

	const getAllowedActions = (row: ScheduleServingPoint) => {
		const tokenStatus = normalizeTokenStatus(getWindowCurrentTokenStatusRaw(row));
		const canStart = tokenStatus === 'registred' || tokenStatus === 'reported';
		const canComplete = tokenStatus === 'serving';
		const canCancel = tokenStatus === 'registred' || tokenStatus === 'reported' || tokenStatus === 'serving';
		const canNoShow = canCancel;
		const canPostpone = canCancel && Boolean(schedule?.allow_postpone);
		return { canStart, canComplete, canCancel, canNoShow, canPostpone };
	};

	const triggerWindowAction = async (
		row: ScheduleServingPoint,
		action: 'start' | 'complete' | 'cancel' | 'no_show' | 'postpone',
	) => {
		setActionLoading(`${action}-${row.id}`);
		try {
			if (action === 'start') await scheduleServingPointsApi.startServing(row.id);
			if (action === 'complete') await scheduleServingPointsApi.complete(row.id);
			if (action === 'cancel') await scheduleServingPointsApi.cancel(row.id);
			if (action === 'no_show') await scheduleServingPointsApi.noShow(row.id);
			if (action === 'postpone') await scheduleServingPointsApi.postpone(row.id);
			showSuccessNotification('Window token updated successfully.');
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setActionLoading(null);
		}
	};

	const triggerSkipToken = async (row: ScheduleServingPoint) => {
		setActionLoading(`skip-${row.id}`);
		try {
			await scheduleServingPointsApi.skipToken(row.id);
			showSuccessNotification('Token skipped. The queue will advance to the next token.');
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setActionLoading(null);
		}
	};

	const visibleTokenActions = useMemo(() => {
		if (!windowRow) return [];
		const allowed = getAllowedActions(windowRow);
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
				outline: true,
				tooltip: 'Cancel this token at this window.',
			},
		];
		return rows.filter((r) => r.show);
	}, [windowRow, schedule?.allow_postpone]);

	if (!windowNumericId || Number.isNaN(windowNumericId)) {
		return <div className='alert alert-warning'>Invalid serving window.</div>;
	}

	const windowSpStatus = windowRow ? getWindowServingPointStatus(windowRow) : undefined;
	const canEditServingPointStatus =
		Boolean(windowRow) &&
		isServingWindowEndInFuture(windowRow!) &&
		getNextAllowedServingPointStatuses(windowSpStatus).length > 0;

	return (
		<div className='d-grid gap-4'>
			<Card className='border-0 shadow-sm rounded-4 overflow-hidden'>
				<CardBody className='p-0'>
					<div className='d-flex flex-column flex-lg-row'>
						<div className='p-4 p-lg-4 flex-grow-1'>
							<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap'>
								<div className='d-flex align-items-start gap-3'>
									<div className='queue-modern-card__icon-box flex-shrink-0 rounded-3'>
										<Icon icon='Schedule' className='queue-modern-card__icon' />
									</div>
									<div>
										<div className='text-muted small mb-1 text-uppercase fw-semibold'>
											Serving window
										</div>
										<div className='h4 mb-1 fw-bold'>
											{windowRow?.serving_point_name
												? `${windowRow.serving_point_name}`
												: `Window #${windowNumericId}`}
										</div>
										{windowRow?.serving_point_name && windowRow?.id != null && (
											<div className='text-muted small mb-2'>Window #{windowRow.id}</div>
										)}
										<div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
											<Icon icon='DateRange' className='text-primary' size='sm' />
											<span className='text-body-secondary small'>
												{windowRow
													? `${formatDate(windowRow.from_datetime)} – ${formatDate(windowRow.to_datetime)}`
													: '—'}
											</span>
										</div>
										{windowRow && (
											<div className='d-flex align-items-center gap-2 flex-wrap'>
												<span className='text-muted small'>Serving point status</span>
												<StatusBadge status={windowSpStatus || undefined} emptyFallback='—' />
												{canEditServingPointStatus && (
													<Tooltip title='Change serving point status'>
														<span className='d-inline-flex'>
															<Button
																color='primary'
																isLight
																size='sm'
																icon='Edit'
																onClick={() => setStatusModalWindow(windowRow)}
															>
																Change status
															</Button>
														</span>
													</Tooltip>
												)}
											</div>
										)}
									</div>
								</div>
								<div className='d-flex flex-wrap gap-2 align-items-center'>
									{windowRow?.queue_schedule != null && (
										<Tooltip title='Open the parent schedule in queue management.' arrow>
											<span className='d-inline-flex'>
												<Button
													color='info'
													isLight
													icon='CalendarMonth'
													onClick={() =>
														navigate(`/queue-management/schedules/${windowRow.queue_schedule}`, {
															state: {
																queueId: schedule?.queue ?? queueIdFromNav,
																queueName: schedule?.queue_name ?? queueNameFromNav,
																queueDetailPath:
																	schedule?.queue != null
																		? `/queue-management/${schedule.queue}`
																		: queueDetailPathFromNav,
															},
														})
													}>
													Open schedule
												</Button>
											</span>
										</Tooltip>
									)}
									<Tooltip title={backTarget.label} arrow>
										<span className='d-inline-flex'>
											<Button
												color='dark'
												isLight
												icon='ArrowBack'
												onClick={() => navigate(backTarget.path)}>
												{backTarget.label}
											</Button>
										</span>
									</Tooltip>
								</div>
							</div>
						</div>
					</div>

					{loading ? (
						<div className='text-muted px-4 pb-4'>Loading window details...</div>
					) : !windowRow ? (
						<div className='alert alert-warning mx-4 mb-4'>Serving window could not be loaded.</div>
					) : (
						<div className='row g-3 px-4 pb-4 border-top border-secondary border-opacity-25 pt-3 mx-0 bg-body-secondary bg-opacity-50'>
							<div className='col-12 col-sm-6 col-md-4'>
								<div className='small text-muted text-uppercase fw-semibold'>Serving point</div>
								<div className='fw-semibold'>
									{servingPoint?.name ||
										windowRow.serving_point_name ||
										`#${windowRow.serving_point}`}
								</div>
							</div>
							<div className='col-12 col-sm-6 col-md-4'>
								<div className='small text-muted text-uppercase fw-semibold'>Queue</div>
								<div className='fw-semibold'>
									{(servingPoint as (ServingPoint & { queue_name?: string }) | null)?.queue_name ||
										(schedule?.queue_name != null
											? schedule.queue_name
											: windowRow.queue_schedule_queue_id != null
												? `Queue #${windowRow.queue_schedule_queue_id}`
												: (() => {
													const ids = servingPoint ? servingPointQueueIds(servingPoint) : [];
													return ids.length ? ids.map((qid) => `Queue #${qid}`).join(', ') : '—';
												})())}
								</div>
							</div>
							<div className='col-12 col-sm-6 col-md-4'>
								<div className='small text-muted text-uppercase fw-semibold'>Created</div>
								<div className='fw-semibold'>{formatDate(windowRow.created_at)}</div>
							</div>
							<div className='col-12 col-sm-6 col-md-4'>
								<div className='small text-muted text-uppercase fw-semibold'>Updated</div>
								<div className='fw-semibold'>{formatDate(windowRow.updated_at)}</div>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			{!loading && windowRow && (() => {
				const tokenNo = getWindowCurrentTokenNumber(windowRow);
				const token = getCurrentToken(windowRow);
				const tokStatus = getWindowCurrentTokenStatusRaw(windowRow);
				const user = token?.token_user;

				const detailRows: Array<{ icon: string; label: string; value: string }> = [];
				if (user?.email?.trim()) detailRows.push({ icon: 'Email', label: 'Email', value: user.email.trim() });
				if (user?.phone?.trim()) detailRows.push({ icon: 'Phone', label: 'Phone', value: user.phone.trim() });
				if (user?.age != null && String(user.age).trim() !== '')
					detailRows.push({ icon: 'Cake', label: 'Age', value: String(user.age) });
				if (user?.place?.trim()) detailRows.push({ icon: 'Place', label: 'Place', value: user.place.trim() });
				if (user?.remarks?.trim())
					detailRows.push({ icon: 'Notes', label: 'Remarks', value: user.remarks.trim() });

				return (
					<Card className='border-0 shadow-sm rounded-4 overflow-hidden'>
						<CardBody className='p-0'>
							{!tokenNo ? (
								<div className='text-muted p-4 p-lg-5 d-flex align-items-center gap-4'>
									<div className='queue-modern-card__icon-box flex-shrink-0 rounded-3 opacity-75'>
										<Icon icon='ConfirmationNumber' className='queue-modern-card__icon' />
									</div>
									<div>
										<div className='fw-semibold text-body fs-5'>No token at this window</div>
										<div className='small mt-1 text-body-secondary'>
											Assign or call a token from the schedule to see customer details here.
										</div>
									</div>
								</div>
								) : (
								<div className='p-4'>
									<div className='d-flex align-items-center gap-2 mb-4'>
										<Icon icon='Person' className='text-primary' size='sm' />
										<span className='small text-uppercase fw-semibold text-muted'>Current visitor</span>
									</div>
									<div className='row g-4 align-items-start'>
										<div className='col-12 col-lg-6'>
											<div className='display-5 fw-bold text-primary lh-sm mb-1'>#{tokenNo}</div>
											{user?.name?.trim() ? (
												<div className='fs-4 fw-semibold text-body-emphasis mb-3'>{user.name.trim()}</div>
											) : null}
											<div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
												<span className='text-muted small'>Token status</span>
												<StatusBadge status={tokStatus || undefined} />
											</div>
											{detailRows.length > 0 && (
												<ul className='list-unstyled mb-0 d-flex flex-column gap-2'>
													{detailRows.map((row) => (
														<li key={row.label} className='d-flex align-items-start gap-2'>
															<Icon icon={row.icon} color='primary' size='sm' className='mt-1 flex-shrink-0' />
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
											{visibleTokenActions.map((a) => (
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
											))}
											<Tooltip
												title='Skip this token and advance to the next in line.'
												arrow
												placement='top'>
												<span className='d-inline-flex'>
													<Button
														color='dark'
														isLight
														icon='SkipNext'
														isDisable={actionLoading === `skip-${windowRow.id}`}
														onClick={() => void triggerSkipToken(windowRow)}>
														Skip token
													</Button>
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
							)}
						</CardBody>
					</Card>
				);
			})()}

			<Modal
				isOpen={statusModalWindow != null}
				setIsOpen={(open) => {
					if (!open) setStatusModalWindow(null);
				}}
				isCentered
				size='sm'
				isAnimation={false}>
				<ModalHeader
					setIsOpen={(open) => {
						if (!open) setStatusModalWindow(null);
					}}>
					<ModalTitle id='serving-window-detail-sp-status-modal'>Update serving point status</ModalTitle>
				</ModalHeader>
				{statusModalWindow && (
					<form onSubmit={handleSubmitServingPointStatus}>
						<ModalBody>
							<p className='fw-semibold mb-1'>
								{statusModalWindow.serving_point_name ||
									`Serving Point #${statusModalWindow.serving_point}`}
							</p>
							<p className='text-muted small mb-3 lh-base'>
								This updates the counter&apos;s status everywhere it is used, not only this schedule
								window.
							</p>
							<div className='d-flex align-items-center gap-2 mb-3 flex-wrap'>
								<span className='text-muted small'>Current status</span>
								{getWindowServingPointStatus(statusModalWindow) ? (
									<StatusBadge status={getWindowServingPointStatus(statusModalWindow)!} />
								) : (
									<span className='fw-semibold'>—</span>
								)}
							</div>
							<label className='form-label fw-semibold' htmlFor='serving-window-sp-next-status'>
								Change to
							</label>
							<select
								id='serving-window-sp-next-status'
								className='form-select'
								value={statusFormValue}
								disabled={statusSaving}
								onChange={(e) => setStatusFormValue(e.target.value)}>
								{getNextAllowedServingPointStatuses(getWindowServingPointStatus(statusModalWindow)).map(
									(v) => (
										<option key={v} value={v}>
											{SP_STATUS_LABELS[v] ?? v.replace(/_/g, ' ')}
										</option>
									),
								)}
							</select>
							{getNextAllowedServingPointStatuses(getWindowServingPointStatus(statusModalWindow)).length ===
								0 && (
								<div className='text-muted small mt-2'>No status transitions available.</div>
							)}
						</ModalBody>
						<ModalFooter>
							<Button
								color='light'
								isLight
								type='button'
								isDisable={statusSaving}
								onClick={() => setStatusModalWindow(null)}>
								Cancel
							</Button>
							<Button
								color={SP_STATUS_COLORS[statusFormValue] ?? 'primary'}
								type='submit'
								isDisable={
									statusSaving ||
									getNextAllowedServingPointStatuses(getWindowServingPointStatus(statusModalWindow))
										.length === 0
								}>
								{statusSaving ? (
									<>
										<Spinner isSmall inButton />
										Updating…
									</>
								) : (
									`Set ${SP_STATUS_LABELS[statusFormValue] ?? statusFormValue}`
								)}
							</Button>
						</ModalFooter>
					</form>
				)}
			</Modal>
		</div>
	);
};

export default ServingWindowDetailWorkspace;

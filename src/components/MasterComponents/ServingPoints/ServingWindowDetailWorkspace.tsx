import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import StatusBadge from '../../CustomComponent/StatusBadge';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type QueueSchedule,
	type ScheduleServingPoint,
	type ServingPoint,
	queuesApi,
	schedulesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';
import { setBreadcrumbs, setHeaderTitle } from '../../../store/uiSlice';
import { formatDate, servingPointQueueIds } from '../QueueManagement/queueManagementUtils';

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

const getWindowCurrentTokenNumber = (row: ScheduleServingPoint): string | null => {
	const nested = row.current_token;
	if (nested && typeof nested === 'object' && nested !== null && 'token_number' in nested) {
		return (nested as { token_number?: string }).token_number ?? null;
	}
	if (row.current_token_number) return row.current_token_number;
	if (typeof nested === 'number') return String(nested);
	return null;
};

const getWindowCurrentTokenCustomerName = (row: ScheduleServingPoint): string | null => {
	const nested = row.current_token;
	if (nested && typeof nested === 'object' && nested !== null && 'token_user' in nested) {
		const u = (nested as { token_user?: { name?: string } }).token_user;
		return u?.name?.trim() || null;
	}
	return null;
};

const getWindowCurrentTokenStatusRaw = (row: ScheduleServingPoint): string => {
	if (row.current_token_status) return row.current_token_status;
	const nested = row.current_token;
	if (nested && typeof nested === 'object' && nested !== null && 'status' in nested) {
		return String((nested as { status?: string }).status ?? '');
	}
	return '';
};

const normalizeTokenStatus = (status?: string) => (status || '').toLowerCase().trim();

const normalizeWindowStatus = (status?: string) => (status || '').toLowerCase().trim();

const getNextAllowedWindowStatuses = (status?: string) => {
	const normalized = normalizeWindowStatus(status);
	if (normalized === 'scheduled') return ['running', 'cancelled'];
	if (normalized === 'running') return ['on_hold', 'completed', 'cancelled'];
	if (normalized === 'on_hold' || normalized === 'onhold')
		return ['running', 'completed', 'cancelled'];
	return [];
};

const WINDOW_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
	{ label: 'Scheduled', value: 'scheduled' },
	{ label: 'Running', value: 'running' },
	{ label: 'On Hold', value: 'on_hold' },
	{ label: 'Completed', value: 'completed' },
	{ label: 'Cancelled', value: 'cancelled' },
];

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
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [statusFormValue, setStatusFormValue] = useState('scheduled');
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
	}, [windowNumericId, pointParam, navigate]);

	useEffect(() => {
		void load();
	}, [load]);

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

	const nextWindowStatusOptions = useMemo(() => {
		const allowed = getNextAllowedWindowStatuses(windowRow?.status);
		const current = normalizeWindowStatus(windowRow?.status);
		return WINDOW_STATUS_OPTIONS.filter(
			(option) => option.value === current || allowed.includes(option.value),
		);
	}, [windowRow?.status]);

	const canEditWindowStatus = useMemo(() => {
		const normalized = normalizeWindowStatus(windowRow?.status);
		return (
			normalized !== '' &&
			normalized !== 'completed' &&
			normalized !== 'cancelled' &&
			normalized !== 'canceled'
		);
	}, [windowRow?.status]);

	useEffect(() => {
		if (!showStatusModal) return;
		const allowed = getNextAllowedWindowStatuses(windowRow?.status);
		setStatusFormValue(allowed[0] || normalizeWindowStatus(windowRow?.status) || '');
	}, [showStatusModal, windowRow?.status]);

	const handleUpdateWindowStatus = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!windowRow?.id) return;
		const allowed = getNextAllowedWindowStatuses(windowRow.status);
		if (!statusFormValue || !allowed.includes(statusFormValue)) {
			showErrorNotification('Selected status transition is not allowed.');
			return;
		}
		setStatusSaving(true);
		try {
			await scheduleServingPointsApi.setStatus(windowRow.id, { status: statusFormValue });
			showSuccessNotification('Window status updated successfully.');
			setShowStatusModal(false);
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setStatusSaving(false);
		}
	};

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
		}> = [
			{ key: 'start', label: 'Start serving', icon: 'PlayCircle', color: 'primary', show: allowed.canStart },
			{
				key: 'complete',
				label: 'Complete',
				icon: 'TaskAlt',
				color: 'success',
				show: allowed.canComplete,
			},
			{
				key: 'postpone',
				label: 'Postpone',
				icon: 'Update',
				color: 'secondary',
				show: allowed.canPostpone,
			},
			{
				key: 'no_show',
				label: 'No show',
				icon: 'PersonOff',
				color: 'warning',
				show: allowed.canNoShow,
			},
			{
				key: 'cancel',
				label: 'Cancel token',
				icon: 'Cancel',
				color: 'danger',
				show: allowed.canCancel,
				outline: true,
			},
		];
		return rows.filter((r) => r.show);
	}, [windowRow, schedule?.allow_postpone]);

	if (!windowNumericId || Number.isNaN(windowNumericId)) {
		return <div className='alert alert-warning'>Invalid serving window.</div>;
	}

	return (
		<div className='d-grid gap-4'>
			<Card className='border-0 shadow-sm overflow-hidden'>
				<CardBody className='p-0'>
					<div className='d-flex flex-column flex-lg-row'>
						<div className='p-4 flex-grow-1'>
							<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap'>
								<div className='d-flex align-items-start gap-3'>
									<div className='queue-modern-card__icon-box flex-shrink-0'>
										<Icon icon='Schedule' className='queue-modern-card__icon' />
									</div>
									<div>
										<div className='text-muted small mb-1'>Serving window</div>
										<div className='h4 mb-1 fw-bold'>
											{windowRow?.serving_point_name
												? `${windowRow.serving_point_name}`
												: `Window #${windowNumericId}`}
										</div>
										{windowRow?.serving_point_name && windowRow?.id != null && (
											<div className='text-muted small mb-1'>Window #{windowRow.id}</div>
										)}
										<div className='text-muted small'>
											{windowRow
												? `${formatDate(windowRow.from_datetime)} – ${formatDate(windowRow.to_datetime)}`
												: '—'}
										</div>
									</div>
								</div>
								<div className='d-flex flex-wrap gap-2 align-items-center'>
									{windowRow?.queue_schedule != null && (
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
									)}
									<Button
										color='dark'
										isLight
										icon='ArrowBack'
										onClick={() => navigate(backTarget.path)}>
										{backTarget.label}
									</Button>
								</div>
							</div>
						</div>
					</div>

					{loading ? (
						<div className='text-muted px-4 pb-4'>Loading window details...</div>
					) : !windowRow ? (
						<div className='alert alert-warning mx-4 mb-4'>Serving window could not be loaded.</div>
					) : (
						<div className='row g-3 px-4 pb-4 border-top pt-3 mx-0'>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Serving point</div>
								<div className='fw-semibold'>
									{servingPoint?.name ||
										windowRow.serving_point_name ||
										`#${windowRow.serving_point}`}
								</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Queue</div>
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
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Window status</div>
								<div className='d-flex align-items-center gap-2 flex-wrap mt-1'>
									<Badge color='info' isLight className='text-capitalize'>
										{windowRow.status || '—'}
									</Badge>
									{canEditWindowStatus && (
										<Button
											color='primary'
											isLight
											size='sm'
											icon='Edit'
											onClick={() => setShowStatusModal(true)}>
											Update Status
										</Button>
									)}
								</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Created at</div>
								<div className='fw-semibold'>{formatDate(windowRow.created_at)}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Updated at</div>
								<div className='fw-semibold'>{formatDate(windowRow.updated_at)}</div>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			<Modal
				isOpen={showStatusModal}
				setIsOpen={setShowStatusModal}
				isCentered
				size='sm'
				isAnimation={false}>
				<ModalHeader setIsOpen={setShowStatusModal}>
					<ModalTitle id='update-window-status-modal'>Update Window Status</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleUpdateWindowStatus}>
					<ModalBody>
						<div className='text-muted small mb-2'>
							Current status:{' '}
							<span className='fw-semibold text-capitalize'>
								{windowRow?.status || 'unknown'}
							</span>
						</div>
						<label className='form-label fw-semibold' htmlFor='window-status'>
							Change to
						</label>
						<select
							id='window-status'
							className='form-select'
							value={statusFormValue}
							disabled={statusSaving || nextWindowStatusOptions.length === 0}
							onChange={(e) => setStatusFormValue(e.target.value)}>
							{nextWindowStatusOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						{nextWindowStatusOptions.length === 0 && (
							<div className='text-muted small mt-2'>
								No status transitions available.
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button color='light' isLight onClick={() => setShowStatusModal(false)}>
							Cancel
						</Button>
						<Button
							color='primary'
							type='submit'
							isDisable={statusSaving || nextWindowStatusOptions.length === 0}>
							{statusSaving ? (
								<>
									<Spinner isSmall inButton />
									Updating...
								</>
							) : (
								'Update Status'
							)}
						</Button>
					</ModalFooter>
				</form>
			</Modal>

			{!loading && windowRow && (() => {
				const tokenNo = getWindowCurrentTokenNumber(windowRow);
				const customer = getWindowCurrentTokenCustomerName(windowRow);
				const tokStatus = getWindowCurrentTokenStatusRaw(windowRow);
				return (
					<Card className='border-0 shadow-sm overflow-hidden'>
						<CardBody className='p-0'>
							{!tokenNo ? (
								<div className='text-muted p-4 d-flex align-items-center gap-3'>
									<div className='queue-modern-card__icon-box flex-shrink-0'>
										<Icon icon='ConfirmationNumber' className='queue-modern-card__icon' />
									</div>
									<div>
										<div className='fw-semibold text-body'>No token at this window</div>
										<div className='small'>Assign or call a token from the schedule to see it here.</div>
									</div>
								</div>
							) : (
								<div className='row g-0 bg-body-secondary border border-secondary border-opacity-25 rounded-3 overflow-hidden'>
									<div className='col-12 col-lg-6 p-4 d-flex flex-column justify-content-center border-bottom border-lg-bottom-0 border-lg-end border-secondary border-opacity-25'>
										<div className='text-uppercase small text-muted fw-semibold mb-2'>
											Current token
										</div>
										<div className='display-6 fw-bold text-primary mb-1'>#{tokenNo}</div>
										{customer ? (
											<div className='fs-5 fw-medium text-body-emphasis mb-2'>{customer}</div>
										) : null}
										<div className='d-flex flex-wrap align-items-center gap-2 mt-2'>
											<span className='text-muted small'>Token status</span>
											<StatusBadge status={tokStatus || undefined} />
										</div>
									</div>
									<div className='col-12 col-lg-6 p-4 d-flex flex-column'>
										<div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
											<span className='text-muted small'>Window status</span>
											<StatusBadge status={windowRow.status || undefined} emptyFallback='—' />
										</div>
										{visibleTokenActions.length > 0 ? (
											<div className='d-flex flex-wrap gap-2'>
												{visibleTokenActions.map((a) => (
													<Button
														key={a.key}
														color={a.color}
														isOutline={Boolean(a.outline)}
														isLight={!a.outline}
														icon={a.icon}
														isDisable={actionLoading === `${a.key}-${windowRow.id}`}
														onClick={() => void triggerWindowAction(windowRow, a.key)}>
														{a.label}
													</Button>
												))}
											</div>
										) : (
											<p className='text-muted small mb-0'>
												No actions are available for this token right now.
											</p>
										)}
									</div>
								</div>
							)}
						</CardBody>
					</Card>
				);
			})()}
		</div>
	);
};

export default ServingWindowDetailWorkspace;

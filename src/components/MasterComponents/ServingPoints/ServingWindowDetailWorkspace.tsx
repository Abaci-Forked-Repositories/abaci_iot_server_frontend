import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type QueueSchedule,
	type ScheduleServingPoint,
	type ServingPoint,
	queuesApi,
	schedulesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';
import { formatDate, servingPointQueueIds } from '../QueueManagement/queueManagementUtils';

const normalizeTokenStatus = (status?: string) => (status || '').toLowerCase().trim();

const ServingWindowDetailWorkspace: React.FC = () => {
	const { servingPointId, windowId } = useParams<{ servingPointId: string; windowId: string }>();
	const navigate = useNavigate();
	const pointParam = Number(servingPointId);
	const windowNumericId = Number(windowId);

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [windowRow, setWindowRow] = useState<ScheduleServingPoint | null>(null);
	const [servingPoint, setServingPoint] = useState<ServingPoint | null>(null);
	const [schedule, setSchedule] = useState<QueueSchedule | null>(null);

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
				navigate(`/serving-points/${win.serving_point}/windows/${win.id}`, { replace: true });
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

	const getAllowedActions = (row: ScheduleServingPoint) => {
		const tokenStatus = normalizeTokenStatus(row.current_token_status);
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

	if (!windowNumericId || Number.isNaN(windowNumericId)) {
		return <div className='alert alert-warning'>Invalid serving window.</div>;
	}

	const backPath =
		Number.isFinite(pointParam) && !Number.isNaN(pointParam)
			? `/serving-points/${pointParam}`
			: windowRow
				? `/serving-points/${windowRow.serving_point}`
				: '/serving-points';

	return (
		<div className='d-grid gap-4'>
			<Card>
				<CardBody>
					<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap'>
						<div>
							<div className='text-muted small mb-1'>Serving Window</div>
							<div className='h4 mb-1'>
								{windowRow?.serving_point_name
									? `${windowRow.serving_point_name} · Window #${windowRow.id}`
									: `Window #${windowNumericId}`}
							</div>
							<div className='text-muted'>
								Schedule #{windowRow?.queue_schedule ?? '—'} ·{' '}
								{windowRow
									? `${formatDate(windowRow.from_datetime)} – ${formatDate(windowRow.to_datetime)}`
									: '—'}
							</div>
						</div>
						<div className='d-flex flex-wrap gap-2'>
							{windowRow?.queue_schedule != null && (
								<Button
									color='info'
									isLight
									icon='CalendarMonth'
									onClick={() =>
										navigate(`/queue-management/schedules/${windowRow.queue_schedule}`)
									}>
									Open schedule
								</Button>
							)}
							<Button color='light' isLight icon='ArrowBack' onClick={() => navigate(backPath)}>
								Back
							</Button>
						</div>
					</div>

					{loading ? (
						<div className='text-muted py-4'>Loading window details...</div>
					) : !windowRow ? (
						<div className='alert alert-warning mt-3 mb-0'>Serving window could not be loaded.</div>
					) : (
						<div className='row g-3 mt-2'>
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
								<Badge color='info' isLight>
									{windowRow.status || '—'}
								</Badge>
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

			{!loading && windowRow && (
				<Card>
					<CardHeader>
						<CardLabel icon='ConfirmationNumber'>
							<CardTitle tag='h5'>Current token</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						{!windowRow.current_token_number ? (
							<div className='text-muted py-2'>No token is assigned to this window.</div>
						) : (
							<div className='d-flex align-items-center gap-4 flex-wrap'>
								<div>
									<div className='text-muted small'>Token number</div>
									<div className='h3 mb-0'>#{windowRow.current_token_number}</div>
								</div>
								<div>
									<div className='text-muted small'>Token status</div>
									<Badge color='primary' isLight>
										{windowRow.current_token_status || '—'}
									</Badge>
								</div>
								<div>
									<div className='text-muted small'>Window status</div>
									<Badge color='info' isLight>
										{windowRow.status || '—'}
									</Badge>
								</div>
								<div className='d-flex flex-wrap gap-2 ms-auto'>
									{(() => {
										const allowed = getAllowedActions(windowRow);
										return (
											<>
												<Button
													size='sm'
													isLight
													color='primary'
													isDisable={
														!allowed.canStart || actionLoading === `start-${windowRow.id}`
													}
													onClick={() => void triggerWindowAction(windowRow, 'start')}>
													Start
												</Button>
												<Button
													size='sm'
													isLight
													color='success'
													isDisable={
														!allowed.canComplete ||
														actionLoading === `complete-${windowRow.id}`
													}
													onClick={() => void triggerWindowAction(windowRow, 'complete')}>
													Complete
												</Button>
												<Button
													size='sm'
													isLight
													color='danger'
													isDisable={
														!allowed.canCancel || actionLoading === `cancel-${windowRow.id}`
													}
													onClick={() => void triggerWindowAction(windowRow, 'cancel')}>
													Cancel
												</Button>
												<Button
													size='sm'
													isLight
													color='warning'
													isDisable={
														!allowed.canNoShow || actionLoading === `no_show-${windowRow.id}`
													}
													onClick={() => void triggerWindowAction(windowRow, 'no_show')}>
													No show
												</Button>
												<Button
													size='sm'
													isLight
													color='secondary'
													isDisable={
														!allowed.canPostpone ||
														actionLoading === `postpone-${windowRow.id}`
													}
													onClick={() => void triggerWindowAction(windowRow, 'postpone')}>
													Postpone
												</Button>
											</>
										);
									})()}
								</div>
							</div>
						)}
					</CardBody>
				</Card>
			)}
		</div>
	);
};

export default ServingWindowDetailWorkspace;

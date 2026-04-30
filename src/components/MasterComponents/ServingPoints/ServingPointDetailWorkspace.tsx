import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type QueueSchedule,
	type ScheduleServingPoint,
	type ServingPoint,
	queuesApi,
	schedulesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';
import { formatDate } from '../QueueManagement/queueManagementUtils';

const normalizeTokenStatus = (status?: string) => (status || '').toLowerCase().trim();

const ServingPointDetailWorkspace: React.FC = () => {
	const { servingPointId } = useParams<{ servingPointId: string }>();
	const navigate = useNavigate();
	const id = Number(servingPointId);

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [servingPoint, setServingPoint] = useState<ServingPoint | null>(null);
	const [windows, setWindows] = useState<ScheduleServingPoint[]>([]);
	const [schedules, setSchedules] = useState<Record<number, QueueSchedule>>({});
	const [selectedWindowId, setSelectedWindowId] = useState<number | null>(null);

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const load = useCallback(async () => {
		if (!id || Number.isNaN(id)) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const [pointRes, windowsRes] = await Promise.all([
				queuesApi.getServingPoint(id),
				scheduleServingPointsApi.list({ serving_point: id, ordering: '-updated_at', page_size: 200 }),
			]);
			setServingPoint(pointRes);
			const windowRows = windowsRes.results || [];
			setWindows(windowRows);

			const scheduleIds = Array.from(new Set(windowRows.map((window) => window.queue_schedule)));
			const scheduleEntries = await Promise.all(
				scheduleIds.map(async (scheduleId) => [scheduleId, await schedulesApi.get(scheduleId)] as const),
			);
			setSchedules(Object.fromEntries(scheduleEntries));
		} catch (err) {
			errorNotifierRef.current(err);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		void load();
	}, [load]);

	const currentWindow = useMemo(() => {
		if (selectedWindowId) {
			const selected = windows.find((window) => window.id === selectedWindowId);
			if (selected) return selected;
		}
		return (
			windows.find((window) => window.current_token) ||
			windows.find((window) => (window.status || '').toLowerCase() === 'running') ||
			windows[0]
		);
	}, [selectedWindowId, windows]);

	const getAllowedActions = (window: ScheduleServingPoint) => {
		const tokenStatus = normalizeTokenStatus(window.current_token_status);
		const schedule = schedules[window.queue_schedule];
		const canStart = tokenStatus === 'registred' || tokenStatus === 'reported';
		const canComplete = tokenStatus === 'serving';
		const canCancel = tokenStatus === 'registred' || tokenStatus === 'reported' || tokenStatus === 'serving';
		const canNoShow = canCancel;
		const canPostpone = canCancel && Boolean(schedule?.allow_postpone);
		return { canStart, canComplete, canCancel, canNoShow, canPostpone };
	};

	const triggerWindowAction = async (
		window: ScheduleServingPoint,
		action: 'start' | 'complete' | 'cancel' | 'no_show' | 'postpone',
	) => {
		setActionLoading(`${action}-${window.id}`);
		try {
			if (action === 'start') await scheduleServingPointsApi.startServing(window.id);
			if (action === 'complete') await scheduleServingPointsApi.complete(window.id);
			if (action === 'cancel') await scheduleServingPointsApi.cancel(window.id);
			if (action === 'no_show') await scheduleServingPointsApi.noShow(window.id);
			if (action === 'postpone') await scheduleServingPointsApi.postpone(window.id);
			showSuccessNotification('Window token updated successfully.');
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setActionLoading(null);
		}
	};

	const columns = useMemo(
		() => [
			{
				title: 'Schedule No',
				field: 'queue_schedule',
				render: (rowData: ScheduleServingPoint) => (
					<div className='fw-semibold'>#{rowData.queue_schedule}</div>
				),
			},
			{
				title: 'Window Time',
				field: 'window_time',
				render: (rowData: ScheduleServingPoint) => (
					<div className='small text-muted'>
						{formatDate(rowData.from_datetime)} - {formatDate(rowData.to_datetime)}
					</div>
				),
			},
			{
				title: 'Window Status',
				field: 'status',
				render: (rowData: ScheduleServingPoint) => (
					<Badge color='info' isLight>
						{rowData.status || '—'}
					</Badge>
				),
			},
			{
				title: 'Current Token',
				field: 'current_token_number',
				render: (rowData: ScheduleServingPoint) =>
					rowData.current_token_number ? (
						<div>
							<div className='fw-semibold'>#{rowData.current_token_number}</div>
							<div className='small text-muted'>{rowData.current_token_status || '—'}</div>
						</div>
					) : (
						<span className='text-muted'>No token assigned</span>
					),
			},
		],
		[],
	);

	if (!id || Number.isNaN(id)) {
		return <div className='alert alert-warning'>Invalid serving point.</div>;
	}

	return (
		<div className='d-grid gap-4'>
			<Card>
				<CardBody>
					<div className='d-flex align-items-start justify-content-between gap-3'>
						<div>
							<div className='text-muted small mb-1'>Serving Point Detail</div>
							<div className='h4 mb-1'>{servingPoint?.name || `Serving Point #${id}`}</div>
							<div className='text-muted'>{servingPoint?.description || 'No description available.'}</div>
						</div>
						<Button color='light' isLight icon='ArrowBack' onClick={() => navigate('/serving-points')}>
							Back
						</Button>
					</div>
					<div className='row g-3 mt-2'>
						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Queue</div>
							<div className='fw-semibold'>
								{(servingPoint as (ServingPoint & { queue_name?: string }) | null)?.queue_name ||
									(servingPoint?.queue != null ? `Queue #${servingPoint.queue}` : '—')}
							</div>
						</div>
						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Assigned Users</div>
							<div className='fw-semibold'>
								{(() => {
									const users = (servingPoint as (ServingPoint & { assigned_user?: Array<{ username?: string; id?: number } | string> }) | null)
										?.assigned_user;
									if (!users || users.length === 0) return '—';
									return users
										.map((u) => (typeof u === 'string' ? u : u.username || (u.id != null ? `User #${u.id}` : 'User')))
										.join(', ');
								})()}
							</div>
						</div>
						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Status</div>
							<Badge color={servingPoint?.is_active ? 'success' : 'secondary'} isLight>
								{servingPoint?.is_active ? 'Active' : 'Inactive'}
							</Badge>
						</div>
						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Created At</div>
							<div className='fw-semibold'>{formatDate(servingPoint?.created_at)}</div>
						</div>
						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Updated At</div>
							<div className='fw-semibold'>
								{formatDate(
									(servingPoint as (ServingPoint & { updated_at?: string }) | null)?.updated_at,
								)}
							</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<CardLabel icon='ConfirmationNumber'>
						<CardTitle tag='h5'>Current Token</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{loading ? (
						<div className='text-muted py-3'>Loading current token...</div>
					) : !currentWindow?.current_token_number ? (
						<div className='text-muted py-3'>No token currently assigned to this serving point.</div>
					) : (
						<div className='d-flex align-items-center gap-4 flex-wrap'>
							<div>
								<div className='text-muted small'>Token Number</div>
								<div className='h3 mb-0'>#{currentWindow.current_token_number}</div>
							</div>
							<div>
								<div className='text-muted small'>Token Status</div>
								<Badge color='primary' isLight>
									{currentWindow.current_token_status || '—'}
								</Badge>
							</div>
							<div>
								<div className='text-muted small'>Window Status</div>
								<Badge color='info' isLight>
									{currentWindow.status || '—'}
								</Badge>
							</div>
							<div className='d-flex flex-wrap gap-2 ms-auto'>
								{(() => {
									const allowed = getAllowedActions(currentWindow);
									return (
										<>
											<Button
												size='sm'
												isLight
												color='primary'
												isDisable={!allowed.canStart || actionLoading === `start-${currentWindow.id}`}
												onClick={() => void triggerWindowAction(currentWindow, 'start')}>
												Start
											</Button>
											<Button
												size='sm'
												isLight
												color='success'
												isDisable={!allowed.canComplete || actionLoading === `complete-${currentWindow.id}`}
												onClick={() => void triggerWindowAction(currentWindow, 'complete')}>
												Complete
											</Button>
											<Button
												size='sm'
												isLight
												color='danger'
												isDisable={!allowed.canCancel || actionLoading === `cancel-${currentWindow.id}`}
												onClick={() => void triggerWindowAction(currentWindow, 'cancel')}>
												Cancel
											</Button>
											<Button
												size='sm'
												isLight
												color='warning'
												isDisable={!allowed.canNoShow || actionLoading === `no_show-${currentWindow.id}`}
												onClick={() => void triggerWindowAction(currentWindow, 'no_show')}>
												No Show
											</Button>
											<Button
												size='sm'
												isLight
												color='secondary'
												isDisable={!allowed.canPostpone || actionLoading === `postpone-${currentWindow.id}`}
												onClick={() => void triggerWindowAction(currentWindow, 'postpone')}>
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

			<Card stretch>
				<CardHeader>
					<CardLabel icon='Monitor'>
						<CardTitle tag='h5'>Serving Windows ({windows.length})</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{loading ? (
						<div className='text-center text-muted py-5'>Loading serving windows...</div>
					) : (
						<div className='material_tabel_wrapper'>
							<div style={{ overflow: 'hidden' }}>
								<ThemeProvider theme={theme}>
									<MaterialTable
										title=' '
										// @ts-ignore
										columns={columns}
										data={windows}
										options={{
											headerStyle: headerStyles(),
											rowStyle: rowStyles(),
											search: true,
											pageSize: 8,
											pageSizeOptions: [8, 15, 30],
											emptyRowsWhenPaging: false,
										}}
										onRowClick={(_, rowData) => {
											const row = rowData as ScheduleServingPoint | undefined;
											if (!row?.id) return;
											setSelectedWindowId(row.id);
										}}
										localization={{ pagination: { labelRowsPerPage: '' } }}
									/>
								</ThemeProvider>
							</div>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default ServingPointDetailWorkspace;

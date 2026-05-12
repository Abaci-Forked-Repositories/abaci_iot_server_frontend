import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MaterialTable, { MTableToolbar } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Icon from '../../icon/Icon';
import DropDownFilter from '../../CustomComponent/DropDown/DropDownFilter';
import TokenCreateForm from '../../PageComponents/QueueManagement/TokenCreateForm';
import Spinner from '../../bootstrap/Spinner';
import useTablestyle from '../../../hooks/useTablestyles';
import Tooltip from '@mui/material/Tooltip';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type CreateTokenPayload,
	type Queue,
	type QueueSchedule,
	type ScheduleServingPoint,
	type Token,
	scheduleServingPointsApi,
	schedulesApi,
	tokensApi,
} from '../../../services/queueManagementApi';
import { setBreadcrumbs, setHeaderTitle } from '../../../store/uiSlice';
import { initialTokenForm } from '../QueueManagement/queueManagementConstants';
import { formatDate, statusBadgeColor } from '../QueueManagement/queueManagementUtils';
import swalFire from '../../../helpers/swalHelper';
import { buttonColor } from '../../../helpers/constants';

const scheduleStatusBadgeColor = (status?: string) => {
	const normalized = (status || '').toLowerCase();
	if (normalized === 'running') return 'success';
	if (normalized === 'scheduled') return 'primary';
	if (normalized === 'onhold' || normalized === 'on_hold') return 'warning';
	if (normalized === 'completed') return 'info';
	if (normalized === 'canceled' || normalized === 'cancelled') return 'danger';
	return 'secondary';
};

const normalizeScheduleStatus = (status?: string) => (status || '').toLowerCase().trim();

const getNextAllowedStatuses = (status?: string) => {
	const normalized = normalizeScheduleStatus(status);
	if (normalized === 'scheduled') return ['running', 'cancelled'];
	if (normalized === 'running') return ['on_hold', 'completed', 'cancelled'];
	if (normalized === 'on_hold' || normalized === 'onhold') return ['running', 'completed', 'cancelled'];
	return [];
};

export type ScheduleDetailNavState = {
	queueId?: number;
	queueName?: string;
	/** Exact path to return to the queue detail page (e.g. `/queue-management/24`). */
	queueDetailPath?: string;
};

const toLocalDateTimeInputValue = (iso?: string) => {
	if (!iso) return '';
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const ScheduleDetailWorkspace: React.FC = () => {
	const { scheduleId } = useParams<{ scheduleId: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const navState = location.state as ScheduleDetailNavState | null;
	const queueIdFromState = navState?.queueId;
	const queueNameFromState = navState?.queueName;
	const queueDetailPathFromState = navState?.queueDetailPath;

	const sid = Number(scheduleId);

	const [loading, setLoading] = useState(true);
	const [tokenSaving, setTokenSaving] = useState(false);
	const [statusSaving, setStatusSaving] = useState(false);
	const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [showServingPointEditModal, setShowServingPointEditModal] = useState(false);
	const [scheduleRecord, setScheduleRecord] = useState<QueueSchedule | null>(null);
	const [statusFormValue, setStatusFormValue] = useState('scheduled');
	const [fromDateTimeFormValue, setFromDateTimeFormValue] = useState('');
	const [toDateTimeFormValue, setToDateTimeFormValue] = useState('');
	const [servingPointStatusFormValue, setServingPointStatusFormValue] = useState('scheduled');
	const [servingPointFromDateTimeFormValue, setServingPointFromDateTimeFormValue] = useState('');
	const [servingPointToDateTimeFormValue, setServingPointToDateTimeFormValue] = useState('');
	const [editingServingPointWindow, setEditingServingPointWindow] = useState<ScheduleServingPoint | null>(null);
	const [tokens, setTokens] = useState<Token[]>([]);
	const [tokenForm, setTokenForm] = useState<CreateTokenPayload>(initialTokenForm);
	const [tokenStatusFilter, setTokenStatusFilter] = useState<{ label: string; value: string }>({
		label: 'All',
		value: 'all',
	});

	const queueId = scheduleRecord?.queue ?? queueIdFromState ?? 0;
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification, showSuccessNotification, showNotification } = useToasterNotification();

	const scheduleTimeBounds = useMemo(() => {
		if (!scheduleRecord?.from_datetime || !scheduleRecord?.to_datetime) return null;
		return {
			minLocal: toLocalDateTimeInputValue(scheduleRecord.from_datetime),
			maxLocal: toLocalDateTimeInputValue(scheduleRecord.to_datetime),
			startMs: new Date(scheduleRecord.from_datetime).getTime(),
			endMs: new Date(scheduleRecord.to_datetime).getTime(),
		};
	}, [scheduleRecord?.from_datetime, scheduleRecord?.to_datetime]);

	const servingPointFromMaxLocal = useMemo(() => {
		if (!scheduleTimeBounds) return undefined;
		const cap = scheduleTimeBounds.maxLocal;
		if (!servingPointToDateTimeFormValue) return cap || undefined;
		return servingPointToDateTimeFormValue < cap ? servingPointToDateTimeFormValue : cap;
	}, [scheduleTimeBounds, servingPointToDateTimeFormValue]);

	const servingPointToMinLocal = useMemo(() => {
		if (!scheduleTimeBounds) return undefined;
		const floor = scheduleTimeBounds.minLocal;
		if (!servingPointFromDateTimeFormValue) return floor || undefined;
		return servingPointFromDateTimeFormValue > floor ? servingPointFromDateTimeFormValue : floor;
	}, [scheduleTimeBounds, servingPointFromDateTimeFormValue]);

	const load = useCallback(async () => {
		if (!sid || Number.isNaN(sid)) {
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const sch = await schedulesApi.get(sid);
			setScheduleRecord(sch);
			const qid = sch.queue;

			const tokensRes = await tokensApi.list({ queue: qid, ordering: '-created_at', page_size: 200 });
			const allTok = tokensRes.results || [];
			setTokens(allTok.filter((t) => (t.schedule ?? null) === sid));
			setTokenForm((prev) => ({ ...prev, schedule_id: sid }));
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sid]);

	useEffect(() => {
		void load();
	}, [load]);

	const queueDetailPath = useMemo(() => {
		if (queueDetailPathFromState) return queueDetailPathFromState;
		const q = scheduleRecord?.queue;
		if (q) return `/queue-management/${q}`;
		return '/queue-management';
	}, [queueDetailPathFromState, scheduleRecord?.queue]);

	const tokenFormQueues = useMemo((): Queue[] => {
		if (!scheduleRecord?.queue) return [];
		const name =
			scheduleRecord.queue_name ??
			queueNameFromState ??
			(scheduleRecord.queue ? `Queue ${scheduleRecord.queue}` : 'Queue');
		return [{ id: scheduleRecord.queue, name } as Queue];
	}, [queueNameFromState, scheduleRecord]);

	useEffect(() => {
		if (!scheduleRecord) return;
		const qLabel =
			queueNameFromState ??
			scheduleRecord.queue_name ??
			(scheduleRecord.queue ? `Queue ${scheduleRecord.queue}` : 'Queue');
		dispatch(setHeaderTitle({ name: `Schedule · ${qLabel}`, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: qLabel, path: queueDetailPath },
				{ label: 'Schedule details', path: location.pathname },
			]),
		);
	}, [dispatch, location.pathname, queueDetailPath, queueNameFromState, scheduleRecord]);

	useEffect(
		() => () => {
			dispatch(setBreadcrumbs([]));
		},
		[dispatch],
	);

	useEffect(() => {
		if (!showStatusModal) return;
		const nextStatuses = getNextAllowedStatuses(scheduleRecord?.status);
		setStatusFormValue(nextStatuses[0] || '');
	}, [scheduleRecord?.status, showStatusModal]);

	useEffect(() => {
		if (!showServingPointEditModal || !editingServingPointWindow) return;
		setServingPointStatusFormValue(editingServingPointWindow.status || 'scheduled');
		setServingPointFromDateTimeFormValue(toLocalDateTimeInputValue(editingServingPointWindow.from_datetime));
		setServingPointToDateTimeFormValue(toLocalDateTimeInputValue(editingServingPointWindow.to_datetime));
	}, [editingServingPointWindow, showServingPointEditModal]);

	const handleCreateToken = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setTokenSaving(true);
		try {
			await tokensApi.create({
				schedule_id: sid,
				name: tokenForm.name.trim(),
				email: tokenForm.email?.trim() || undefined,
				phone: tokenForm.phone?.trim() || undefined,
				age:
					tokenForm.age != null && !Number.isNaN(Number(tokenForm.age))
						? Number(tokenForm.age)
						: undefined,
				place: tokenForm.place?.trim() || undefined,
				remarks: tokenForm.remarks?.trim() || undefined,
			});
			showSuccessNotification('Token created successfully.');
			setShowCreateTokenModal(false);
			setTokenForm((prev) => ({
				...initialTokenForm,
				schedule_id: prev.schedule_id,
			}));
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setTokenSaving(false);
		}
	};

	const handleUpdateScheduleStatus = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!scheduleRecord?.id) return;
		const allowedStatuses = getNextAllowedStatuses(scheduleRecord.status);
		const currentStatus = scheduleRecord.status || '';
		if (!statusFormValue || !allowedStatuses.includes(statusFormValue)) {
			showErrorNotification('Selected status transition is not allowed.');
			return;
		}
		setStatusSaving(true);
		try {
			await schedulesApi.patch(scheduleRecord.id, { status: statusFormValue });
			showSuccessNotification('Schedule status updated successfully.');
			setShowStatusModal(false);
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setStatusSaving(false);
		}
	};

	const warnIfServingWindowOutsideSchedule = (
		fromVal: string,
		toVal: string,
		source: 'blur' | 'submit' = 'blur',
	) => {
		if (!scheduleRecord?.from_datetime || !scheduleRecord?.to_datetime) return false;
		if (!fromVal || !toVal) return false;
		const schedStart = new Date(scheduleRecord.from_datetime).getTime();
		const schedEnd = new Date(scheduleRecord.to_datetime).getTime();
		const wf = new Date(fromVal).getTime();
		const wt = new Date(toVal).getTime();
		if (Number.isNaN(wf) || Number.isNaN(wt)) return false;
		const outside = wf < schedStart || wt > schedEnd;
		if (outside) {
			const msg = `Start and end must fall entirely within this schedule (${formatDate(scheduleRecord.from_datetime)} – ${formatDate(scheduleRecord.to_datetime)}).`;
			if (source === 'submit') {
				showNotification('Invalid window', msg, 'warning');
			} else {
				showNotification('Outside schedule', msg, 'warning');
			}
			return true;
		}
		return false;
	};

	const handleUpdateServingPointWindow = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingServingPointWindow?.id) return;
		if (!servingPointFromDateTimeFormValue || !servingPointToDateTimeFormValue) {
			showErrorNotification('From and End date/time are required.');
			return;
		}
		const fromIso = new Date(servingPointFromDateTimeFormValue).toISOString();
		const toIso = new Date(servingPointToDateTimeFormValue).toISOString();
		if (new Date(fromIso).getTime() >= new Date(toIso).getTime()) {
			showErrorNotification('End date/time must be after Start date/time.');
			return;
		}
		if (
			warnIfServingWindowOutsideSchedule(
				servingPointFromDateTimeFormValue,
				servingPointToDateTimeFormValue,
				'submit',
			)
		) {
			return;
		}
		setStatusSaving(true);
		try {
			await scheduleServingPointsApi.patch(editingServingPointWindow.id, {
				from_datetime: fromIso,
				to_datetime: toIso,
				status: servingPointStatusFormValue || undefined,
			});
			showSuccessNotification('Serving point window updated successfully.');
			setShowServingPointEditModal(false);
			setEditingServingPointWindow(null);
			await load();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setStatusSaving(false);
		}
	};

	// i want remove serving point
	const handleRemoveServingPoint = async (servingPointId: number) => {
		try {
			await scheduleServingPointsApi.delete(servingPointId);
			showSuccessNotification('Serving point removed successfully.');
			await load();
		} catch (err) {
			showErrorNotification(err);
		}
	};

	const queueName = useMemo(() => {
		if (scheduleRecord?.queue_name) return scheduleRecord.queue_name;
		if (queueNameFromState) return queueNameFromState;
		return queueId ? `Queue ${queueId}` : 'Queue';
	}, [queueId, queueNameFromState, scheduleRecord?.queue_name]);

	const reportedTokenCount = useMemo(
		() => tokens.filter((t) => t.status === 'reported').length,
		[tokens],
	);

	const servingPointColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'serving_point_name',
				render: (rowData: ScheduleServingPoint) =>
					rowData.serving_point_name || `Serving Point #${rowData.serving_point}`,
			},
			{
				title: 'From',
				field: 'from_datetime',
				render: (rowData: ScheduleServingPoint) => formatDate(rowData.from_datetime),
			},
			{
				title: 'End',
				field: 'to_datetime',
				render: (rowData: ScheduleServingPoint) => formatDate(rowData.to_datetime),
			},
			{
				title: 'Status',
				field: 'status',
				render: (rowData: ScheduleServingPoint) => (
					<Badge color={scheduleStatusBadgeColor(rowData.status)} isLight>
						{rowData.status || '—'}
					</Badge>
				),
			},
			{
				title: 'Actions',
				field: 'actions',
				render: (rowData: ScheduleServingPoint) => (
					<span className='d-inline-flex gap-2'>
						<Tooltip title='Edit Serving Point Window'>
							<span className='d-inline-flex'>
								<Button
									color='primary'
									isLight
									size='sm'
									icon='Edit'
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.stopPropagation();
										setEditingServingPointWindow(rowData);
										setShowServingPointEditModal(true);
									}}
								/>
							</span>
						</Tooltip>
						<Tooltip title='Remove from this schedule (serving point is not deleted)'>
							<span className='d-inline-flex'>
								<Button
									color='danger'
									isLight
									size='sm'
									icon='LinkOff'
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.preventDefault();
										e.stopPropagation();
										const displayName =
											rowData.serving_point_name ||
											`Serving Point #${rowData.serving_point}`;
										void swalFire({
											title: 'Remove from this schedule?',
											text: `"${displayName}" will stay in the system. Only its window in this schedule will be removed.`,
											icon: 'warning',
											showCancelButton: true,
											confirmButtonText: 'Remove',
											cancelButtonText: 'Cancel',
											iconColor: buttonColor[0],
											confirmButtonColor: buttonColor[0],
											cancelButtonColor: buttonColor[1],
										}).then((result) => {
											if (result.isConfirmed) {
												void handleRemoveServingPoint(rowData.id);
											}
										});
									}}
								/>
							</span>
						</Tooltip>
					</span>
				),
			},
		],
		[handleRemoveServingPoint],
	);

	const tokenColumns = useMemo(
		() => [
			{ title: 'Token', field: 'token_number' },
			{
				title: 'Customer',
				field: 'token_user.name',
				render: (rowData: Token) => rowData.token_user?.name || '—',
			},
			{
				title: 'Status',
				field: 'status',
				render: (rowData: Token) => (
					<Badge color={statusBadgeColor(rowData.status)} isLight>
						{rowData.status}
					</Badge>
				),
			},
			{
				title: 'Created',
				field: 'created_at',
				render: (rowData: Token) => formatDate(rowData.created_at),
			},
		],
		[],
	);

	const tokenStatusFilterOptions = useMemo(
		() => [
			{ label: 'All', value: 'all' },
			{ label: 'registred', value: 'registred' },
			{ label: 'reported', value: 'reported' },
			{ label: 'serving', value: 'serving' },
			{ label: 'completed', value: 'completed' },
			{ label: 'cancelled', value: 'cancelled' },
			{ label: 'postponed', value: 'postponed' },
			{ label: 'no_show', value: 'no_show' },
		],
		[],
	);

	const scheduleStatusOptions = useMemo(
		() => [
			{ label: 'Scheduled', value: 'scheduled' },
			{ label: 'Running', value: 'running' },
			{ label: 'On Hold', value: 'on_hold' },
			{ label: 'Completed', value: 'completed' },
			{ label: 'Cancelled', value: 'cancelled' },
		],
		[],
	);

	const nextScheduleStatusOptions = useMemo(() => {
		const allowed = getNextAllowedStatuses(scheduleRecord?.status);
		const current = scheduleRecord?.status || '';
		return scheduleStatusOptions.filter(
			(option) => option.value === current || allowed.includes(option.value),
		);
	}, [scheduleRecord?.status, scheduleStatusOptions]);

	const canEditScheduleStatus = useMemo(() => {
		const normalized = normalizeScheduleStatus(scheduleRecord?.status);
		return normalized !== 'completed' && normalized !== 'cancelled' && normalized !== 'canceled';
	}, [scheduleRecord?.status]);

	const filteredTokens = useMemo(() => {
		if (tokenStatusFilter.value === 'all') {
			return tokens;
		}
		return tokens.filter((token) => token.status === tokenStatusFilter.value);
	}, [tokenStatusFilter.value, tokens]);

	const tokenToolbar = (props: any) => (
		<div className='d-flex align-items-center justify-content-end gap-2 pe-2'>
			<div style={{ display: 'inline-flex', width: 'auto', flex: '0 0 auto', minWidth: 0 }}>
				<MTableToolbar {...props} />
			</div>
			<DropDownFilter
				options={tokenStatusFilterOptions}
				onChange={setTokenStatusFilter}
				selectedOption={tokenStatusFilter}
				labelField='label'
				icon='FilterAlt'
				direction='down'
				buttonClassName='text-nowrap'
			/>
		</div>
	);

	return (
		<>
			<Card className='mb-4'>
				<CardBody className='p-0'>
					<div className='d-flex flex-column flex-xl-row'>
						<div className='p-4 flex-grow-1' style={{ flexBasis: '60%' }}>
							<div className='d-flex align-items-center justify-content-between gap-3 mb-3'>
								<div className='d-flex align-items-center gap-3'>
									<div
										className='d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0'
										style={{ width: 48, height: 48, backgroundColor: 'var(--bs-light)' }}>
										<Icon icon='Event' className='queue-modern-card__icon' color='primary' />
									</div>
									<div>
										<div className='h4 mb-0 fw-bold'>Schedule Details</div>
										<div className='text-muted small mt-1'>
											Queue:{' '}
											{scheduleRecord?.queue != null ? (
												<Link to={queueDetailPath} className='fw-semibold text-decoration-none'>
													{queueName}
												</Link>
											) : (
												<span className='fw-semibold'>{queueName}</span>
											)}
										</div>
									</div>
								</div>
								<div className='d-flex align-items-center gap-2'>
									<Badge
										color={scheduleStatusBadgeColor(scheduleRecord?.status)}
										className='px-3 py-2 fs-6 text-capitalize'>
										{scheduleRecord?.status || 'unknown'}
									</Badge>
									{canEditScheduleStatus && (
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

							<div className='row g-3'>
								<div className='col-md-6'>
									<div className='border rounded-3 p-3 h-100 d-flex align-items-center gap-3'>
										<div
											className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
											style={{ width: 34, height: 34, backgroundColor: 'rgba(27, 197, 189, 0.16)' }}>
											<Icon icon='PlayCircle' color='success' />
										</div>
										<div>
											<div className='text-muted small mb-1'>Start</div>
											<div className='fw-semibold'>
												{scheduleRecord?.from_datetime ? formatDate(scheduleRecord.from_datetime) : '-'}
											</div>
										</div>
									</div>
								</div>
								<div className='col-md-6'>
									<div className='border rounded-3 p-3 h-100 d-flex align-items-center gap-3'>
										<div
											className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
											style={{ width: 34, height: 34, backgroundColor: 'rgba(246, 78, 96, 0.16)' }}>
											<Icon icon='StopCircle' color='danger' />
										</div>
										<div>
											<div className='text-muted small mb-1'>End</div>
											<div className='fw-semibold'>
												{scheduleRecord?.to_datetime ? formatDate(scheduleRecord.to_datetime) : '-'}
											</div>
										</div>
									</div>
								</div>
								<div className='col-12'>
									<div className='border rounded-3 p-3 d-flex align-items-start gap-3'>
										<div
											className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
											style={{ width: 34, height: 34, backgroundColor: 'rgba(54, 153, 255, 0.14)' }}>
											<Icon icon='Description' color='info' />
										</div>
										<div>
											<div className='text-muted small mb-1'>Description</div>
											<div>{scheduleRecord?.description || 'No schedule description provided.'}</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='queue-detail-panel-divider' />

						<div className='p-4' style={{ flexBasis: '40%', minWidth: '320px' }}>
							<div className='d-flex align-items-center justify-content-between mb-3 gap-3'>
								<div className='h5 mb-0 fw-semibold d-flex align-items-center gap-2'>
									<Icon icon='Insights' color='warning' />
									Quick Stats
								</div>
								<Button
									color='primary'
									size='sm'
									icon='Add'
									onClick={() => {
										setTokenForm((p) => ({ ...p, schedule_id: sid }));
										setShowCreateTokenModal(true);
									}}>
									Create Token
								</Button>
							</div>
							<div className='row g-3'>
								<div className='col-6'>
									<div className='queue-detail-stat-tile border rounded-3 p-3 h-100'>
										<div className='d-flex align-items-center gap-2 mb-2'>
											<div
												className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
												style={{ width: 30, height: 30, backgroundColor: 'rgba(114, 57, 234, 0.14)' }}>
												<Icon icon='FormatListNumbered' color='info' size='lg' />
											</div>
											<div className='text-muted small'>Token limit</div>
										</div>
										<div className='fs-5 fw-bold'>{scheduleRecord?.limit ?? '-'}</div>
									</div>
								</div>
								<div className='col-6'>
									<div className='queue-detail-stat-tile border rounded-3 p-3 h-100'>
										<div className='d-flex align-items-center gap-2 mb-2'>
											<div
												className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
												style={{ width: 30, height: 30, backgroundColor: 'rgba(125, 138, 156, 0.14)' }}>
												<Icon icon='LocalOffer' color='secondary' size='lg' />
											</div>
											<div className='text-muted small'>Current token</div>
										</div>
										<div className='fs-5 fw-bold'>
											{scheduleRecord?.current_token_number ??
												(scheduleRecord?.current_token != null
													? String(scheduleRecord.current_token)
													: '—')}
										</div>
									</div>
								</div>
								<div className='col-6'>
									<div className='queue-detail-stat-tile border rounded-3 p-3 h-100'>
										<div className='d-flex align-items-center gap-2 mb-2'>
											<div
												className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
												style={{ width: 30, height: 30, backgroundColor: 'rgba(255, 168, 0, 0.16)' }}>
												<Icon icon='Person' color='warning' size='lg' />
											</div>
											<div className='text-muted small'>Reported</div>
										</div>
										<div className='fs-5 fw-bold'>{reportedTokenCount}</div>
									</div>
								</div>
								<div className='col-6'>
									<div className='queue-detail-stat-tile border rounded-3 p-3 h-100'>
										<div className='d-flex align-items-center gap-2 mb-2'>
											<div
												className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
												style={{ width: 30, height: 30, backgroundColor: 'rgba(27, 197, 189, 0.16)' }}>
												<Icon icon='Assignment' color='success' size='lg' />
											</div>
											<div className='text-muted small'>Schedule tokens</div>
										</div>
										<div className='fs-5 fw-bold'>{tokens.length}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<div className='row g-4'>
				<div className='col-12 col-xl-5'>
					<Card stretch>
						<CardHeader>
							<CardLabel icon='Monitor'>
								<CardTitle tag='h5'>
									Serving points ({scheduleRecord?.serving_point_windows?.length || 0})
								</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							{loading ? (
								<div className='text-center text-muted py-4'>Loading...</div>
							) : (
								<div className='material_tabel_wrapper'>
									<div style={{ overflow: 'hidden' }}>
										<ThemeProvider theme={theme}>
											<MaterialTable
												title=' '
												// @ts-ignore
												columns={servingPointColumns}
												data={scheduleRecord?.serving_point_windows || []}
												options={{
													headerStyle: headerStyles(),
													rowStyle: rowStyles(),
													searchFieldStyle: searchFieldStyle(),
													search: true,
													filtering: false,
													pageSize: 5,
													pageSizeOptions: [5, 10, 20],
													emptyRowsWhenPaging: false,
												}}
												localization={{
													pagination: {
														labelRowsPerPage: '',
													},
												}}
												onRowClick={(_, rowData) => {
													const row = rowData as ScheduleServingPoint | undefined;
													if (!row?.id || row.serving_point == null) return;
													navigate(
														`/serving-points/${row.serving_point}/windows/${row.id}`,
														{
															state: {
																from: 'schedule',
																queueId,
																queueName,
																queueDetailPath: queueDetailPath,
																scheduleId: sid,
																schedulePath: location.pathname + location.search,
															},
														},
													);
												}}
											/>
										</ThemeProvider>
									</div>
								</div>
							)}
						</CardBody>
					</Card>
				</div>
				<div className='col-12 col-xl-7'>
					<Card stretch>
						<CardHeader>
							<CardLabel icon='ConfirmationNumber'>
								<CardTitle tag='h5'>Schedule Tokens ({filteredTokens.length})</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							{loading ? (
								<div className='text-center text-muted py-4'>Loading tokens...</div>
							) : (
								<div className='material_tabel_wrapper'>
									<div style={{ overflow: 'hidden' }}>
										<ThemeProvider theme={theme}>
											<MaterialTable
												title=' '
												// @ts-ignore
												columns={tokenColumns}
												data={filteredTokens}
												components={{
													Toolbar: tokenToolbar,
												}}
												options={{
													headerStyle: headerStyles(),
													rowStyle: rowStyles(),
													searchFieldStyle: searchFieldStyle(),
													search: true,
													filtering: false,
													pageSize: 8,
													pageSizeOptions: [8, 15, 30],
													emptyRowsWhenPaging: false,
												}}
												localization={{
													pagination: {
														labelRowsPerPage: '',
													},
												}}
											/>
										</ThemeProvider>
									</div>
								</div>
							)}
						</CardBody>
					</Card>
				</div>
			</div>

			<Modal isOpen={showCreateTokenModal} setIsOpen={setShowCreateTokenModal} isCentered size='lg' isAnimation={false}>
				<ModalHeader setIsOpen={setShowCreateTokenModal}>
					<ModalTitle id='create-token-modal'>Create Token for Schedule</ModalTitle>
				</ModalHeader>
				<ModalBody>
					<TokenCreateForm
						tokenForm={tokenForm}
						setTokenForm={setTokenForm}
						queues={tokenFormQueues}
						schedules={scheduleRecord ? [scheduleRecord] : []}
						selectedQueueId={queueId}
						onQueueChange={() => {}}
						fixedScheduleId={sid}
						servingPoints={[]}
						showServingPoints={false}
						onCancel={() => setShowCreateTokenModal(false)}
						onSubmit={handleCreateToken}
						isSubmitting={tokenSaving}
					/>
				</ModalBody>
			</Modal>

			<Modal isOpen={showStatusModal} setIsOpen={setShowStatusModal} isCentered size='sm' isAnimation={false}>
				<ModalHeader setIsOpen={setShowStatusModal}>
					<ModalTitle id='update-schedule-status-modal'>Update Schedule Status</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleUpdateScheduleStatus}>
					<ModalBody>
						<div className='text-muted small mb-2'>
							Current status:{' '}
							<span className='fw-semibold text-capitalize'>{scheduleRecord?.status || 'unknown'}</span>
						</div>
						<label className='form-label fw-semibold' htmlFor='schedule-status'>
							Change to
						</label>
						<select
							id='schedule-status'
							className='form-select'
							value={statusFormValue}
							disabled={statusSaving || nextScheduleStatusOptions.length === 0}
							onChange={(e) => setStatusFormValue(e.target.value)}>
							{nextScheduleStatusOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						{nextScheduleStatusOptions.length === 0 && (
							<div className='text-muted small mt-2'>No status transitions available.</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button color='light' isLight onClick={() => setShowStatusModal(false)}>
							Cancel
						</Button>
						<Button color='primary' type='submit' isDisable={statusSaving || nextScheduleStatusOptions.length === 0}>
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

			<Modal
				isOpen={showServingPointEditModal}
				setIsOpen={setShowServingPointEditModal}
				isCentered
				size='lg'
				isAnimation={false}>
				<ModalHeader setIsOpen={setShowServingPointEditModal}>
					<ModalTitle id='update-serving-point-window-modal'>Edit Serving Point Window</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleUpdateServingPointWindow}>
					<ModalBody>
						<div className='text-muted small mb-2'>
							Serving Point:{' '}
							<span className='fw-semibold'>
								{editingServingPointWindow?.serving_point_name ||
									(editingServingPointWindow?.serving_point
										? `#${editingServingPointWindow.serving_point}`
										: '—')}
							</span>
						</div>
						{scheduleTimeBounds && scheduleRecord && (
							<p className='text-muted small mb-3 lh-base' style={{ maxWidth: '100%' }}>
								<span className='fw-semibold text-body-secondary'>Note.</span>{' '}
								Start and end must stay within this schedule:{' '}
								<span className='fw-medium text-body'>
									{formatDate(scheduleRecord.from_datetime)}
								</span>
								{' — '}
								<span className='fw-medium text-body'>
									{formatDate(scheduleRecord.to_datetime)}
								</span>
								.
							</p>
						)}
						<div className='mb-3'>
							<label className='form-label fw-semibold' htmlFor='sp-window-from-datetime'>
								From
							</label>
							<input
								id='sp-window-from-datetime'
								type='datetime-local'
								className='form-control'
								value={servingPointFromDateTimeFormValue}
								min={scheduleTimeBounds?.minLocal || undefined}
								max={servingPointFromMaxLocal}
								onChange={(e) => setServingPointFromDateTimeFormValue(e.target.value)}
								onBlur={(e) => {
									const fromVal = e.currentTarget.value;
									const toEl = document.getElementById(
										'sp-window-to-datetime',
									) as HTMLInputElement | null;
									warnIfServingWindowOutsideSchedule(
										fromVal,
										toEl?.value ?? servingPointToDateTimeFormValue,
										'blur',
									);
								}}
								disabled={statusSaving}
							/>
						</div>
						<div className='mb-3'>
							<label className='form-label fw-semibold' htmlFor='sp-window-to-datetime'>
								End
							</label>
							<input
								id='sp-window-to-datetime'
								type='datetime-local'
								className='form-control'
								value={servingPointToDateTimeFormValue}
								min={servingPointToMinLocal}
								max={scheduleTimeBounds?.maxLocal || undefined}
								onChange={(e) => setServingPointToDateTimeFormValue(e.target.value)}
								onBlur={(e) => {
									const fromEl = document.getElementById(
										'sp-window-from-datetime',
									) as HTMLInputElement | null;
									const toVal = e.currentTarget.value;
									warnIfServingWindowOutsideSchedule(
										fromEl?.value ?? servingPointFromDateTimeFormValue,
										toVal,
										'blur',
									);
								}}
								disabled={statusSaving}
							/>
						</div>
						<label className='form-label fw-semibold' htmlFor='sp-window-status'>
							Status
						</label>
						<select
							id='sp-window-status'
							className='form-select'
							value={servingPointStatusFormValue}
							disabled={statusSaving}
							onChange={(e) => setServingPointStatusFormValue(e.target.value)}>
							{scheduleStatusOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</ModalBody>
					<ModalFooter>
						<Button
							color='light'
							isLight
							onClick={() => {
								setShowServingPointEditModal(false);
								setEditingServingPointWindow(null);
							}}>
							Cancel
						</Button>
						<Button color='primary' type='submit' isDisable={statusSaving}>
							{statusSaving ? (
								<>
									<Spinner isSmall inButton />
									Updating...
								</>
							) : (
								'Update'
							)}
						</Button>
					</ModalFooter>
				</form>
			</Modal>
		</>
	);
};

export default ScheduleDetailWorkspace;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import QueueDetailSkeleton from '../../CustomComponent/Skeleton/QueueDetailSkeleton';
import useTablestyle from '../../../hooks/useTablestyles';
import type { Queue, QueueSchedule, QueueStatistics, QueueStatus, ServingPoint, Token } from '../../../services/queueManagementApi';
import { queuesApi, schedulesApi, tokensApi } from '../../../services/queueManagementApi';
import { buttonColor } from '../../../helpers/constants';
import swalFire from '../../../helpers/swalHelper';
import type { TColor } from '../../../type/color-type';
import { formatDate, getErrorMessage, servingPointQueueIds } from './queueManagementUtils';
import ScheduleCalendar, { type QueueScheduleEvent } from './ScheduleCalendar';

const STAT_RANGE_OPTIONS = ['Today', 'This week', 'This month'] as const;

const STAT_TILES: Array<{
	key: keyof QueueStatistics | 'total' | 'completed_today';
	label: string;
	icon: string;
	color: TColor;
}> = [
	{ key: 'total_tokens', label: 'Total Tokens', icon: 'Insights', color: 'primary' },
	{ key: 'reported', label: 'Reported', icon: 'HourglassEmpty', color: 'warning' },
	{ key: 'serving', label: 'Serving', icon: 'SupportAgent', color: 'info' },
	{ key: 'completed', label: 'Completed', icon: 'TaskAlt', color: 'success' },
	{ key: 'no_show', label: 'No Show', icon: 'PersonOff', color: 'danger' },
	{ key: 'cancelled', label: 'Cancelled', icon: 'Cancel', color: 'secondary' },
];

const ICON_BG_BY_COLOR: Record<TColor, string> = {
	primary: 'rgba(54, 153, 255, 0.14)',
	secondary: 'rgba(125, 138, 156, 0.14)',
	success: 'rgba(27, 197, 189, 0.14)',
	info: 'rgba(114, 57, 234, 0.14)',
	warning: 'rgba(255, 168, 0, 0.14)',
	danger: 'rgba(246, 78, 96, 0.14)',
	dark: 'rgba(24, 28, 50, 0.14)',
	light: 'rgba(245, 248, 250, 0.24)',
};

const QueueDetailView: React.FC = () => {
	const { queueId } = useParams<{ queueId: string }>();
	const navigate = useNavigate();
	const id = Number(queueId);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [queue, setQueue] = useState<Queue | null>(null);
	const [stats, setStats] = useState<QueueStatistics | null>(null);
	const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [allServingPoints, setAllServingPoints] = useState<ServingPoint[]>([]);
	const [servingTokens, setServingTokens] = useState<Token[]>([]);
	const [scheduleRecords, setScheduleRecords] = useState<QueueSchedule[]>([]);
	const [showAssignServingPointModal, setShowAssignServingPointModal] = useState(false);
	const [assignServingPointSearch, setAssignServingPointSearch] = useState('');
	const [selectedServingPointIds, setSelectedServingPointIds] = useState<number[]>([]);
	const [assigningServingPoints, setAssigningServingPoints] = useState(false);
	const [removingServingPointId, setRemovingServingPointId] = useState<number | null>(null);
	const [statRange, setStatRange] = useState<(typeof STAT_RANGE_OPTIONS)[number]>('Today');
	const { theme, headerStyles, rowStyles } = useTablestyle();

	const load = useCallback(async () => {
		if (!id || Number.isNaN(id)) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setError('');
		try {
			const [qRes, stRes, qsRes, spRes, allSpRes, tokRes, schRes] = await Promise.all([
				queuesApi.get(id),
				queuesApi.statistics(id),
				tokensApi.queueStatus(id),
				queuesApi.servingPoints({ queue: id }),
				queuesApi.servingPoints({ ordering: 'name', page_size: 300 }),
				tokensApi.list({ queue: id, status: 'serving', ordering: '-created_at', limit: 20, offset: 0 }),
				schedulesApi.list({ queue: id, page_size: 200, ordering: 'from_datetime' }),
			]);
			setQueue(qRes);
			setStats(stRes);
			setQueueStatus(qsRes);
			setServingPoints((spRes.results || []).filter((p) => servingPointQueueIds(p).includes(id)));
			setAllServingPoints(allSpRes.results || []);
			setServingTokens(tokRes.results || []);
			setScheduleRecords(schRes.results || []);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		void load();
	}, [load]);

	const groupName = useMemo(() => {
		if (!queue) return '-';
		const withGroupName = queue as Queue & { group_name?: string };
		return withGroupName.group_name ?? (queue.group != null ? String(queue.group) : '-');
	}, [queue]);

	const currentServingRows = useMemo(() => {
		const fromStats = stats?.current_serving;
		if (fromStats?.length) {
			return fromStats.map((row) => ({
				token: row.token_number,
				customer: row.customer_name,
				counter: '-',
				wait: row.wait_time ?? '—',
			}));
		}
		return servingTokens.map((t) => ({
			token: t.token_number,
			customer: t.token_user?.name || '—',
			counter: typeof t.queue === 'object' ? t.queue?.name || '—' : '—',
			wait: '—',
		}));
	}, [stats?.current_serving, servingTokens]);

	const availableServingPoints = useMemo(() => {
		const currentQueuePointIds = new Set(servingPoints.map((point) => point.id));
		const term = assignServingPointSearch.trim().toLowerCase();
		return allServingPoints.filter((point) => {
			if (currentQueuePointIds.has(point.id)) {
				return false;
			}
			if (!term) {
				return true;
			}
			return (
				point.name.toLowerCase().includes(term) ||
				(point.description || '').toLowerCase().includes(term)
			);
		});
	}, [allServingPoints, assignServingPointSearch, servingPoints]);

	const handleRemoveServingPointFromQueue = useCallback(
		async (point: ServingPoint) => {
			const nextQueues = servingPointQueueIds(point).filter((qid) => qid !== id);
			setRemovingServingPointId(point.id);
			setError('');
			try {
				await queuesApi.updateServingPoint(point.id, { queue: nextQueues });
				await load();
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				setRemovingServingPointId(null);
			}
		},
		[id, load],
	);

	const servingPointColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: ServingPoint) => rowData.name || '—',
			},
			{
				title: 'Description',
				field: 'description',
				render: (rowData: ServingPoint) => rowData.description || '—',
			},
			{
				title: 'Status',
				field: 'is_available',
				render: (rowData: ServingPoint) => (
					<span
						className={`queue-modern-card__status ${rowData.is_available ? 'queue-modern-card__status--active' : 'queue-modern-card__status--inactive'}`}>
						{rowData.is_available ? 'Available' : 'Busy'}
						<span className='queue-modern-card__status-dot' />
					</span>
				),
			},
			{
				title: 'Actions',
				field: 'actions',
				sorting: false,
				filtering: false,
				render: (rowData: ServingPoint) => (
					<Tooltip title='Remove from this queue (serving point is not deleted)'>
						<span className='d-inline-flex'>
							<Button
								color='danger'
								isLight
								size='sm'
								icon='LinkOff'
								isDisable={removingServingPointId === rowData.id}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.preventDefault();
									e.stopPropagation();
									void swalFire({
										title: 'Remove from this queue?',
										text: `"${rowData.name}" will stay in the system. Only the link to this queue will be removed.`,
										icon: 'warning',
										showCancelButton: true,
										confirmButtonText: 'Remove',
										cancelButtonText: 'Cancel',
										iconColor: buttonColor[0],
										confirmButtonColor: buttonColor[0],
										cancelButtonColor: buttonColor[1],
									}).then((result) => {
										if (result.isConfirmed) {
											void handleRemoveServingPointFromQueue(rowData);
										}
									});
								}}
							/>
						</span>
					</Tooltip>
				),
			},
		],
		[handleRemoveServingPointFromQueue, removingServingPointId],
	);

	const currentServingColumns = useMemo(
		() => [
			{
				title: 'Token',
				field: 'token',
				render: (rowData: { token: string }) => (
					<Badge color='success' isLight>
						{rowData.token}
					</Badge>
				),
			},
			{
				title: 'Customer',
				field: 'customer',
			},
			{
				title: 'Counter',
				field: 'counter',
			},
			{
				title: 'Wait',
				field: 'wait',
			},
		],
		[],
	);

	const statValue = (key: string): number => {
		if (key === 'total_tokens') return stats?.total_tokens ?? queueStatus?.total ?? 0;
		if (key === 'reported') return stats?.reported ?? queueStatus?.reported ?? 0;
		if (key === 'serving') return stats?.serving ?? queueStatus?.serving ?? 0;
		if (key === 'completed') return stats?.completed ?? queueStatus?.completed_today ?? 0;
		if (key === 'no_show') return stats?.no_show ?? 0;
		if (key === 'cancelled') return stats?.cancelled ?? 0;
		return 0;
	};

	const handleAssignServingPoints = async () => {
		if (!selectedServingPointIds.length) {
			setShowAssignServingPointModal(false);
			return;
		}
		setAssigningServingPoints(true);
		setError('');
		try {
			await Promise.all(
				selectedServingPointIds.map((servingPointId) =>
					queuesApi.updateServingPoint(servingPointId, { queue: [id] }),
				),
			);
			setShowAssignServingPointModal(false);
			setSelectedServingPointIds([]);
			setAssignServingPointSearch('');
			await load();
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setAssigningServingPoints(false);
		}
	};

	if (!id || Number.isNaN(id)) {
		return <div className='alert alert-warning'>Invalid queue.</div>;
	}

	if (loading && !queue) {
		return <QueueDetailSkeleton />;
	}

	if (error && !queue) {
		return <div className='alert alert-danger'>{error}</div>;
	}

	const queueData = queue!;

	const infoMeta: Array<{ label: string; value: React.ReactNode }> = [
		{
			label: 'Group',
			value: (
				<span className='queue-detail-meta-value'>
					<Icon icon='Groups' size='sm' className='me-1 opacity-75' />
					{groupName}
				</span>
			),
		},
		{ label: 'Limit', value: <span className='queue-detail-meta-value'><Icon icon='Timelapse' size='sm' className='me-1 opacity-75' />{queueData.limit ?? '—'}</span> },
		{
			label: 'Allow postpone',
			value: (
				<Badge color={queueData.allow_postpone ? 'success' : 'secondary'} isLight>
					{queueData.allow_postpone ? 'Yes' : 'No'}
				</Badge>
			),
		},
		{
			label: 'Reporting enabled',
			value: (
				<Badge color={queueData.is_reporting_enabled ? 'success' : 'secondary'} isLight>
					{queueData.is_reporting_enabled ? 'Yes' : 'No'}
				</Badge>
			),
		},
		{
			label: 'Grace period',
			value: (
				<span className='queue-detail-meta-value'>
					<Icon icon='Timer' size='sm' className='me-1 opacity-75' />
					{queueData.grace_period_minutes != null
						? `${queueData.grace_period_minutes} min`
						: '—'}
				</span>
			),
		},
		{
			label: 'Created At',
			value: (
				<span className='queue-detail-meta-value'>
					<Icon icon='Event' size='md' className='me-1 opacity-75' />
					{formatDate(queueData.created_at)}
				</span>
			),
		},
	];

	return (
		<div className='queue-detail-page'>
			{error && <div className='alert alert-danger mb-3'>{error}</div>}

			<div className='row g-4'>
				{/* ── Top: single card split info + stats ── */}
				<div className='col-12'>
					<Card>
						<CardBody className='p-0'>
							<div className='d-flex flex-column flex-xl-row'>

								{/* LEFT — queue info */}
								<div className='queue-detail-info-panel p-4'>
									<div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
										<div className='d-flex align-items-center gap-3'>
											<div className='queue-modern-card__icon-box flex-shrink-0'>
												<Icon icon='Layers' className='queue-modern-card__icon' />
											</div>
											<div>
												<div className='h4 mb-0 fw-bold'>{queueData.name}</div>
												<div className='text-muted small mt-1'>{queueData.description || 'Service queue'}</div>
											</div>
										</div>
										<div className='d-flex align-items-center gap-2 flex-shrink-0'>
											<span className={`queue-modern-card__status ${queueData.is_active ? 'queue-modern-card__status--active' : 'queue-modern-card__status--inactive'}`}>
												{queueData.is_active ? 'Active' : 'Inactive'}
												<span className='queue-modern-card__status-dot' />
											</span>
											
										</div>
									</div>

									{queueData.description && (
										<p className='small text-muted mb-3'>{queueData.description}</p>
									)}

									{/* Meta pills row */}
									<div className='d-flex flex-wrap gap-3 mb-4 align-items-center'>
										{infoMeta.map((m) => (
											<div key={m.label} className='queue-detail-meta-pill'>
												<span className='queue-detail-meta-label'>{m.label}</span>
												<div className='mt-1'>{m.value}</div>
											</div>
										))}
									</div>

									
								</div>

								{/* vertical divider (xl+) */}
								<div className='queue-detail-panel-divider' />

								{/* RIGHT — statistics */}
								<div className='queue-detail-stats-panel p-4 flex-fill d-flex flex-column'>
									<div className='d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2'>
										<div className='d-flex align-items-center gap-2'>
											<Icon icon='BarChart' color='primary' size='lg' />
											<span className='fw-semibold fs-4'>
												Queue Overview{' '}
												<span className='text-muted fw-normal small'>({statRange})</span>
											</span>
										</div>
										<select
											className='form-select form-select-sm w-auto'
											value={statRange}
											onChange={(e) =>
												setStatRange(e.target.value as (typeof STAT_RANGE_OPTIONS)[number])
											}>
											{STAT_RANGE_OPTIONS.map((o) => (
												<option key={o} value={o}>
													{o}
												</option>
											))}
										</select>
									</div>

									{/* Stat tiles — single row (center vertically in remaining space) */}
									<div className='flex-fill d-flex align-items-center'>
										<div className='queue-detail-stat-row w-100'>
											{STAT_TILES.map((m) => (
												<div
													key={m.label}
													className='queue-detail-stat-tile border rounded-3 p-4 text-center d-flex flex-column align-items-center justify-content-center'
													style={{ minHeight: 94 }}>
													<div
														className='d-inline-flex align-items-center justify-content-center rounded-circle mb-2'
														style={{
															width: 54,
															height: 54,
															backgroundColor: ICON_BG_BY_COLOR[m.color],
														}}>
														<Icon icon={m.icon} color={m.color} size='2x' className='mb-0 opacity-90' />
													</div>
													<div className='text-muted small'>{m.label}</div>
													<div className='fs-3 fw-bold'>{statValue(m.key)}</div>
												</div>
											))}
										</div>
									</div>

									
								</div>
							</div>
						</CardBody>
					</Card>
				</div>

			{/* ── Schedule Calendar ── */}
			<div className='col-12'>
				<ScheduleCalendar
					queueName={queueData.name}
					queueId={id}
					scheduleRecords={scheduleRecords}
					onScheduleCreated={() => void load()}
					onEventClick={(event: QueueScheduleEvent) =>
						navigate(`/queue-management/schedules/${event.id}`, {
							state: {
								queueId: id,
								queueName: queueData.name,
							},
						})
					}
				/>
			</div>

			{/* ── Serving Points ── */}
			<div className='col-12 col-xl-6'>
					<Card stretch>
						<CardHeader>
							<CardLabel icon='Monitor'>
								<CardTitle tag='h5'>Serving Points ({servingPoints.length})</CardTitle>
							</CardLabel>
							<Button
								color='primary'
								icon='Add'
								onClick={() => {
									setSelectedServingPointIds([]);
									setAssignServingPointSearch('');
									setShowAssignServingPointModal(true);
								}}>
								Add Serving Point
							</Button>
						</CardHeader>
						<CardBody>
							<div className='material_tabel_wrapper'>
								<div style={{ overflow: 'hidden' }}>
									<ThemeProvider theme={theme}>
										<MaterialTable
											title=' '
											//@ts-ignore
											columns={servingPointColumns}
											data={servingPoints}
											options={{
												headerStyle: headerStyles(),
												rowStyle: rowStyles(),
												search: true,
												pageSize: 5,
												pageSizeOptions: [5, 10, 20],
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
						</CardBody>
					</Card>
				</div>

				{/* ── Currently Serving ── */}
				<div className='col-12 col-xl-6'>
					<Card stretch>
						<CardHeader>
							<CardLabel icon='Group'>
								<CardTitle tag='h5'>Currently Serving ({currentServingRows.length})</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div className='material_tabel_wrapper'>
								<div style={{ overflow: 'hidden' }}>
									<ThemeProvider theme={theme}>
										<MaterialTable
											title=' '
											//@ts-ignore
											columns={currentServingColumns}
											data={currentServingRows}
											options={{
												headerStyle: headerStyles(),
												rowStyle: rowStyles(),
												search: true,
												pageSize: 5,
												pageSizeOptions: [5, 10, 20],
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
						</CardBody>
					</Card>
				</div>
			</div>

			<Modal
				isOpen={showAssignServingPointModal}
				setIsOpen={setShowAssignServingPointModal}
				size='lg'
				isCentered
				isAnimation={false}>
				<ModalHeader setIsOpen={setShowAssignServingPointModal}>
					<ModalTitle id='assign-serving-points-title'>Assign Serving Points</ModalTitle>
				</ModalHeader>
				<ModalBody>
					<div className='mb-3'>
						<input
							type='text'
							className='form-control'
							placeholder='Search serving points'
							value={assignServingPointSearch}
							onChange={(e) => setAssignServingPointSearch(e.target.value)}
						/>
					</div>
					{availableServingPoints.length === 0 ? (
						<div className='text-muted small py-3'>
							No unassigned serving points available for this queue.
						</div>
					) : (
						<div className='border rounded p-2' style={{ maxHeight: 320, overflowY: 'auto' }}>
							{availableServingPoints.map((point) => (
								<label
									key={point.id}
									className='d-flex align-items-start gap-2 px-2 py-2 border-bottom'>
									<input
										type='checkbox'
										className='form-check-input mt-1'
										checked={selectedServingPointIds.includes(point.id)}
										onChange={(e) => {
											setSelectedServingPointIds((prev) =>
												e.target.checked
													? [...prev, point.id]
													: prev.filter((item) => item !== point.id),
											);
										}}
									/>
									<div className='flex-grow-1'>
										<div className='fw-semibold'>{point.name}</div>
										{point.description && (
											<div className='small text-muted'>{point.description}</div>
										)}
									</div>
								</label>
							))}
						</div>
					)}
				</ModalBody>
				<ModalFooter>
					<Button
						color='light'
						isOutline
						onClick={() => setShowAssignServingPointModal(false)}
						isDisable={assigningServingPoints}>
						Cancel
					</Button>
					<Button
						color='primary'
						onClick={() => void handleAssignServingPoints()}
						isDisable={assigningServingPoints || selectedServingPointIds.length === 0}>
						{assigningServingPoints ? (
							<>
								<Spinner isSmall inButton />
								Assigning...
							</>
						) : (
							`Assign Selected (${selectedServingPointIds.length})`
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default QueueDetailView;

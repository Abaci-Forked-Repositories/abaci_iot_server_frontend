import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import MaterialTable, { MTableToolbar } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Icon from '../../icon/Icon';
import DropDownFilter from '../../CustomComponent/DropDown/DropDownFilter';
import TokenCreateForm from '../../PageComponents/QueueManagement/TokenCreateForm';
import useTablestyle from '../../../hooks/useTablestyles';
import {
	type CreateTokenPayload,
	type Queue,
	type QueueSchedule,
	type QueueStatus,
	type ServingPoint,
	type Token,
	queuesApi,
	schedulesApi,
	tokensApi,
} from '../../../services/queueManagementApi';
import { initialTokenForm } from '../QueueManagement/queueManagementConstants';
import { formatDate, getErrorMessage, statusBadgeColor } from '../QueueManagement/queueManagementUtils';

const scheduleStatusBadgeColor = (status?: string) => {
	const normalized = (status || '').toLowerCase();
	if (normalized === 'running') return 'success';
	if (normalized === 'scheduled') return 'primary';
	if (normalized === 'onhold' || normalized === 'on_hold') return 'warning';
	if (normalized === 'completed') return 'info';
	if (normalized === 'canceled' || normalized === 'cancelled') return 'danger';
	return 'secondary';
};

const ScheduleDetailWorkspace: React.FC = () => {
	const { scheduleId } = useParams<{ scheduleId: string }>();
	const location = useLocation();
	const queueIdFromState = (location.state as { queueId?: number; queueName?: string } | null)?.queueId;
	const queueNameFromState = (location.state as { queueName?: string } | null)?.queueName;

	const sid = Number(scheduleId);

	const [loading, setLoading] = useState(true);
	const [tokenSaving, setTokenSaving] = useState(false);
	const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [queues, setQueues] = useState<Queue[]>([]);
	const [scheduleRecord, setScheduleRecord] = useState<QueueSchedule | null>(null);
	const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
	const [tokens, setTokens] = useState<Token[]>([]);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [tokenForm, setTokenForm] = useState<CreateTokenPayload>(initialTokenForm);
	const [tokenStatusFilter, setTokenStatusFilter] = useState<{ label: string; value: string }>({
		label: 'All',
		value: 'all',
	});

	const queueId = scheduleRecord?.queue ?? queueIdFromState ?? 0;
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();

	const clearMessages = () => {
		setError('');
		setSuccess('');
	};

	const load = useCallback(async () => {
		if (!sid || Number.isNaN(sid)) {
			setLoading(false);
			return;
		}

		setLoading(true);
		clearMessages();
		try {
			const sch = await schedulesApi.get(sid);
			setScheduleRecord(sch);
			const qid = sch.queue;

			const [queuesRes, pointsRes, tokensRes, statusRes] = await Promise.all([
				queuesApi.list({ ordering: 'name', page_size: 200 }),
				queuesApi.servingPoints({ queue: qid, ordering: 'name', page_size: 100 }),
				tokensApi.list({ queue: qid, ordering: '-created_at', page_size: 200 }),
				tokensApi.queueStatus(qid),
			]);
			setQueues(queuesRes.results || []);
			setServingPoints((pointsRes.results || []).filter((point) => point.queue === qid));
			const allTok = tokensRes.results || [];
			setTokens(allTok.filter((t) => (t.schedule ?? null) === sid));
			setQueueStatus(statusRes);
			setTokenForm((prev) => ({ ...prev, schedule_id: sid }));
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [sid]);

	useEffect(() => {
		void load();
	}, [load]);

	const handleCreateToken = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setTokenSaving(true);
		clearMessages();
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
				priority: tokenForm.priority,
				is_vip: tokenForm.is_vip,
			});
			setSuccess('Token created successfully.');
			setShowCreateTokenModal(false);
			setTokenForm((prev) => ({
				...initialTokenForm,
				schedule_id: prev.schedule_id,
			}));
			await load();
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setTokenSaving(false);
		}
	};

	const queueName = useMemo(() => {
		if (scheduleRecord?.queue_name) return scheduleRecord.queue_name;
		if (queueNameFromState) return queueNameFromState;
		return queues.find((queue) => queue.id === queueId)?.name || 'Queue';
	}, [queues, queueId, queueNameFromState, scheduleRecord?.queue_name]);

	const servingPointColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
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
					<Badge color={rowData.is_available ? 'success' : 'secondary'} isLight>
						{rowData.is_available ? 'Available' : 'Busy'}
					</Badge>
				),
			},
		],
		[],
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

	const filteredTokens = useMemo(() => {
		if (tokenStatusFilter.value === 'all') {
			return tokens;
		}
		return tokens.filter((token) => token.status === tokenStatusFilter.value);
	}, [tokenStatusFilter.value, tokens]);

	const tokenToolbar = (props: any) => (
		<div className='d-flex align-items-center justify-content-end gap-2 pe-2'>
			<DropDownFilter
				options={tokenStatusFilterOptions}
				onChange={setTokenStatusFilter}
				selectedOption={tokenStatusFilter}
				labelField='label'
				icon='FilterAlt'
				direction='down'
				buttonClassName='text-nowrap'
			/>
			<div style={{ display: 'inline-flex', width: 'auto', flex: '0 0 auto', minWidth: 0 }}>
				<MTableToolbar {...props} />
			</div>
		</div>
	);

	return (
		<>
			{error && <div className='alert alert-danger mb-3'>{error}</div>}
			{success && <div className='alert alert-success mb-3'>{success}</div>}

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
									<div className='h4 mb-0 fw-bold'>Schedule Details</div>
								</div>
								<Badge color={scheduleStatusBadgeColor(scheduleRecord?.status)} isLight>
									{scheduleRecord?.status || 'unknown'}
								</Badge>
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
										<div className='fs-5 fw-bold'>{queueStatus?.reported ?? 0}</div>
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
								<CardTitle tag='h5'>Serving Points ({servingPoints.length})</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							{loading ? (
								<div className='text-center text-muted py-4'>Loading serving points...</div>
							) : (
								<div className='material_tabel_wrapper'>
									<div style={{ overflow: 'hidden' }}>
										<ThemeProvider theme={theme}>
											<MaterialTable
												title=' '
												// @ts-ignore
												columns={servingPointColumns}
												data={servingPoints}
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

			<Modal isOpen={showCreateTokenModal} setIsOpen={setShowCreateTokenModal} isCentered size='xl' isAnimation={false}>
				<ModalHeader setIsOpen={setShowCreateTokenModal}>
					<ModalTitle id='create-token-modal'>Create Token for Schedule</ModalTitle>
				</ModalHeader>
				<ModalBody>
					<TokenCreateForm
						tokenForm={tokenForm}
						setTokenForm={setTokenForm}
						queues={queues}
						schedules={scheduleRecord ? [scheduleRecord] : []}
						selectedQueueId={queueId}
						onQueueChange={() => {}}
						fixedScheduleId={sid}
						servingPoints={servingPoints}
						onSubmit={handleCreateToken}
						isSubmitting={tokenSaving}
					/>
				</ModalBody>
			</Modal>
		</>
	);
};

export default ScheduleDetailWorkspace;

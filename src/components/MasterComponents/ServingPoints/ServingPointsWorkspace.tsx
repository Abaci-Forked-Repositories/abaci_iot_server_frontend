import React, { useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import StatusBadge from '../../BadgeWithIcon.jsx';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import ServingPointModal from '../../PageComponents/ServingPoints/ServingPointModal';
import ServingPointStatusModal from '../../PageComponents/ServingPoints/ServingPointStatusModal';
import {
	type Queue,
	type ServingPoint,
	queuesApi,
} from '../../../services/queueManagementApi';
import {
	formatDate,
	getNextAllowedServingPointStatuses,
	servingPointQueueIds,
} from '../QueueManagement/queueManagementUtils';
import Tooltip from '@mui/material/Tooltip';

const ServingPointsWorkspace: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const queueIdFromQuery = Number(searchParams.get('queueId'));

	const [loading, setLoading] = useState(true);
	const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [modalServingPoint, setModalServingPoint] = useState<ServingPoint | null>(null);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [statusModalPoint, setStatusModalPoint] = useState<ServingPoint | null>(null);
	const [queues, setQueues] = useState<Queue[]>([]);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	useEffect(() => {
		let active = true;
		const run = async () => {
			setLoading(true);
			try {
				const [queuesRes, pointsRes] = await Promise.all([
					queuesApi.list({ ordering: 'name', page_size: 200 }),
					queuesApi.servingPoints({ ordering: '-created_at', page_size: 300 }),
				]);
				if (!active) return;
				setQueues(queuesRes.results || []);
				setServingPoints(pointsRes.results || []);
			} catch (err) {
				if (active) errorNotifierRef.current(err);
			} finally {
				if (active) setLoading(false);
			}
		};
		void run();
		return () => {
			active = false;
		};
	}, []);

	const queueNameMap = useMemo(() => {
		return new Map(queues.map((q) => [q.id, q.name]));
	}, [queues]);

	const columns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: ServingPoint) => rowData.name || '—',
			},
			{
				title: 'Queue',
				field: 'queue',
				render: (rowData: ServingPoint) => {
					const ids = servingPointQueueIds(rowData);
					if (ids.length === 0) return '—';
					return (
						<div className='d-flex flex-wrap gap-1' onClick={(ev) => ev.stopPropagation()}>
							{ids.map((qid) => {
								const name = queueNameMap.get(qid) || `Queue ${qid}`;
								return (
									<Tooltip key={qid} title='View details of queue' arrow placement='top'>
										<span
											role='button'
											tabIndex={0}
											className='rounded-2 px-2 py-1 small bg-primary bg-opacity-10 text-body border border-primary border-opacity-25'
											style={{ cursor: 'pointer' }}
											onClick={(ev) => {
												ev.preventDefault();
												ev.stopPropagation();
												navigate(`/queue-management/${qid}`);
											}}
											onKeyDown={(ev) => {
												if (ev.key === 'Enter' || ev.key === ' ') {
													ev.preventDefault();
													ev.stopPropagation();
													navigate(`/queue-management/${qid}`);
												}
											}}>
											{name}
										</span>
									</Tooltip>
								);
							})}
						</div>
					);
				},
			},
			{
				title: 'Description',
				field: 'description',
				render: (rowData: ServingPoint) => rowData.description || '—',
			},
			{
				title: 'Status',
				field: 'status',
				render: (rowData: ServingPoint) => (
					<StatusBadge status={rowData.status} isAvailable={rowData.is_available} />
				),
			},
			{
				title: 'Listing',
				field: 'is_active',
				render: (rowData: ServingPoint) => {
					const listedOn = rowData.is_active ?? rowData.is_available ?? false;
					return <StatusBadge status={listedOn ? 'active' : 'inactive'} />;
				},
			},
			{
				title: 'Created at',
				field: 'created_at',
				render: (rowData: ServingPoint) => formatDate(rowData.created_at),
			},
			{
				title: 'Actions',
				field: 'actions',
				sorting: false,
				filtering: false,
				render: (rowData: ServingPoint) => {
					const isActive = rowData.is_active ?? rowData.is_available ?? false;
					const canChangeCounterStatus =
						getNextAllowedServingPointStatuses(rowData.status).length > 0;
					return (
						<div className='d-flex align-items-center gap-2'>
							{canChangeCounterStatus && (
								<Tooltip title='Change counter status'>
									<span className='d-inline-flex'>
										<Button
											color='primary'
											isLight
											size='sm'
											icon='TrackChanges'
											onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
												event.preventDefault();
												event.stopPropagation();
												setStatusModalPoint(rowData);
												setShowStatusModal(true);
											}}
										/>
									</span>
								</Tooltip>
							)}
							<Tooltip title='Edit Serving Point'>
							<Button
								color='primary'
								isLight
								size='sm'
								icon='Edit'
								onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
									event.preventDefault();
									event.stopPropagation();
									setModalMode('edit');
									setModalServingPoint(rowData);
									setShowModal(true);
								}}>
							</Button>
							</Tooltip>
							<Tooltip title={isActive ? 'Disable Serving Point' : 'Enable Serving Point'}>
							<Button
								color={isActive ? 'danger' : 'success'}
								isLight
								size='sm'
								icon={isActive ? 'Block' : 'CheckCircle'}
								isDisable={statusUpdatingId === rowData.id}
								onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
									event.preventDefault();
									event.stopPropagation();
									setStatusUpdatingId(rowData.id);
									try {
										const updated = await queuesApi.updateServingPoint(rowData.id, {
											is_active: !isActive,
										});
										setServingPoints((prev) =>
											prev.map((item) => (item.id === rowData.id ? updated : item)),
										);
										showSuccessNotification(
											`Serving point ${isActive ? 'disabled' : 'enabled'} successfully.`,
										);
									} catch (err) {
										showErrorNotification(err);
									} finally {
										setStatusUpdatingId(null);
									}
								}}>
								</Button>
							</Tooltip>
						</div>
					);
				},
			},
		],
		[navigate, queueNameMap, showErrorNotification, showSuccessNotification, statusUpdatingId],
	);

	const defaultQueueId =
		Number.isNaN(queueIdFromQuery) || !queueIdFromQuery ? null : queueIdFromQuery;

	return (
		<>
			<Card stretch>
				<CardHeader>
					<div className='d-flex align-items-center gap-3'>
						<div className='media-files-title-text d-flex align-items-center gap-2'>
							<Icon icon='Monitor' color='primary' size='2x' />
							<span>Serving Points ({servingPoints.length})</span>
						</div>
					</div>
					<CardActions>
						<Button
							color='primary'
							icon='Add'
							onClick={() => {
								setModalMode('add');
								setModalServingPoint(null);
								setShowModal(true);
							}}>
							Add Serving Point
						</Button>
					</CardActions>
				</CardHeader>
				<CardBody>
					{loading ? (
						<div className='text-center text-muted py-5'>Loading serving points...</div>
					) : (
						<div className='material_tabel_wrapper'>
							<div style={{ overflow: 'hidden' }}>
								<ThemeProvider theme={theme}>
									<MaterialTable
										title=' '
										// @ts-ignore
										columns={columns}
										data={servingPoints}
										options={{
											headerStyle: headerStyles(),
											rowStyle: rowStyles(),
											search: true,
											pageSize: 10,
											pageSizeOptions: [10, 20, 50],
											emptyRowsWhenPaging: false,
										}}
										localization={{
											pagination: {
												labelRowsPerPage: '',
											},
										}}
										onRowClick={(_, rowData) => {
											const row = rowData as ServingPoint | undefined;
											if (!row?.id) return;
											navigate(`/serving-points/${row.id}`, {
												state: { servingPointName: row.name || undefined },
											});
										}}
									/>
								</ThemeProvider>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			<ServingPointModal
				isOpen={showModal}
				setIsOpen={setShowModal}
				mode={modalMode}
				servingPoint={modalServingPoint}
				defaultQueueId={defaultQueueId}
				onSuccess={(point, mode) => {
					if (mode === 'add') {
						setServingPoints((prev) => [point, ...prev]);
					} else {
						setServingPoints((prev) => prev.map((item) => (item.id === point.id ? point : item)));
					}
					setModalServingPoint(null);
				}}
			/>

			<ServingPointStatusModal
				isOpen={showStatusModal}
				setIsOpen={setShowStatusModal}
				servingPoint={statusModalPoint}
				onSuccess={(updated) => {
					setServingPoints((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
					setStatusModalPoint(null);
				}}
			/>
		</>
	);
};

export default ServingPointsWorkspace;


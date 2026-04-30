import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Badge from '../../bootstrap/Badge';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import ServingPointModal, {
	type ServingPointFormValues,
} from '../../PageComponents/ServingPoints/ServingPointModal';
import {
	type CreateServingPointPayload,
	type Queue,
	type ServingPoint,
	type User,
	queuesApi,
	usersApi,
} from '../../../services/queueManagementApi';
import { formatDate } from '../QueueManagement/queueManagementUtils';

const ServingPointsWorkspace: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const queueIdFromQuery = Number(searchParams.get('queueId'));

	const [loading, setLoading] = useState(true);
	const [modalSaving, setModalSaving] = useState(false);
	const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [editingServingPointId, setEditingServingPointId] = useState<number | null>(null);
	const [queues, setQueues] = useState<Queue[]>([]);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [form, setForm] = useState<ServingPointFormValues>({
		name: '',
		queue: '',
		description: '',
		is_active: true,
		assigned_users: [],
	});

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification, showSuccessNotification, showNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const resetForm = useCallback(() => {
		setForm({
			name: '',
			queue: Number.isNaN(queueIdFromQuery) || !queueIdFromQuery ? '' : String(queueIdFromQuery),
			description: '',
			is_active: true,
			assigned_users: [],
		});
	}, [queueIdFromQuery]);

	useEffect(() => {
		resetForm();
		let active = true;
		const run = async () => {
			setLoading(true);
			try {
				const [queuesRes, pointsRes, usersRes] = await Promise.all([
					queuesApi.list({ ordering: 'name', page_size: 200 }),
					queuesApi.servingPoints({ ordering: '-created_at', page_size: 300 }),
					usersApi.list({ ordering: 'username', page_size: 300 }),
				]);
				if (!active) return;
				setQueues(queuesRes.results || []);
				setServingPoints(pointsRes.results || []);
				setUsers(usersRes.results || []);
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
	}, [resetForm]);

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
				render: (rowData: ServingPoint) => queueNameMap.get(rowData.queue) || `Queue ${rowData.queue}`,
			},
			{
				title: 'Description',
				field: 'description',
				render: (rowData: ServingPoint) => rowData.description || '—',
			},
			{
				title: 'Status',
				field: 'is_active',
				render: (rowData: ServingPoint) => (
					<Badge
						color={(rowData.is_active ?? rowData.is_available) ? 'success' : 'secondary'}
						isLight>
						{(rowData.is_active ?? rowData.is_available) ? 'Active' : 'Inactive'}
					</Badge>
				),
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
					return (
						<div className='d-flex align-items-center gap-2'>
							<Button
								color='primary'
								isLight
								size='sm'
								icon='Edit'
								onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
									event.preventDefault();
									event.stopPropagation();
									setModalMode('edit');
									setEditingServingPointId(rowData.id);
									setForm({
										name: rowData.name || '',
										queue: String(rowData.queue || ''),
										description: rowData.description || '',
										is_active: Boolean(rowData.is_active ?? true),
										assigned_users: [],
									});
									setShowModal(true);
								}}>
								Edit
							</Button>
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
								{isActive ? 'Disable' : 'Enable'}
							</Button>
						</div>
					);
				},
			},
		],
		[queueNameMap, showErrorNotification, showSuccessNotification, statusUpdatingId],
	);

	const handleSubmitServingPoint = async () => {
		if (!form.name.trim()) {
			showNotification('Error', 'Serving point name is required.', 'danger');
			return;
		}
		if (!form.queue) {
			showNotification('Error', 'Queue is required.', 'danger');
			return;
		}

		setModalSaving(true);
		try {
			if (modalMode === 'add') {
				const payload: CreateServingPointPayload = {
					name: form.name.trim(),
					queue: Number(form.queue),
					description: form.description.trim() || undefined,
					is_active: form.is_active,
					assigned_users: form.assigned_users,
				};
				const created = await queuesApi.createServingPoint(payload);
				setServingPoints((prev) => [created, ...prev]);
				showSuccessNotification('Serving point created successfully.');
				resetForm();
			} else if (editingServingPointId) {
				const updated = await queuesApi.updateServingPoint(editingServingPointId, {
					name: form.name.trim(),
					queue: Number(form.queue),
					description: form.description.trim() || undefined,
					is_active: form.is_active,
				});
				setServingPoints((prev) =>
					prev.map((item) => (item.id === editingServingPointId ? updated : item)),
				);
				showSuccessNotification('Serving point updated successfully.');
			}
			setShowModal(false);
			setEditingServingPointId(null);
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setModalSaving(false);
		}
	};

	const userOptions = useMemo(
		() =>
			users.map((user) => ({
				value: user.id,
				label: user.username || user.email || `User ${user.id}`,
			})),
		[users],
	);

	const selectedUserOptions = useMemo(
		() => userOptions.filter((option) => form.assigned_users.includes(option.value)),
		[form.assigned_users, userOptions],
	);

	return (
		<>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='Monitor'>
						<CardTitle tag='h5'>Serving Points ({servingPoints.length})</CardTitle>
					</CardLabel>
					<Button
						color='primary'
						icon='Add'
						onClick={() => {
							setModalMode('add');
							setEditingServingPointId(null);
							resetForm();
							setShowModal(true);
						}}>
						Add Serving Point
					</Button>
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
											navigate(`/serving-points/${row.id}`);
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
				form={form}
				setForm={setForm}
				queues={queues}
				userOptions={userOptions}
				selectedUserOptions={selectedUserOptions}
				isSubmitting={modalSaving}
				onSubmit={() => void handleSubmitServingPoint()}
				onCancel={() => {
					setShowModal(false);
					setEditingServingPointId(null);
				}}
			/>
		</>
	);
};

export default ServingPointsWorkspace;


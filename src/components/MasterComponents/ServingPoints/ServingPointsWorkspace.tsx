import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useSearchParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Badge from '../../bootstrap/Badge';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import ReactSelectWithState from '../../CustomComponent/Select/ReactSelect';
import useTablestyle from '../../../hooks/useTablestyles';
import {
	type CreateServingPointPayload,
	type Queue,
	type ServingPoint,
	type User,
	queuesApi,
	usersApi,
} from '../../../services/queueManagementApi';
import { formatDate, getErrorMessage } from '../QueueManagement/queueManagementUtils';

const ServingPointsWorkspace: React.FC = () => {
	const [searchParams] = useSearchParams();
	const queueIdFromQuery = Number(searchParams.get('queueId'));

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showAddModal, setShowAddModal] = useState(false);
	const [queues, setQueues] = useState<Queue[]>([]);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [form, setForm] = useState<{
		name: string;
		queue: string;
		description: string;
		is_active: boolean;
		assigned_users: number[];
	}>({
		name: '',
		queue: '',
		description: '',
		is_active: true,
		assigned_users: [],
	});

	const { theme, headerStyles, rowStyles } = useTablestyle();

	const clearMessages = () => {
		setError('');
		setSuccess('');
	};

	const resetForm = useCallback(() => {
		setForm({
			name: '',
			queue: Number.isNaN(queueIdFromQuery) || !queueIdFromQuery ? '' : String(queueIdFromQuery),
			description: '',
			is_active: true,
			assigned_users: [],
		});
	}, [queueIdFromQuery]);

	const loadData = useCallback(async () => {
		setLoading(true);
		clearMessages();
		try {
			const [queuesRes, pointsRes, usersRes] = await Promise.all([
				queuesApi.list({ ordering: 'name', page_size: 200 }),
				queuesApi.servingPoints({ ordering: '-created_at', page_size: 300 }),
				usersApi.list({ ordering: 'username', page_size: 300 }),
			]);
			setQueues(queuesRes.results || []);
			setServingPoints(pointsRes.results || []);
			setUsers(usersRes.results || []);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		resetForm();
		void loadData();
	}, [loadData, resetForm]);

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
		],
		[queueNameMap],
	);

	const handleCreateServingPoint = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		clearMessages();

		if (!form.name.trim()) {
			setError('Serving point name is required.');
			return;
		}
		if (!form.queue) {
			setError('Queue is required.');
			return;
		}

		setSaving(true);
		try {
			const payload: CreateServingPointPayload = {
				name: form.name.trim(),
				queue: Number(form.queue),
				description: form.description.trim() || undefined,
				is_active: form.is_active,
				assigned_users: form.assigned_users,
			};
			const created = await queuesApi.createServingPoint(payload);
			setServingPoints((prev) => [created, ...prev]);
			setSuccess('Serving point created successfully.');
			setShowAddModal(false);
			resetForm();
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setSaving(false);
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
					<Button color='primary' icon='Add' onClick={() => setShowAddModal(true)}>
						Add Serving Point
					</Button>
				</CardHeader>
				<CardBody>
					{error && <div className='alert alert-danger mb-3'>{error}</div>}
					{success && <div className='alert alert-success mb-3'>{success}</div>}

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
									/>
								</ThemeProvider>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			<Modal isOpen={showAddModal} setIsOpen={setShowAddModal} isCentered size='lg' isAnimation={false}>
				<ModalHeader setIsOpen={setShowAddModal}>
					<ModalTitle id='add-serving-point-modal'>Add Serving Point</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleCreateServingPoint}>
					<ModalBody>
						<div className='row g-3'>
							<div className='col-12'>
								<label className='form-label fw-semibold' htmlFor='sp-name'>
									Name
								</label>
								<input
									id='sp-name'
									className='form-control'
									value={form.name}
									onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
									placeholder='Enter serving point name'
									required
								/>
							</div>
							<div className='col-md-6'>
								<label className='form-label fw-semibold' htmlFor='sp-queue'>
									Queue
								</label>
								<select
									id='sp-queue'
									className='form-select'
									value={form.queue}
									onChange={(e) => setForm((prev) => ({ ...prev, queue: e.target.value }))}
									required>
									<option value=''>Select queue</option>
									{queues.map((queue) => (
										<option value={queue.id} key={queue.id}>
											{queue.name}
										</option>
									))}
								</select>
							</div>
							<div className='col-md-6 d-flex align-items-end'>
								<div className='form-check form-switch mb-2'>
									<input
										className='form-check-input'
										type='checkbox'
										id='sp-active'
										checked={form.is_active}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, is_active: e.target.checked }))
										}
									/>
									<label className='form-check-label fw-semibold' htmlFor='sp-active'>
										Active
									</label>
								</div>
							</div>
							<div className='col-12'>
								<label className='form-label fw-semibold'>Assigned Users</label>
								<ReactSelectWithState
									options={userOptions}
									value={selectedUserOptions}
									setValue={(selected: Array<{ value: number; label: string }> | null) =>
										setForm((prev) => ({
											...prev,
											assigned_users: (selected || []).map((option) => option.value),
										}))
									}
									isMulti
									placeholder='Select users'
								/>
							</div>
							<div className='col-12'>
								<label className='form-label fw-semibold' htmlFor='sp-description'>
									Description
								</label>
								<textarea
									id='sp-description'
									className='form-control'
									rows={3}
									value={form.description}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, description: e.target.value }))
									}
									placeholder='Short description'
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color='light'
							isLight
							onClick={() => {
								setShowAddModal(false);
								resetForm();
							}}>
							Cancel
						</Button>
						<Button color='primary' type='submit' isDisable={saving}>
							{saving ? (
								<>
									<Spinner isSmall inButton />
									Creating...
								</>
							) : (
								'Create Serving Point'
							)}
						</Button>
					</ModalFooter>
				</form>
			</Modal>
		</>
	);
};

export default ServingPointsWorkspace;


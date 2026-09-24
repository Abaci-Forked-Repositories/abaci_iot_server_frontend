import React, { useEffect, useMemo, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import useToasterNotification from '../../hooks/useToasterNotification';
import {
	createDeviceGroup,
	getDeviceGroups,
	updateDeviceGroup,
	type DeviceGroup,
} from '../../api/devices/deviceGroups';
import { getDevices, type Device } from '../../api/devices/devices';
import DeviceGroupFormModal, { type DeviceGroupFormData } from './DeviceGroupFormModal';

interface DeviceGroupsTabProps {
	canWrite: boolean;
}

const CARD_STYLES = `
.device-group-card {
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	cursor: pointer;
	height: 100%;
}
.device-group-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
`;

const extractList = <T,>(response: any, keys: string[]): T[] => {
	for (const key of keys) {
		if (Array.isArray(response?.[key])) return response[key];
	}
	if (Array.isArray(response)) return response;
	return [];
};

const DeviceGroupsTab: React.FC<DeviceGroupsTabProps> = ({ canWrite }) => {
	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);
	const [viewingGroup, setViewingGroup] = useState<DeviceGroup | null>(null);
	const [saving, setSaving] = useState(false);
	const [groupSearch, setGroupSearch] = useState('');
	const [debouncedGroupSearch, setDebouncedGroupSearch] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedGroupSearch(groupSearch), 400);
		return () => clearTimeout(timer);
	}, [groupSearch]);

	const {
		data: groupsResponse,
		isLoading: groupsLoading,
		isError: groupsError,
		error: groupsErrorObj,
		refetch: refetchGroups,
	} = useQuery({
		queryKey: ['device-groups', debouncedGroupSearch],
		queryFn: () =>
			getDeviceGroups({
				page: 1,
				limit: 100,
				search: debouncedGroupSearch.trim(),
			}),
	});

	const {
		data: devicesResponse,
		isLoading: devicesLoading,
		isError: devicesError,
		error: devicesErrorObj,
	} = useQuery({
		queryKey: ['devices', 'picker'],
		queryFn: () => getDevices({ page: 1, limit: 1000 }),
	});

	useEffect(() => {
		if (groupsError && groupsErrorObj) {
			showErrorNotification(groupsErrorObj);
		}
	}, [groupsError, groupsErrorObj, showErrorNotification]);

	useEffect(() => {
		if (devicesError && devicesErrorObj) {
			showErrorNotification(devicesErrorObj);
		}
	}, [devicesError, devicesErrorObj, showErrorNotification]);

	const groups: DeviceGroup[] = useMemo(
		() => extractList(groupsResponse, ['device_groups', 'device-groups', 'results', 'groups']),
		[groupsResponse],
	);

	const devices: Device[] = useMemo(
		() => extractList(devicesResponse, ['devices', 'results']),
		[devicesResponse],
	);

	const handleAdd = () => {
		setModalMode('add');
		setEditingGroup(null);
		setModalOpen(true);
	};

	const handleEdit = (group: DeviceGroup, e?: React.MouseEvent) => {
		e?.stopPropagation();
		setModalMode('edit');
		setEditingGroup(group);
		setModalOpen(true);
	};

	const handleSave = async (group: DeviceGroupFormData & { id?: number }) => {
		setSaving(true);
		try {
			if (modalMode === 'add') {
				await createDeviceGroup(group);
			} else if (group.id != null) {
				const updated = await updateDeviceGroup(group.id, {
					...group,
					id: group.id,
				});
				if (viewingGroup?.id === group.id) {
					setViewingGroup({
						...viewingGroup,
						...group,
						...updated,
					} as DeviceGroup);
				}
			}
			setModalOpen(false);
			await refetchGroups();
		} catch (error) {
			console.error('Error saving device group:', error);
			showErrorNotification(error);
		} finally {
			setSaving(false);
		}
	};

	const groupDevices: Device[] = useMemo(() => {
		if (!viewingGroup) return [];
		const ids = new Set(viewingGroup.device_ids ?? []);
		return devices.filter((d) => ids.has(d.id));
	}, [viewingGroup, devices]);

	const deviceColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				cellStyle: { fontWeight: 600 },
			},
			{ title: 'Site', field: 'site' },
			{ title: 'Description', field: 'description' },
			{ title: 'Last Online', field: 'last_online' },
			{ title: 'Last Offline', field: 'last_offline' },
			{
				title: 'Status',
				field: 'status',
				render: (rowData: Device) => (
					<span
						className={`badge ${
							rowData.status === 'Online' ? 'bg-success' : 'bg-danger'
						}`}>
						{rowData.status}
					</span>
				),
			},
		],
		[],
	);

	const formModal = (
		<DeviceGroupFormModal
			isOpen={modalOpen}
			setIsOpen={setModalOpen}
			mode={modalMode}
			group={editingGroup}
			onSave={handleSave}
			devices={devices}
			saving={saving}
		/>
	);

	// ── Detail view: devices inside selected group ──
	if (viewingGroup) {
		const count = viewingGroup.device_ids?.length ?? 0;
		return (
			<>
				{formModal}
				<div className='d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2'>
					<div className='d-flex align-items-center gap-2'>
						<Button
							color='light'
							size='sm'
							icon='ArrowBack'
							onClick={() => setViewingGroup(null)}>
							Back
						</Button>
						<div>
							<div className='fw-bold'>{viewingGroup.name}</div>
							<div className='small text-muted'>
								{count} {count === 1 ? 'device' : 'devices'}
								{viewingGroup.description
									? ` · ${viewingGroup.description}`
									: ''}
							</div>
						</div>
						<span
							className={`badge ${
								viewingGroup.status === 'Active' ? 'bg-success' : 'bg-secondary'
							}`}>
							{viewingGroup.status}
						</span>
					</div>
					{canWrite && (
						<button
							type='button'
							className='btn btn-outline-primary btn-sm'
							onClick={() => handleEdit(viewingGroup)}
							disabled={saving}>
							Edit Group
						</button>
					)}
				</div>

				{devicesLoading ? (
					<div className='text-center text-muted py-5'>Loading devices…</div>
				) : groupDevices.length === 0 ? (
					<div className='text-center text-muted py-5'>
						No devices in this group yet.
					</div>
				) : (
					<ThemeProvider theme={theme}>
						<MaterialTable
							title=''
							columns={deviceColumns}
							data={groupDevices}
							options={{
								search: true,
								sorting: true,
								paging: true,
								pageSize: 10,
								pageSizeOptions: [5, 10, 25],
								showEmptyDataSourceMessage: false,
								actionsColumnIndex: -1,
								rowStyle: rowStyles(),
								headerStyle: headerStyles(),
							}}
						/>
					</ThemeProvider>
				)}
			</>
		);
	}

	// ── Card grid view ──
	return (
		<>
			<style>{CARD_STYLES}</style>
			{formModal}

			<div className='d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2'>
				<input
					type='search'
					className='form-control form-control-sm'
					style={{ maxWidth: 260 }}
					placeholder='Search groups…'
					value={groupSearch}
					onChange={(e) => setGroupSearch(e.target.value)}
				/>
				{canWrite && (
					<button
						type='button'
						className='btn btn-primary btn-sm'
						onClick={handleAdd}
						disabled={saving}>
						+ Add Device Group
					</button>
				)}
			</div>

			{groupsLoading ? (
				<div className='text-center text-muted py-5'>Loading device groups…</div>
			) : groups.length === 0 ? (
				<div className='text-center text-muted py-5'>No device groups yet.</div>
			) : (
				<div className='row g-3'>
					{groups.map((group) => {
						const count = group.device_ids?.length ?? 0;
						return (
							<div key={group.id} className='col-12 col-sm-6 col-xl-4'>
								<Card
									className='device-group-card shadow-sm'
									borderSize={1}
									onClick={() => setViewingGroup(group)}>
									<CardBody>
										<div className='d-flex align-items-start justify-content-between gap-2 mb-2'>
											<div className='d-flex align-items-center gap-2 min-w-0'>
												<Icon
													icon='Folder'
													color='primary'
													size='2x'
												/>
												<span className='fw-bold text-truncate'>
													{group.name}
												</span>
											</div>
											<div className='d-flex align-items-center gap-2 flex-shrink-0'>
												<span
													className={`badge ${
														group.status === 'Active'
															? 'bg-success'
															: 'bg-secondary'
													}`}>
													{group.status}
												</span>
												{canWrite && (
													<button
														type='button'
														className='btn btn-sm btn-light'
														title='Edit group'
														onClick={(e) => handleEdit(group, e)}>
														<Icon icon='Edit' size='sm' />
													</button>
												)}
											</div>
										</div>

										<p
											className='text-muted small mb-3'
											style={{
												minHeight: '2.5em',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
											}}>
											{group.description || 'No description'}
										</p>

										<div className='d-flex align-items-center justify-content-between small'>
											<span className='text-muted'>
												<Icon
													icon='Devices'
													size='sm'
													className='me-1'
												/>
												{count} {count === 1 ? 'device' : 'devices'}
											</span>
											<span className='text-muted'>{group.created_at}</span>
										</div>
									</CardBody>
								</Card>
							</div>
						);
					})}
				</div>
			)}
		</>
	);
};

export default DeviceGroupsTab;
export type { DeviceGroup };

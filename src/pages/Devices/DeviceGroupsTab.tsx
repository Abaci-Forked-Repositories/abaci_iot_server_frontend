import React, { useMemo, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import DeviceGroupFormModal, { type DeviceGroupFormData } from './DeviceGroupFormModal';
import { DUMMY_DEVICES, type Device } from './devicesDummyData';

// ─── Dummy data (replace with API when backend is ready) ───
const DUMMY_GROUPS: (DeviceGroupFormData & { id: number })[] = [
	{
		id: 1,
		name: 'Alpha Inverters',
		description: 'All inverters at Site Alpha',
		device_ids: [1, 3],
		status: 'Active',
		created_at: '2026-01-20 10:00',
	},
	{
		id: 2,
		name: 'Beta Sensors',
		description: 'Temperature and voltage sensors',
		device_ids: [2, 5],
		status: 'Active',
		created_at: '2026-02-12 14:30',
	},
	{
		id: 3,
		name: 'Gateways',
		description: 'Network gateway devices',
		device_ids: [4],
		status: 'Inactive',
		created_at: '2026-03-05 09:15',
	},
];
// ────────────────────────────────────────────────────────────

export type DeviceGroup = (typeof DUMMY_GROUPS)[number];

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

const DeviceGroupsTab: React.FC<DeviceGroupsTabProps> = ({ canWrite }) => {
	const { theme, headerStyles, rowStyles } = useTablestyle();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);
	const [groups, setGroups] = useState<DeviceGroup[]>(DUMMY_GROUPS);
	const [viewingGroup, setViewingGroup] = useState<DeviceGroup | null>(null);

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

	const handleSave = (group: DeviceGroupFormData & { id?: number }) => {
		if (modalMode === 'add') {
			const newId = Math.max(0, ...groups.map((g) => g.id)) + 1;
			setGroups([...groups, { ...group, id: newId } as DeviceGroup]);
		} else {
			setGroups(
				groups.map((g) => (g.id === group.id ? ({ ...g, ...group } as DeviceGroup) : g)),
			);
			if (viewingGroup?.id === group.id) {
				setViewingGroup({ ...viewingGroup, ...group } as DeviceGroup);
			}
		}
		setModalOpen(false);
	};

	const groupDevices: Device[] = useMemo(() => {
		if (!viewingGroup) return [];
		const ids = viewingGroup.device_ids ?? [];
		return DUMMY_DEVICES.filter((d) => ids.includes(d.id));
	}, [viewingGroup]);

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

	// ── Detail view: devices inside selected group ──
	if (viewingGroup) {
		const count = viewingGroup.device_ids?.length ?? 0;
		return (
			<>
				<DeviceGroupFormModal
					isOpen={modalOpen}
					setIsOpen={setModalOpen}
					mode={modalMode}
					group={editingGroup}
					onSave={handleSave}
					devices={DUMMY_DEVICES}
				/>
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
							onClick={() => handleEdit(viewingGroup)}>
							Edit Group
						</button>
					)}
				</div>

				{groupDevices.length === 0 ? (
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
			<DeviceGroupFormModal
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				mode={modalMode}
				group={editingGroup}
				onSave={handleSave}
				devices={DUMMY_DEVICES}
			/>

			<div className='d-flex justify-content-end mb-3'>
				{canWrite && (
					<button
						type='button'
						className='btn btn-primary btn-sm'
						onClick={handleAdd}>
						+ Add Device Group
					</button>
				)}
			</div>

			{groups.length === 0 ? (
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

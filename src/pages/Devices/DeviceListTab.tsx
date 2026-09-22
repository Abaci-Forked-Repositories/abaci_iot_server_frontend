import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import useTablestyle from '../../hooks/useTablestyles';
import DeviceFormModal from './DeviceFormModal';
import { DUMMY_DEVICES, type Device } from './devicesDummyData';

export type { Device };

interface DeviceListTabProps {
	canWrite: boolean;
}

const DeviceListTab: React.FC<DeviceListTabProps> = ({ canWrite }) => {
	const navigate = useNavigate();
	const { theme, headerStyles, rowStyles } = useTablestyle();
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [devices, setDevices] = useState<Device[]>(DUMMY_DEVICES);

	const handleAdd = () => {
		setModalMode('add');
		setSelectedDevice(null);
		setModalOpen(true);
	};

	const handleEdit = (device: Device) => {
		setModalMode('edit');
		setSelectedDevice(device);
		setModalOpen(true);
	};

	const handleSave = (device: Omit<Device, 'id'> & { id?: number }) => {
		if (modalMode === 'add') {
			const newId = Math.max(0, ...devices.map((d) => d.id)) + 1;
			setDevices([...devices, { ...device, id: newId } as Device]);
		} else {
			setDevices(devices.map((d) => (d.id === device.id ? (device as Device) : d)));
		}
		setModalOpen(false);
	};

	const handleRowClick = (_event: any, rowData?: Device | Device[]) => {
		const device = Array.isArray(rowData) ? rowData[0] : rowData;
		if (device?.id != null) {
			navigate(`/devices/${device.id}`);
		}
	};

	const columns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				cellStyle: { fontWeight: 600 },
			},
			{
				title: 'Site',
				field: 'site',
			},
			{
				title: 'Description',
				field: 'description',
			},
			{
				title: 'Last Online',
				field: 'last_online',
			},
			{
				title: 'Last Offline',
				field: 'last_offline',
			},
			{
				title: 'Created At',
				field: 'created_at',
			},
			{
				title: 'Status',
				field: 'status',
				lookup: { Online: 'Online', Offline: 'Offline' },
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

	const tableActions = useMemo(() => {
		const actions: any[] = [
			{
				icon: FilterListIcon,
				tooltip: filterEnabled ? 'Hide filters' : 'Show filters',
				isFreeAction: true,
				onClick: () => setFilterEnabled((prev) => !prev),
			},
		];
		if (canWrite) {
			actions.push({
				icon: EditIcon,
				tooltip: 'Edit Device',
				onClick: (event: any, rowData: Device) => {
					event?.stopPropagation?.();
					handleEdit(rowData);
				},
			});
		}
		return actions;
	}, [filterEnabled, canWrite]);

	return (
		<>
			<DeviceFormModal
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				mode={modalMode}
				device={selectedDevice}
				onSave={handleSave}
			/>
			<div className='d-flex justify-content-end mb-3'>
				{canWrite && (
					<button
						type='button'
						className='btn btn-primary btn-sm'
						onClick={handleAdd}>
						+ Add Device
					</button>
				)}
			</div>
			<ThemeProvider theme={theme}>
				<MaterialTable
					title=''
					columns={columns}
					data={devices}
					actions={tableActions}
					onRowClick={handleRowClick}
					options={{
						search: true,
						filtering: filterEnabled,
						sorting: true,
						paging: true,
						pageSize: 10,
						pageSizeOptions: [5, 10, 25],
						showEmptyDataSourceMessage: false,
						actionsColumnIndex: -1,
						rowStyle: () => ({
							...rowStyles(),
							cursor: 'pointer',
						}),
						headerStyle: headerStyles(),
					}}
				/>
			</ThemeProvider>
		</>
	);
};

export default DeviceListTab;

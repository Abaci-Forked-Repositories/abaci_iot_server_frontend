import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable, { Query, QueryResult } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import Button from '../../components/bootstrap/Button';
import useTablestyle from '../../hooks/useTablestyles';
import useToasterNotification from '../../hooks/useToasterNotification';
import {
	createDevice,
	getDevices,
	updateDevice,
	type Device,
} from '../../api/devices/devices';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { debounceIntervalForTable } from '../../helpers/constants';
import ModernTableDateFilter from '../../components/CustomComponent/Filters/ModernTableDateFilter';
import { asMaterialTableFilterProps } from '../../components/CustomComponent/Filters/materialTableFilterTypes';
import DeviceFormModal, { type DeviceFormData } from './DeviceFormModal';

export type { Device };

interface DeviceListTabProps {
	canWrite: boolean;
}

const DeviceListTab: React.FC<DeviceListTabProps> = ({ canWrite }) => {
	const navigate = useNavigate();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [saving, setSaving] = useState(false);

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

	const refreshTable = () => {
		tableRef.current?.onQueryChange?.();
	};

	const handleSave = async (device: DeviceFormData & { id?: number }) => {
		setSaving(true);
		try {
			if (modalMode === 'add') {
				await createDevice(device);
			} else if (device.id != null) {
				await updateDevice(device.id, device);
			}
			setModalOpen(false);
			refreshTable();
		} catch (error) {
			console.error('Error saving device:', error);
			showErrorNotification(error);
		} finally {
			setSaving(false);
		}
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
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (rowData: Device) => rowData.last_online || '—',
			},
			{
				title: 'Last Offline',
				field: 'last_offline',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (rowData: Device) => rowData.last_offline || '—',
			},
			{
				title: 'Created At',
				field: 'created_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (rowData: Device) => rowData.created_at || '—',
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

	const fetchDevices = (query: Query<Device>): Promise<QueryResult<Device>> => {
		const otherFilters = formatFiltersWithOptions(query.filters);
		let ordering = '';
		if (query.orderBy?.field) {
			ordering =
				query.orderDirection === 'asc'
					? `&ordering=-${String(query.orderBy.field)}`
					: `&ordering=${String(query.orderBy.field)}`;
		}

		return getDevices({
			page: query.page + 1,
			limit: query.pageSize,
			search: query.search,
			filters: otherFilters,
			ordering,
		})
			.then((response) => ({
				data: response.devices ?? response.results ?? [],
				page: query.page,
				totalCount: response.count ?? response.total ?? 0,
			}))
			.catch((error) => {
				showErrorNotification(error);
				return {
					data: [],
					page: query.page,
					totalCount: 0,
				};
			});
	};

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
				saving={saving}
			/>
			<div className='d-flex justify-content-end mb-3'>
				{canWrite && (
					<Button color='primary' size='sm' onClick={handleAdd} isDisable={saving}>
						+ Add Device
					</Button>
				)}
			</div>
			<ThemeProvider theme={theme}>
				<MaterialTable
					title=''
					tableRef={tableRef}
					columns={columns}
					data={fetchDevices}
					actions={tableActions}
					onRowClick={handleRowClick}
					options={{
						search: true,
						filtering: filterEnabled,
						sorting: true,
						paging: true,
						pageSize: 10,
						pageSizeOptions: [5, 10, 25],
						debounceInterval: debounceIntervalForTable,
						showEmptyDataSourceMessage: false,
						actionsColumnIndex: -1,
						rowStyle: () => ({
							...rowStyles(),
							cursor: 'pointer',
						}),
						headerStyle: headerStyles(),
						searchFieldStyle: searchFieldStyle(),
					}}
				/>
			</ThemeProvider>
		</>
	);
};

export default DeviceListTab;

import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Query, QueryResult } from '@material-table/core';
import FullHeightMaterialTable from '../../components/CustomComponent/FullHeightMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '../../components/bootstrap/Button';
import useTablestyle from '../../hooks/useTablestyles';
import useDarkMode from '../../hooks/useDarkMode';
import useToasterNotification from '../../hooks/useToasterNotification';
import {
	createDevice,
	deleteDevice,
	getDeviceById,
	getDevices,
	updateDevice,
	getDeviceLabel,
	type Device,
} from '../../api/devices/devices';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { buttonColor, debounceIntervalForTable } from '../../helpers/constants';
import ModernTableDateFilter from '../../components/CustomComponent/Filters/ModernTableDateFilter';
import { asMaterialTableFilterProps } from '../../components/CustomComponent/Filters/materialTableFilterTypes';
import DeviceFormModal, { type DeviceFormData } from './DeviceFormModal';
import swalFire from '../../helpers/swalHelper';

export type { Device };

const EMPTY = '----';

const displayValue = (value: string | null | undefined) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : EMPTY;
};

const formatDateTime = (value: string | null | undefined) => {
	if (!value) return EMPTY;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

/** Material Table may pass a single row or an array — always resolve to one device. */
const resolveDeviceRow = (rowData: Device | Device[] | undefined | null): Device | null => {
	if (!rowData) return null;
	const device = Array.isArray(rowData) ? rowData[0] : rowData;
	if (!device || device.id == null) return null;
	return device;
};

interface DeviceListTabProps {
	canWrite: boolean;
}

const DeviceListTab: React.FC<DeviceListTabProps> = ({ canWrite }) => {
	const navigate = useNavigate();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [saving, setSaving] = useState(false);
	const [loadingDevice, setLoadingDevice] = useState(false);

	const handleAdd = () => {
		setModalMode('add');
		setSelectedDevice(null);
		setLoadingDevice(false);
		setModalOpen(true);
	};

	const handleEdit = async (rowData: Device | Device[]) => {
		const row = resolveDeviceRow(rowData);
		if (!row) {
			showErrorNotification('Unable to edit device: missing device id.');
			return;
		}

		// Start the GET immediately — don't wait on modal/render work.
		const fetchPromise = getDeviceById(row.id);

		setModalMode('edit');
		setSelectedDevice(row); // fill instantly from list row
		setLoadingDevice(true);
		setModalOpen(true);

		try {
			const fresh = await fetchPromise;
			setSelectedDevice(fresh);
		} catch (error) {
			showErrorNotification(error);
		} finally {
			setLoadingDevice(false);
		}
	};

	const refreshTable = () => {
		tableRef.current?.onQueryChange?.();
	};

	const handleDelete = (rowData: Device | Device[]) => {
		const device = resolveDeviceRow(rowData);
		if (!device) {
			showErrorNotification('Unable to delete device: missing device id.');
			return;
		}
		swalFire({
			title: 'Are you sure?',
			icon: 'info',
			text: `Delete device "${getDeviceLabel(device)}"? You won't be able to revert this!`,
			showCancelButton: true,
			iconColor: buttonColor[0],
			theme: darkModeStatus ? 'dark' : 'light',
			confirmButtonColor: buttonColor[0],
			cancelButtonColor: buttonColor[1],
			confirmButtonText: 'Delete',
		}).then(async (result: any) => {
			if (!result.isConfirmed) return;
			try {
				await deleteDevice(device.id);
				showSuccessNotification('Device deleted successfully.');
				refreshTable();
			} catch (error) {
				showErrorNotification(error);
			}
		});
	};

	const handleSave = async (formData: DeviceFormData & { id?: number }) => {
		setSaving(true);
		try {
			const payload = {
				model: formData.model || null,
				identifier: formData.identifier || null,
				serial_number: formData.serial_number || null,
				description: formData.description || null,
				wifi_ip_address: formData.wifi_ip_address || null,
				wifi_mask: formData.wifi_mask || null,
				wifi_gateway: formData.wifi_gateway || null,
				wifi_ssid: formData.wifi_ssid || null,
				wifi_password: formData.wifi_password || null,
				firmware_version: formData.firmware_version || null,
			};

			if (modalMode === 'add') {
				await createDevice(payload);
				showSuccessNotification('Device created successfully.');
			} else {
				const deviceId = selectedDevice?.id ?? formData.id;
				if (deviceId == null) {
					showErrorNotification('Unable to update device: missing device id.');
					return;
				}
				await updateDevice(deviceId, payload);
				showSuccessNotification('Device updated successfully.');
			}

			setModalOpen(false);
			setSelectedDevice(null);
			refreshTable();
		} catch (error) {
			console.error('Error saving device:', error);
			showErrorNotification(error);
		} finally {
			setSaving(false);
		}
	};

	const handleRowClick = (_event: any, rowData?: Device | Device[]) => {
		const device = resolveDeviceRow(rowData ?? null);
		if (device) {
			navigate(`/devices/${device.id}`);
		}
	};

	const columns = useMemo(
		() => [
			{
				title: 'Model',
				field: 'model',
				cellStyle: { fontWeight: 600 },
				render: (rowData: Device) => displayValue(rowData.model),
			},
			{
				title: 'Identifier',
				field: 'identifier',
				render: (rowData: Device) => displayValue(rowData.identifier),
			},
			{
				title: 'Serial Number',
				field: 'serial_number',
				render: (rowData: Device) => displayValue(rowData.serial_number),
			},
			{
				title: 'Description',
				field: 'description',
				render: (rowData: Device) => displayValue(rowData.description),
			},
			{
				title: 'Firmware',
				field: 'firmware_version',
				render: (rowData: Device) => displayValue(rowData.firmware_version),
			},
			{
				title: 'WiFi SSID',
				field: 'wifi_ssid',
				render: (rowData: Device) => displayValue(rowData.wifi_ssid),
			},
			{
				title: 'WiFi IP',
				field: 'wifi_ip_address',
				render: (rowData: Device) => displayValue(rowData.wifi_ip_address),
			},
			{
				title: 'Created At',
				field: 'created_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (rowData: Device) => formatDateTime(rowData.created_at),
			},
			{
				title: 'Updated At',
				field: 'updated_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (rowData: Device) => formatDateTime(rowData.updated_at),
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
					? `&ordering=${String(query.orderBy.field)}`
					: `&ordering=-${String(query.orderBy.field)}`;
		}

		return getDevices({
			page: query.page + 1,
			limit: query.pageSize,
			search: query.search,
			filters: otherFilters,
			ordering,
		})
			.then((response) => {
				let rows = response.results;

				const search = (query.search || '').trim().toLowerCase();
				if (search) {
					rows = rows.filter(
						(r) =>
							r.model?.toLowerCase().includes(search) ||
							r.identifier?.toLowerCase().includes(search) ||
							r.serial_number?.toLowerCase().includes(search) ||
							r.description?.toLowerCase().includes(search) ||
							r.firmware_version?.toLowerCase().includes(search) ||
							r.wifi_ssid?.toLowerCase().includes(search) ||
							r.wifi_ip_address?.toLowerCase().includes(search),
					);
				}

				query.filters?.forEach((f) => {
					const value = String(f.value ?? '').trim();
					if (!value || !f.column.field) return;
					const field = String(f.column.field);
					rows = rows.filter((r) =>
						String((r as any)[field] ?? '')
							.toLowerCase()
							.includes(value.toLowerCase()),
					);
				});

				const isFullList = response.count === response.results.length;
				const totalCount = isFullList ? rows.length : response.count;
				const start = query.page * query.pageSize;
				const pageData = isFullList
					? rows.slice(start, start + query.pageSize)
					: rows;

				return {
					data: pageData,
					page: query.page,
					totalCount,
				};
			})
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
			actions.push(
				{
					icon: EditIcon,
					tooltip: 'Edit Device',
					onClick: (event: any, rowData: Device) => {
						event?.stopPropagation?.();
						handleEdit(rowData);
					},
				},
				{
					icon: DeleteIcon,
					tooltip: 'Delete Device',
					onClick: (event: any, rowData: Device) => {
						event?.stopPropagation?.();
						handleDelete(rowData);
					},
				},
			);
		}
		return actions;
	}, [filterEnabled, canWrite, darkModeStatus]);

	return (
		<>
			<DeviceFormModal
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				mode={modalMode}
				device={selectedDevice}
				onSave={handleSave}
				saving={saving}
				loading={loadingDevice}
			/>
			<div className='material-table-page-host'>
				<div className='d-flex justify-content-end mb-3 flex-shrink-0'>
					{canWrite && (
						<Button color='primary' size='sm' onClick={handleAdd} isDisable={saving}>
							+ Add Device
						</Button>
					)}
				</div>
				<ThemeProvider theme={theme}>
					<FullHeightMaterialTable
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
							showEmptyDataSourceMessage: true,
							emptyRowsWhenPaging: false,
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
			</div>
		</>
	);
};

export default DeviceListTab;

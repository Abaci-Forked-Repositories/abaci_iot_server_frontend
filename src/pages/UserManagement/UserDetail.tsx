import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Query, QueryResult } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import FullHeightMaterialTable from '../../components/CustomComponent/FullHeightMaterialTable';
import useTablestyle from '../../hooks/useTablestyles';
import useDarkMode from '../../hooks/useDarkMode';
import useToasterNotification from '../../hooks/useToasterNotification';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import { getUserById, getUserDevices } from '../../api/users/users';
import {
	addDevicesToSubscription,
	removeDevicesFromSubscription,
} from '../../api/subscriptions/subscriptions';
import { getDeviceLabel, type Device } from '../../api/devices/devices';
import { buttonColor, debounceIntervalForTable } from '../../helpers/constants';
import swalFire from '../../helpers/swalHelper';
import AddUserDevicesModal from './AddUserDevicesModal';

const EMPTY = '----';

const ROLE_LABELS: Record<string, string> = {
	admin: 'Admin',
	view: 'View',
	edit: 'Edit',
};

const displayValue = (value: string | null | undefined) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : EMPTY;
};

const getUserTitle = (user: {
	first_name?: string | null;
	last_name?: string | null;
	email?: string | null;
}) => {
	const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
	return name || user.email?.trim() || 'User';
};

const UserDetail: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const [addOpen, setAddOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [assignedDeviceIds, setAssignedDeviceIds] = useState<number[]>([]);
	const subscriptionIdRef = useRef<number | null>(null);

	const { data: user, isLoading, isError, error } = useQuery({
		queryKey: ['user', userId],
		queryFn: () => getUserById(userId!),
		enabled: !!userId,
	});

	useEffect(() => {
		if (isError && error) {
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	useEffect(() => {
		const title = user ? getUserTitle(user) : 'User';
		dispatch(setHeaderTitle({ name: title, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Users', path: '/users' },
				{ label: title, path: `/users/${userId}` },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, user, userId]);

	useEffect(() => {
		subscriptionIdRef.current = user?.subscription_id ?? null;
	}, [user?.subscription_id]);

	const handleRemoveDevice = useCallback(
		(device: Device) => {
			const subscriptionId = subscriptionIdRef.current;
			if (!subscriptionId) {
				showErrorNotification('This user has no subscription.');
				return;
			}
			swalFire({
				title: 'Remove device?',
				icon: 'info',
				text: `Remove "${getDeviceLabel(device)}" from this user's subscription?`,
				showCancelButton: true,
				iconColor: buttonColor[0],
				theme: darkModeStatus ? 'dark' : 'light',
				confirmButtonColor: buttonColor[0],
				cancelButtonColor: buttonColor[1],
				confirmButtonText: 'Remove',
			}).then(async (result: any) => {
				if (!result.isConfirmed) return;
				try {
					await removeDevicesFromSubscription(subscriptionId, [device.id]);
					showSuccessNotification('Device removed from subscription.');
					tableRef.current?.onQueryChange?.();
				} catch (err) {
					showErrorNotification(err);
				}
			});
		},
		[darkModeStatus, showErrorNotification, showSuccessNotification],
	);

	const columns = useMemo(
		() => [
			{
				title: 'Model',
				field: 'model',
				cellStyle: { fontWeight: 600 },
				render: (row: Device) => displayValue(row.model),
			},
			{
				title: 'Identifier',
				field: 'identifier',
				render: (row: Device) => displayValue(row.identifier),
			},
			{
				title: 'Serial Number',
				field: 'serial_number',
				render: (row: Device) => displayValue(row.serial_number),
			},
			{
				title: 'Description',
				field: 'description',
				render: (row: Device) => displayValue(row.description),
			},
			{
				title: 'Firmware',
				field: 'firmware_version',
				render: (row: Device) => displayValue(row.firmware_version),
			},
			{
				title: 'Site',
				field: 'site',
				render: (row: Device) => displayValue(row.site?.name),
			},
		],
		[],
	);

	const fetchDevices = useCallback(
		(query: Query<Device>): Promise<QueryResult<Device>> => {
			if (!userId) {
				return Promise.resolve({ data: [], page: query.page, totalCount: 0 });
			}

			return getUserDevices(userId, {
				page: query.page + 1,
				limit: query.pageSize,
				search: query.search,
			})
				.then((response) => {
					let rows = response.results;
					setAssignedDeviceIds(rows.map((row) => row.id));

					const search = (query.search || '').trim().toLowerCase();
					if (search) {
						rows = rows.filter(
							(row) =>
								row.model?.toLowerCase().includes(search) ||
								row.identifier?.toLowerCase().includes(search) ||
								row.serial_number?.toLowerCase().includes(search) ||
								row.description?.toLowerCase().includes(search) ||
								row.firmware_version?.toLowerCase().includes(search) ||
								row.site?.name?.toLowerCase().includes(search),
						);
					}

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
				.catch((err) => {
					showErrorNotification(err);
					return { data: [], page: query.page, totalCount: 0 };
				});
		},
		[userId, showErrorNotification],
	);

	const openAddDevices = async () => {
		if (!userId) return;
		try {
			const assigned = await getUserDevices(userId, { page: 1, limit: 1000 });
			setAssignedDeviceIds(assigned.results.map((row) => row.id));
		} catch {
			/* table already has a partial list; keep going */
		}
		setAddOpen(true);
	};

	const handleAddDevices = async (deviceIds: number[]) => {
		const subscriptionId = user?.subscription_id;
		if (!subscriptionId) {
			showErrorNotification('This user has no subscription to assign devices to.');
			return;
		}
		setSaving(true);
		try {
			await addDevicesToSubscription(subscriptionId, deviceIds);
			showSuccessNotification('Devices added successfully.');
			setAddOpen(false);
			tableRef.current?.onQueryChange?.();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSaving(false);
		}
	};

	if (isLoading) {
		return (
			<PageWrapper title='Loading User'>
				<Page container='fluid'>
					<div className='text-center text-muted py-5'>Loading user…</div>
				</Page>
			</PageWrapper>
		);
	}

	if (isError || !user?.id) {
		return (
			<PageWrapper title='User Not Found'>
				<Page container='fluid'>
					<div className='d-flex flex-column align-items-center justify-content-center gap-3 py-5'>
						<p className='text-muted mb-0'>User not found.</p>
						<Button color='primary' icon='ArrowBack' onClick={() => navigate('/users')}>
							Back to Users
						</Button>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	const roleLabel = user.role ? ROLE_LABELS[user.role] || user.role : EMPTY;

	return (
		<PageWrapper title={getUserTitle(user)}>
			<Page container='fluid'>
				<div className='d-flex align-items-center gap-2 mb-3 flex-shrink-0'>
					<Button color='light' size='sm' icon='ArrowBack' onClick={() => navigate('/users')}>
						Back
					</Button>
					<span className='text-muted small'>
						{[user.email, roleLabel].filter(Boolean).join(' · ')}
					</span>
				</div>
				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center justify-content-between w-100 flex-wrap gap-2'>
							<div className='d-flex align-items-center gap-2'>
								<Icon icon='Devices' color='primary' size='2x' />
								<span>Devices</span>
							</div>
							<Button
								color='primary'
								size='sm'
								onClick={openAddDevices}
								isDisable={!user.subscription_id || saving}>
								+ Add Devices
							</Button>
						</div>
					</CardHeader>
					<CardBody>
						<div className='material-table-page-host'>
							<ThemeProvider theme={theme}>
								<FullHeightMaterialTable
									key={userId}
									title=''
									tableRef={tableRef}
									columns={columns}
					data={fetchDevices}
					actions={[
										(rowData: Device) => ({
											icon: LinkOffIcon,
											tooltip: 'Remove from subscription',
											disabled: !user.subscription_id,
											onClick: (event: any, row: Device) => {
												event?.stopPropagation?.();
												handleRemoveDevice(row);
											},
										}),
									]}
									onRowClick={(_event, rowData: Device | Device[]) => {
										const device = Array.isArray(rowData) ? rowData[0] : rowData;
										if (device?.id) navigate(`/devices/${device.id}`);
									}}
									options={{
										search: true,
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
					</CardBody>
				</Card>
				<AddUserDevicesModal
					isOpen={addOpen}
					setIsOpen={setAddOpen}
					excludedDeviceIds={assignedDeviceIds}
					onSave={handleAddDevices}
					saving={saving}
				/>
			</Page>
		</PageWrapper>
	);
};

export default UserDetail;


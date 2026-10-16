import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
	addDevicesToSubscription,
	getSubscriptionById,
	removeDevicesFromSubscription,
} from '../../api/subscriptions/subscriptions';
import { getDeviceLabel, getDevices, type Device } from '../../api/devices/devices';
import { buttonColor, debounceIntervalForTable } from '../../helpers/constants';
import swalFire from '../../helpers/swalHelper';
import AddUserDevicesModal from '../UserManagement/AddUserDevicesModal';

const EMPTY = '—';

const TYPE_LABELS: Record<string, string> = {
	admin: 'Admin',
	view: 'View',
	edit: 'Edit',
};

const formatDate = (value: string | null | undefined) => {
	if (!value) return EMPTY;
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatDateTime = (value: string | null | undefined) => {
	if (!value) return EMPTY;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({
	label,
	children,
}) => (
	<div className='col-12 col-md-6 col-xl-4'>
		<div className='text-muted small mb-1'>{label}</div>
		<div className='fw-semibold'>{children}</div>
	</div>
);

const SubscriptionDetail: React.FC = () => {
	const { subscriptionId } = useParams<{ subscriptionId: string }>();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const [addOpen, setAddOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const {
		data: subscription,
		isLoading,
		isError,
		error,
		refetch: refetchSubscription,
	} = useQuery({
		queryKey: ['subscription', subscriptionId],
		queryFn: () => getSubscriptionById(subscriptionId!),
		enabled: !!subscriptionId,
	});

	/** Child subscriptions can have devices added/removed by the parent admin. */
	const canManageDevices = subscription?.parent_subscription != null;

	const deviceIdSet = useMemo(
		() => new Set((subscription?.devices ?? []).map(Number)),
		[subscription?.devices],
	);

	const assignedDeviceIds = useMemo(
		() => Array.from(deviceIdSet),
		[deviceIdSet],
	);

	useEffect(() => {
		if (isError && error) {
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	useEffect(() => {
		const title = subscription
			? subscription.user_label || `Subscription #${subscription.id}`
			: 'Subscription';
		dispatch(setHeaderTitle({ name: title, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Subscriptions', path: '/subscriptions' },
				{ label: title, path: `/subscriptions/${subscriptionId}` },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, subscription, subscriptionId]);

	const refreshDevices = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
		await refetchSubscription();
		tableRef.current?.onQueryChange?.();
	}, [queryClient, subscriptionId, refetchSubscription]);

	const handleRemoveDevice = useCallback(
		(device: Device) => {
			if (!subscriptionId || !canManageDevices) {
				showErrorNotification('Devices can only be removed from child subscriptions.');
				return;
			}
			swalFire({
				title: 'Remove device?',
				icon: 'info',
				text: `Remove "${getDeviceLabel(device)}" from this subscription?`,
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
					await refreshDevices();
				} catch (err) {
					showErrorNotification(err);
				}
			});
		},
		[
			subscriptionId,
			canManageDevices,
			darkModeStatus,
			showErrorNotification,
			showSuccessNotification,
			refreshDevices,
		],
	);

	const handleAddDevices = async (deviceIds: number[]) => {
		if (!subscriptionId || !canManageDevices) {
			showErrorNotification('Devices can only be added to child subscriptions.');
			return;
		}
		setSaving(true);
		try {
			await addDevicesToSubscription(subscriptionId, deviceIds);
			showSuccessNotification('Devices added successfully.');
			setAddOpen(false);
			await refreshDevices();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSaving(false);
		}
	};

	const columns = useMemo(
		() => [
			{
				title: 'Model',
				field: 'model',
				cellStyle: { fontWeight: 600 },
				render: (row: Device) => row.model?.trim() || EMPTY,
			},
			{
				title: 'Identifier',
				field: 'identifier',
				render: (row: Device) => row.identifier?.trim() || EMPTY,
			},
			{
				title: 'Serial Number',
				field: 'serial_number',
				render: (row: Device) => row.serial_number?.trim() || EMPTY,
			},
			{
				title: 'Description',
				field: 'description',
				render: (row: Device) => row.description?.trim() || EMPTY,
			},
			{
				title: 'Firmware',
				field: 'firmware_version',
				render: (row: Device) => row.firmware_version?.trim() || EMPTY,
			},
			{
				title: 'Site',
				field: 'site',
				render: (row: Device) => row.site?.name?.trim() || EMPTY,
			},
		],
		[],
	);

	const fetchDevices = useCallback(
		(query: Query<Device>): Promise<QueryResult<Device>> => {
			if (!subscriptionId || deviceIdSet.size === 0) {
				return Promise.resolve({ data: [], page: query.page, totalCount: 0 });
			}

			return getDevices({
				page: 1,
				limit: 1000,
				search: query.search,
			})
				.then((response) => {
					let rows = response.results.filter((row) => deviceIdSet.has(row.id));

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

					const totalCount = rows.length;
					const start = query.page * query.pageSize;
					return {
						data: rows.slice(start, start + query.pageSize),
						page: query.page,
						totalCount,
					};
				})
				.catch((err) => {
					showErrorNotification(err);
					return { data: [], page: query.page, totalCount: 0 };
				});
		},
		[subscriptionId, deviceIdSet, showErrorNotification],
	);

	if (isLoading) {
		return (
			<PageWrapper title='Loading Subscription'>
				<Page container='fluid'>
					<div className='text-center text-muted py-5'>Loading subscription…</div>
				</Page>
			</PageWrapper>
		);
	}

	if (isError || !subscription?.id) {
		return (
			<PageWrapper title='Subscription Not Found'>
				<Page container='fluid'>
					<div className='d-flex flex-column align-items-center justify-content-center gap-3 py-5'>
						<p className='text-muted mb-0'>Subscription not found.</p>
						<Button
							color='primary'
							icon='ArrowBack'
							onClick={() => navigate('/subscriptions')}>
							Back to Subscriptions
						</Button>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	const typeLabel = TYPE_LABELS[subscription.type] || subscription.type || EMPTY;
	const title = subscription.user_label || `Subscription #${subscription.id}`;

	return (
		<PageWrapper title={title}>
			<Page container='fluid'>
				<div className='d-flex align-items-center gap-2 mb-3 flex-shrink-0'>
					<Button
						color='light'
						size='sm'
						icon='ArrowBack'
						onClick={() => navigate('/subscriptions')}>
						Back
					</Button>
					<span className='text-muted small'>
						{[typeLabel, `ID ${subscription.id}`].join(' · ')}
					</span>
				</div>

				<Card className='mb-4'>
					<CardHeader>
						<div className='d-flex align-items-center gap-2'>
							<Icon icon='CardMembership' color='primary' size='2x' />
							<span>Subscription Details</span>
						</div>
					</CardHeader>
					<CardBody>
						<div className='row g-4'>
							<DetailRow label='ID'>{subscription.id}</DetailRow>
							<DetailRow label='Type'>{typeLabel}</DetailRow>
							<DetailRow label='User'>
								{subscription.user != null ? (
									<Link to={`/users/${subscription.user}`}>
										{subscription.user_label || `User #${subscription.user}`}
									</Link>
								) : (
									EMPTY
								)}
							</DetailRow>
							<DetailRow label='Parent'>
								{subscription.parent_subscription != null ? (
									<Link to={`/subscriptions/${subscription.parent_subscription}`}>
										{subscription.parent_label ||
											`Subscription #${subscription.parent_subscription}`}
									</Link>
								) : (
									EMPTY
								)}
							</DetailRow>
							<DetailRow label='Start Date'>
								{formatDate(subscription.start_date)}
							</DetailRow>
							<DetailRow label='End Date'>
								{formatDate(subscription.end_date)}
							</DetailRow>
							<DetailRow label='Created At'>
								{formatDateTime(subscription.created_at)}
							</DetailRow>
							<DetailRow label='Updated At'>
								{formatDateTime(subscription.updated_at)}
							</DetailRow>
							<DetailRow label='Devices'>
								{subscription.devices?.length ?? 0}
							</DetailRow>
						</div>
					</CardBody>
				</Card>

				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center justify-content-between w-100 flex-wrap gap-2'>
							<div className='d-flex align-items-center gap-2'>
								<Icon icon='Devices' color='primary' size='2x' />
								<span>Devices</span>
							</div>
							{canManageDevices && (
								<Button
									color='primary'
									size='sm'
									onClick={() => setAddOpen(true)}
									isDisable={saving}>
									+ Add Devices
								</Button>
							)}
						</div>
					</CardHeader>
					<CardBody>
						<div className='material-table-page-host'>
							<ThemeProvider theme={theme}>
								<FullHeightMaterialTable
									key={`${subscriptionId}-${deviceIdSet.size}`}
									title=''
									tableRef={tableRef}
									columns={columns}
									data={fetchDevices}
									actions={
										canManageDevices
											? [
													() => ({
														icon: LinkOffIcon,
														tooltip: 'Remove from subscription',
														onClick: (event: any, row: Device) => {
															event?.stopPropagation?.();
															handleRemoveDevice(row);
														},
													}),
												]
											: []
									}
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

export default SubscriptionDetail;

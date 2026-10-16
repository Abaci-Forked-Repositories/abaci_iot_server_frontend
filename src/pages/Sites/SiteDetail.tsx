import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Query, QueryResult } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import FullHeightMaterialTable from '../../components/CustomComponent/FullHeightMaterialTable';
import useTablestyle from '../../hooks/useTablestyles';
import useToasterNotification from '../../hooks/useToasterNotification';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import { getSiteById } from '../../api/sites/sites';
import { getDevices, type Device } from '../../api/devices/devices';
import { debounceIntervalForTable } from '../../helpers/constants';

const EMPTY = '----';

const displayValue = (value: string | null | undefined) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : EMPTY;
};

const formatDate = (value: string | null | undefined) => {
	if (!value) return '—';
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const SiteDetail: React.FC = () => {
	const { siteId } = useParams<{ siteId: string }>();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const { data: site, isLoading, isError, error } = useQuery({
		queryKey: ['site', siteId],
		queryFn: () => getSiteById(siteId!),
		enabled: !!siteId,
	});

	useEffect(() => {
		if (isError && error) {
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	useEffect(() => {
		const title = site?.name?.trim() || 'Site';
		dispatch(setHeaderTitle({ name: title, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Sites', path: '/sites' },
				{ label: title, path: `/sites/${siteId}` },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, site, siteId]);

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
				title: 'WiFi IP',
				field: 'wifi_ip_address',
				render: (row: Device) => displayValue(row.wifi_ip_address),
			},
		],
		[],
	);

	const fetchDevices = useCallback(
		(query: Query<Device>): Promise<QueryResult<Device>> => {
			if (!siteId) {
				return Promise.resolve({ data: [], page: query.page, totalCount: 0 });
			}

			return getDevices({
				page: query.page + 1,
				limit: query.pageSize,
				search: query.search,
				site: siteId,
			})
				.then((response) => {
					let rows = response.results;
					const search = (query.search || '').trim().toLowerCase();
					if (search) {
						rows = rows.filter(
							(row) =>
								row.model?.toLowerCase().includes(search) ||
								row.identifier?.toLowerCase().includes(search) ||
								row.serial_number?.toLowerCase().includes(search) ||
								row.description?.toLowerCase().includes(search) ||
								row.firmware_version?.toLowerCase().includes(search) ||
								row.wifi_ip_address?.toLowerCase().includes(search),
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
		[siteId, showErrorNotification],
	);

	if (isLoading) {
		return (
			<PageWrapper title='Loading Site'>
				<Page container='fluid'>
					<div className='text-center text-muted py-5'>Loading site…</div>
				</Page>
			</PageWrapper>
		);
	}

	if (isError || !site?.id) {
		return (
			<PageWrapper title='Site Not Found'>
				<Page container='fluid'>
					<div className='d-flex flex-column align-items-center justify-content-center gap-3 py-5'>
						<p className='text-muted mb-0'>Site not found.</p>
						<Button color='primary' icon='ArrowBack' onClick={() => navigate('/sites')}>
							Back to Sites
						</Button>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={site.name}>
			<Page container='fluid'>
				<div className='d-flex align-items-center gap-2 mb-3 flex-shrink-0'>
					<Button color='light' size='sm' icon='ArrowBack' onClick={() => navigate('/sites')}>
						Back
					</Button>
					<span className='text-muted small'>
						{[site.description?.trim(), `Created ${formatDate(site.created_at)}`]
							.filter(Boolean)
							.join(' · ')}
					</span>
				</div>
				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center gap-2'>
							<Icon icon='Devices' color='primary' size='2x' />
							<span>Devices</span>
						</div>
					</CardHeader>
					<CardBody>
						<div className='material-table-page-host'>
							<ThemeProvider theme={theme}>
								<FullHeightMaterialTable
									key={siteId}
									title=''
									columns={columns}
									data={fetchDevices}
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
			</Page>
		</PageWrapper>
	);
};

export default SiteDetail;

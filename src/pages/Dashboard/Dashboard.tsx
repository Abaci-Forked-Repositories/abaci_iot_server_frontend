import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Icon from '../../components/icon/Icon';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import {
	getDashboardStatistics,
	type DashboardStatisticsResponse,
} from '../../api/dashboard/dashboard';
import useToasterNotification from '../../hooks/useToasterNotification';

const EMPTY_STATS: DashboardStatisticsResponse = {
	users: { total: 0, active: 0, inactive: 0 },
	devices: { total: 0, online: 0, offline: 0 },
	sites: { total: 0, active: 0, inactive: 0 },
};

const normalizeStats = (raw: any): DashboardStatisticsResponse | null => {
	const payload = raw?.statistics ?? raw?.data ?? raw;
	if (!payload?.users || !payload?.devices || !payload?.sites) return null;
	return payload as DashboardStatisticsResponse;
};

const Dashboard = () => {
	const dispatch = useDispatch();
	const { showErrorNotification } = useToasterNotification();
	const notifiedErrorRef = useRef(false);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['dashboard', 'statistics'],
		queryFn: getDashboardStatistics,
		retry: 1,
	});

	const liveStats = normalizeStats(data);
	const stats = liveStats ?? EMPTY_STATS;

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Dashboard', isEditable: false }));
		dispatch(setBreadcrumbs([]));
	}, [dispatch]);

	useEffect(() => {
		if (isError && error && !notifiedErrorRef.current) {
			notifiedErrorRef.current = true;
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	const tiles = [
		{
			key: 'users',
			label: 'Users',
			icon: 'Person',
			color: 'primary' as const,
			total: stats.users.total ?? 0,
			detail: `${stats.users.active ?? 0} active · ${stats.users.inactive ?? 0} inactive`,
		},
		{
			key: 'devices',
			label: 'Devices',
			icon: 'Devices',
			color: 'success' as const,
			total: stats.devices.total ?? 0,
			detail: `${stats.devices.online ?? 0} online · ${stats.devices.offline ?? 0} offline`,
		},
		{
			key: 'sites',
			label: 'Sites',
			icon: 'Place',
			color: 'info' as const,
			total: stats.sites.total ?? 0,
			detail: `${stats.sites.active ?? 0} active · ${stats.sites.inactive ?? 0} inactive`,
		},
	];

	return (
		<PageWrapper title='Dashboard'>
			<Page container='fluid'>
				{isLoading && !liveStats ? (
					<div className='text-center text-muted py-5'>Loading dashboard…</div>
				) : (
					<div className='row g-4'>
						{tiles.map((tile) => (
							<div key={tile.key} className='col-12 col-md-4'>
								<Card stretch className='shadow-sm'>
									<CardBody>
										<div className='d-flex align-items-start justify-content-between'>
											<div>
												<div className='text-muted small mb-1'>
													{tile.label}
												</div>
												<div className='fs-2 fw-bold'>{tile.total}</div>
												<div className='text-muted small mt-1'>
													{tile.detail}
												</div>
											</div>
											<Icon icon={tile.icon} color={tile.color} size='2x' />
										</div>
									</CardBody>
								</Card>
							</div>
						))}
					</div>
				)}
			</Page>
		</PageWrapper>
	);
};

export default Dashboard;

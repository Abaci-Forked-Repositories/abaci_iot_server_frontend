import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MaterialTable from '@material-table/core';

import { ThemeProvider } from '@mui/material/styles';

import { useNavigate, useParams } from 'react-router-dom';

import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';

import Badge from '../../bootstrap/Badge';

import Button from '../../bootstrap/Button';

import useTablestyle from '../../../hooks/useTablestyles';

import useToasterNotification from '../../../hooks/useToasterNotification';

import {
	type ScheduleServingPoint,
	type ServingPoint,
	queuesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';

import { formatDate, servingPointQueueIds } from '../QueueManagement/queueManagementUtils';

const ServingPointDetailWorkspace: React.FC = () => {
	const { servingPointId } = useParams<{ servingPointId: string }>();

	const navigate = useNavigate();

	const id = Number(servingPointId);

	const [loading, setLoading] = useState(true);

	const [servingPoint, setServingPoint] = useState<ServingPoint | null>(null);

	const [windows, setWindows] = useState<ScheduleServingPoint[]>([]);

	const { theme, headerStyles, rowStyles } = useTablestyle();

	const { showErrorNotification } = useToasterNotification();

	const errorNotifierRef = useRef(showErrorNotification);

	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const load = useCallback(async () => {
		if (!id || Number.isNaN(id)) {
			setLoading(false);

			return;
		}

		setLoading(true);

		try {
			const [pointRes, windowsRes] = await Promise.all([
				queuesApi.getServingPoint(id),

				scheduleServingPointsApi.list({
					serving_point: id,
					ordering: '-updated_at',
					page_size: 200,
				}),
			]);

			setServingPoint(pointRes);

			setWindows(windowsRes.results || []);
		} catch (err) {
			errorNotifierRef.current(err);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		void load();
	}, [load]);

	const columns = useMemo(
		() => [
			{
				title: 'Schedule No',

				field: 'queue_schedule',

				render: (rowData: ScheduleServingPoint) => (
					<div className='fw-semibold'>#{rowData.queue_schedule}</div>
				),
			},

			{
				title: 'Window Time',

				field: 'window_time',

				render: (rowData: ScheduleServingPoint) => (
					<div className='small text-muted'>
						{formatDate(rowData.from_datetime)} - {formatDate(rowData.to_datetime)}
					</div>
				),
			},

			{
				title: 'Window Status',

				field: 'status',

				render: (rowData: ScheduleServingPoint) => (
					<Badge color='info' isLight>
						{rowData.status || '—'}
					</Badge>
				),
			},
		],

		[],
	);

	if (!id || Number.isNaN(id)) {
		return <div className='alert alert-warning'>Invalid serving point.</div>;
	}

	return (
		<div className='d-grid gap-4'>
			<Card>
				<CardBody>
					<div className='d-flex align-items-start justify-content-between gap-3'>
						<div>
							<div className='text-muted small mb-1'>Serving Point Detail</div>

							<div className='h4 mb-1'>
								{servingPoint?.name || `Serving Point #${id}`}
							</div>

							<div className='text-muted'>
								{servingPoint?.description || 'No description available.'}
							</div>
						</div>

						<Button
							color='light'
							isLight
							icon='ArrowBack'
							onClick={() => navigate('/serving-points')}>
							Back
						</Button>
					</div>

					<div className='row g-3 mt-2'>
						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Queue</div>

							<div className='fw-semibold'>
								{(servingPoint as (ServingPoint & { queue_name?: string }) | null)
									?.queue_name ||
									(() => {
										const ids = servingPoint ? servingPointQueueIds(servingPoint) : [];
										return ids.length ? ids.map((qid) => `Queue #${qid}`).join(', ') : '—';
									})()}
							</div>
						</div>

						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Assigned Users</div>

							<div className='fw-semibold'>
								{(() => {
									const users = (
										servingPoint as
											| (ServingPoint & {
													assigned_user?: Array<
														{ username?: string; id?: number } | string
													>;
											  })
											| null
									)?.assigned_user;

									if (!users || users.length === 0) return '—';

									return users

										.map((u) =>
											typeof u === 'string'
												? u
												: u.username ||
													(u.id != null ? `User #${u.id}` : 'User'),
										)

										.join(', ');
								})()}
							</div>
						</div>

						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Status</div>

							<Badge
								color={servingPoint?.is_active ? 'success' : 'secondary'}
								isLight>
								{servingPoint?.is_active ? 'Active' : 'Inactive'}
							</Badge>
						</div>

						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Created At</div>

							<div className='fw-semibold'>
								{formatDate(servingPoint?.created_at)}
							</div>
						</div>

						<div className='col-12 col-md-4'>
							<div className='small text-muted'>Updated At</div>

							<div className='fw-semibold'>
								{formatDate(
									(
										servingPoint as
											| (ServingPoint & { updated_at?: string })
											| null
									)?.updated_at,
								)}
							</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card stretch>
				<CardHeader>
					<CardLabel icon='Monitor'>
						<CardTitle tag='h5'>Serving Windows ({windows.length})</CardTitle>
					</CardLabel>
				</CardHeader>

				<CardBody>
					{loading ? (
						<div className='text-center text-muted py-5'>
							Loading serving windows...
						</div>
					) : (
						<div className='material_tabel_wrapper'>
							<div style={{ overflow: 'hidden' }}>
								<ThemeProvider theme={theme}>
									<MaterialTable
										title=' '
										// @ts-ignore

										columns={columns}
										data={windows}
										options={{
											headerStyle: headerStyles(),

											rowStyle: rowStyles(),

											search: true,

											pageSize: 8,

											pageSizeOptions: [8, 15, 30],

											emptyRowsWhenPaging: false,
										}}
										onRowClick={(_, rowData) => {
											const row = rowData as ScheduleServingPoint | undefined;
											if (!row?.id) return;
											navigate(`/serving-points/${id}/windows/${row.id}`);
										}}
										localization={{ pagination: { labelRowsPerPage: '' } }}
									/>
								</ThemeProvider>
							</div>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default ServingPointDetailWorkspace;

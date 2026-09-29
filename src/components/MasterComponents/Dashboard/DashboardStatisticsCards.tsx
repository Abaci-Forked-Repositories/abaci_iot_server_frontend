import React, { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card, { CardBody } from '../../bootstrap/Card';
import Icon from '../../icon/Icon';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	getDeviceDashboard,
	updateDeviceDashboard,
	type DeviceDashboardData,
	type DeviceDashboardUpdate,
} from '../../../api/devices/devices';

/* Hover animation styles for stat cards */
const STAT_CARD_STYLES = `
.stat-card {
	transition: transform 0.25s ease, box-shadow 0.25s ease;
	cursor: default;
}
.stat-card:hover {
	transform: translateY(-6px);
}
.stat-card--primary { border-left: 3px solid #5B8CFF; }
.stat-card--primary:hover { box-shadow: 0 8px 24px rgba(91, 140, 255, 0.35); }
.stat-card--info { border-left: 3px solid #38BDF8; }
.stat-card--info:hover { box-shadow: 0 8px 24px rgba(56, 189, 248, 0.35); }
.stat-card--success { border-left: 3px solid #22C55E; }
.stat-card--success:hover { box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35); }
.stat-card--warning { border-left: 3px solid #F59E0B; }
.stat-card--warning:hover { box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35); }
.stat-card--danger { border-left: 3px solid #EF4444; }
.stat-card--danger:hover { box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35); }
`;

/** Placeholder dashboard when monitor API is unavailable — keeps the UI visible. */
const EMPTY_DASHBOARD: DeviceDashboardData = {
	mode: '',
	charging: false,
	short_circuit: false,
	overload: false,
	fan_status: false,
	output_voltage: NaN,
	load_percentage: NaN,
	battery_voltage: NaN,
	temperature_1: NaN,
	temperature_2: NaN,
	digital_in_1: false,
	digital_in_2: false,
	digital_out_1: false,
	digital_out_2: false,
	analog_in_1: NaN,
	analog_in_2: NaN,
	analog_in_3: NaN,
	analog_in_4: NaN,
};

interface DashboardStatisticsCardsProps {
	deviceId: number | string;
	deviceName?: string;
}

const formatNumber = (value: number | undefined | null, digits = 1) => {
	if (value == null || Number.isNaN(Number(value))) return '—';
	return Number(value).toFixed(digits);
};

const StatusDot: React.FC<{ active: boolean; dangerWhenActive?: boolean }> = ({
	active,
	dangerWhenActive = true,
}) => (
	<span
		className={`badge ${
			active
				? dangerWhenActive
					? 'bg-danger'
					: 'bg-success'
				: dangerWhenActive
					? 'bg-success'
					: 'bg-warning'
		}`}
		style={{
			width: '14px',
			height: '14px',
			borderRadius: '50%',
			display: 'inline-block',
		}}
	/>
);

const DashboardStatisticsCards: React.FC<DashboardStatisticsCardsProps> = ({
	deviceId,
	deviceName,
}) => {
	const queryClient = useQueryClient();
	const { showErrorNotification } = useToasterNotification();
	const queryKey = ['device-dashboard', deviceId] as const;
	const notifiedErrorRef = useRef(false);

	const { data, isLoading, isError, error } = useQuery({
		queryKey,
		queryFn: () => getDeviceDashboard(deviceId),
		enabled: !!deviceId,
		retry: 1,
		// Keep polling only while live data is available; don't spam a missing endpoint
		refetchInterval: (query) => (query.state.status === 'error' ? false : 10_000),
	});

	useEffect(() => {
		notifiedErrorRef.current = false;
	}, [deviceId]);

	useEffect(() => {
		if (isError && error && !notifiedErrorRef.current) {
			notifiedErrorRef.current = true;
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	const updateMutation = useMutation({
		mutationFn: (payload: DeviceDashboardUpdate) =>
			updateDeviceDashboard(deviceId, payload),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData<DeviceDashboardData>(queryKey);
			if (previous) {
				queryClient.setQueryData<DeviceDashboardData>(queryKey, {
					...previous,
					...payload,
				});
			}
			return { previous };
		},
		onError: (err, _payload, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
			showErrorNotification(err);
		},
		onSuccess: (updated) => {
			if (updated) {
				queryClient.setQueryData(queryKey, (old: DeviceDashboardData | undefined) =>
					old ? { ...old, ...updated } : updated,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const hasLiveData = Boolean(data) && !isError;
	const monitor: DeviceDashboardData = data ?? EMPTY_DASHBOARD;

	const toggleField = (field: keyof DeviceDashboardUpdate, current: boolean) => {
		if (!hasLiveData || updateMutation.isPending) return;
		updateMutation.mutate({ [field]: !current });
	};

	if (isLoading && !data) {
		return (
			<div className='text-center text-muted py-5'>Loading device monitor…</div>
		);
	}

	const busy = updateMutation.isPending || !hasLiveData;

	return (
		<div className='d-flex flex-column gap-4'>
			{/* Page Heading */}
			<h2 className='mb-0' style={{ fontSize: '1.5rem', fontWeight: 700 }}>
				{deviceName ? `${deviceName} — Inverter Monitor` : 'Inverter Monitor'}
			</h2>

			{/* Two cards horizontally */}
			<div className='row g-4'>
				{/* Card 1 — Status */}
				<div className='col-12 col-lg-6'>
					<Card className='h-100 shadow-sm' borderSize={1}>
						<CardBody>
							<h5 className='fw-bold mb-4'>Status</h5>

							<div className='d-flex justify-content-between align-items-center mb-3 py-2 border-bottom'>
								<span className='text-muted'>Mode</span>
								<span className='fw-semibold'>{monitor.mode || '—'}</span>
							</div>

							<div className='d-flex justify-content-between align-items-center py-2'>
								<span className='text-muted'>Charging</span>
								<button
									type='button'
									disabled={busy}
									onClick={() => toggleField('charging', !!monitor.charging)}
									className={`btn btn-sm px-4 btn-hover-bounce ${
										monitor.charging ? 'btn-success' : 'btn-danger'
									}`}
									style={{ minWidth: '80px' }}>
									{monitor.charging ? 'ON' : 'OFF'}
								</button>
							</div>
						</CardBody>
					</Card>
				</div>

				{/* Card 2 — Alert */}
				<div className='col-12 col-lg-6'>
					<Card className='h-100 shadow-sm' borderSize={1}>
						<CardBody>
							<h5 className='fw-bold mb-4'>Alert</h5>

							<div className='d-flex justify-content-between align-items-center mb-3 py-2 border-bottom'>
								<span className='text-muted'>Short Circuit</span>
								<StatusDot active={!!monitor.short_circuit} />
							</div>

							<div className='d-flex justify-content-between align-items-center mb-3 py-2 border-bottom'>
								<span className='text-muted'>Overload</span>
								<StatusDot active={!!monitor.overload} />
							</div>

							<div className='d-flex justify-content-between align-items-center py-2'>
								<span className='text-muted'>Fan Status</span>
								<StatusDot active={!!monitor.fan_status} dangerWhenActive={false} />
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* Card 3 — Status Data */}
			<style>{STAT_CARD_STYLES}</style>
			<Card className='shadow-sm' borderSize={1}>
				<CardBody>
					<h5 className='fw-bold mb-4'>Status Data</h5>

					<div className='row g-3'>
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Bolt' color='primary' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Output Voltage
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.output_voltage)} V
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='FlashOn' color='info' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Load Percentage
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.load_percentage)} %
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<Icon
										icon='BatteryChargingFull'
										color='success'
										size='2x'
										className='mb-2'
									/>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Battery Voltage
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.battery_voltage)} V
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Thermostat' color='warning' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Temperature 1
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.temperature_1)} °C
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--danger' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Thermostat' color='danger' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Temperature 2
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.temperature_2)} °C
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Card 4 — GPIO Data */}
			<Card className='shadow-sm' borderSize={1}>
				<CardBody>
					<h5 className='fw-bold mb-4'>GPIO Data</h5>

					<div className='row g-3 mb-3'>
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital In 1
									</div>
									<span
										className={`btn btn-sm px-4 ${
											monitor.digital_in_1 ? 'btn-success' : 'btn-secondary'
										}`}
										style={{
											minWidth: '70px',
											cursor: 'default',
											pointerEvents: 'none',
										}}>
										{monitor.digital_in_1 ? 'ON' : 'OFF'}
									</span>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital In 2
									</div>
									<span
										className={`btn btn-sm px-4 ${
											monitor.digital_in_2 ? 'btn-success' : 'btn-secondary'
										}`}
										style={{
											minWidth: '70px',
											cursor: 'default',
											pointerEvents: 'none',
										}}>
										{monitor.digital_in_2 ? 'ON' : 'OFF'}
									</span>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital Out 1
									</div>
									<button
										type='button'
										disabled={busy}
										onClick={() =>
											toggleField('digital_out_1', !!monitor.digital_out_1)
										}
										className={`btn btn-sm px-4 btn-hover-bounce ${
											monitor.digital_out_1 ? 'btn-success' : 'btn-secondary'
										}`}
										style={{ minWidth: '70px' }}>
										{monitor.digital_out_1 ? 'HIGH' : 'LOW'}
									</button>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital Out 2
									</div>
									<button
										type='button'
										disabled={busy}
										onClick={() =>
											toggleField('digital_out_2', !!monitor.digital_out_2)
										}
										className={`btn btn-sm px-4 btn-hover-bounce ${
											monitor.digital_out_2 ? 'btn-success' : 'btn-secondary'
										}`}
										style={{ minWidth: '70px' }}>
										{monitor.digital_out_2 ? 'HIGH' : 'LOW'}
									</button>
								</CardBody>
							</Card>
						</div>
					</div>

					<div className='row g-3'>
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 1
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										{formatNumber(monitor.analog_in_1, 2)}
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 2
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										{formatNumber(monitor.analog_in_2, 2)}
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 3
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										{formatNumber(monitor.analog_in_3, 2)}
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 4
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										{formatNumber(monitor.analog_in_4, 2)}
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default DashboardStatisticsCards;

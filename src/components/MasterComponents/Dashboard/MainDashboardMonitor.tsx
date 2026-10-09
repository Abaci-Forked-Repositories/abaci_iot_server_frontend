import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card, { CardBody } from '../../bootstrap/Card';
import Icon from '../../icon/Icon';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	getMainDashboard,
	type DashboardMinMax,
	type DashboardOnOff,
	type MainDashboardData,
} from '../../../api/dashboard/dashboard';
import MainDashboardCharts from './MainDashboardCharts';
import { STAT_CARD_STYLES } from './sharedStyles';

const EMPTY_DASHBOARD: MainDashboardData = {
	short_circuit: NaN,
	overload: NaN,
	output_voltage: { min: NaN, max: NaN },
	load_percentage: { min: NaN, max: NaN },
	battery_voltage: { min: NaN, max: NaN },
	temperature_1: { min: NaN, max: NaN },
	temperature_2: { min: NaN, max: NaN },
	digital_in_1: { on: NaN, off: NaN },
	digital_in_2: { on: NaN, off: NaN },
	digital_out_1: { on: NaN, off: NaN },
	digital_out_2: { on: NaN, off: NaN },
	analog_in_1: { min: NaN, max: NaN },
	analog_in_2: { min: NaN, max: NaN },
	analog_in_3: { min: NaN, max: NaN },
	analog_in_4: { min: NaN, max: NaN },
};

const formatNumber = (value: number | undefined | null, digits = 1) => {
	if (value == null || Number.isNaN(Number(value))) return '—';
	return Number(value).toFixed(digits);
};

const MinMaxValue: React.FC<{
	range: DashboardMinMax;
	unit?: string;
	digits?: number;
}> = ({ range, unit = '', digits = 1 }) => (
	<div className='d-flex justify-content-center gap-4'>
		<div>
			<div className='text-muted' style={{ fontSize: '0.7rem' }}>
				Min
			</div>
			<div className='fw-bold' style={{ fontSize: '1.25rem' }}>
				{formatNumber(range.min, digits)}
				{unit ? ` ${unit}` : ''}
			</div>
		</div>
		<div>
			<div className='text-muted' style={{ fontSize: '0.7rem' }}>
				Max
			</div>
			<div className='fw-bold' style={{ fontSize: '1.25rem' }}>
				{formatNumber(range.max, digits)}
				{unit ? ` ${unit}` : ''}
			</div>
		</div>
	</div>
);

const OnOffValue: React.FC<{ pair: DashboardOnOff; digits?: number }> = ({
	pair,
	digits = 0,
}) => (
	<div className='d-flex justify-content-center gap-4'>
		<div>
			<div className='text-muted' style={{ fontSize: '0.7rem' }}>
				On
			</div>
			<div className='fw-bold' style={{ fontSize: '1.25rem' }}>
				{formatNumber(pair.on, digits)}
			</div>
		</div>
		<div>
			<div className='text-muted' style={{ fontSize: '0.7rem' }}>
				Off
			</div>
			<div className='fw-bold' style={{ fontSize: '1.25rem' }}>
				{formatNumber(pair.off, digits)}
			</div>
		</div>
	</div>
);

/**
 * MainDashboardMonitor — the full monitor panel for the main (aggregate) dashboard.
 * This is specific to the main dashboard and completely independent
 * from the device detail's DeviceDetailMonitor component.
 *
 * Differences from DeviceDetailMonitor:
 *  - Aggregate data across all devices (min/max, on/off counts)
 *  - No interactive controls (no toggle buttons)
 *  - No per-device GPIO data section
 *  - Uses MainDashboardCharts (aggregate charts) instead of DeviceDetailCharts
 *  - No IOT data table
 */
const MainDashboardMonitor: React.FC = () => {
	const { showErrorNotification } = useToasterNotification();
	const notifiedErrorRef = useRef(false);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['dashboard', 'main-monitor'],
		queryFn: getMainDashboard,
		retry: 1,
		refetchInterval: (query) => (query.state.status === 'error' ? false : 10_000),
	});

	useEffect(() => {
		if (isError && error && !notifiedErrorRef.current) {
			notifiedErrorRef.current = true;
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	const monitor: MainDashboardData = data ?? EMPTY_DASHBOARD;

	if (isLoading && !data) {
		return <div className='text-center text-muted py-5'>Loading dashboard…</div>;
	}

	return (
		<div className='d-flex flex-column gap-4'>
			<h2 className='mb-0' style={{ fontSize: '1.5rem', fontWeight: 700 }}>
				Inverter Monitor
			</h2>

			<style>{STAT_CARD_STYLES}</style>

			{/* Alert — full width; Short Circuit + Overload as equal cards in one row */}
			<Card className='shadow-sm' borderSize={1}>
				<CardBody>
					<h5 className='fw-bold mb-4'>Alert</h5>
					<div className='row g-3'>
						<div className='col-12 col-sm-6'>
							<Card className='h-100 text-center stat-card stat-card--danger' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Warning' color='danger' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Short Circuit
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.short_circuit)}
									</div>
								</CardBody>
							</Card>
						</div>
						<div className='col-12 col-sm-6'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Report' color='warning' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Overload
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										{formatNumber(monitor.overload)}
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Status Data — min + max */}
			<Card className='shadow-sm' borderSize={1}>
				<CardBody>
					<h5 className='fw-bold mb-4'>Status Data</h5>

					<div className='row g-3'>
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Bolt' color='primary' size='2x' className='mb-2' />
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Output Voltage
									</div>
									<MinMaxValue range={monitor.output_voltage} unit='V' />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='FlashOn' color='info' size='2x' className='mb-2' />
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Load Percentage
									</div>
									<MinMaxValue range={monitor.load_percentage} unit='%' />
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
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Battery Voltage
									</div>
									<MinMaxValue range={monitor.battery_voltage} unit='V' />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Thermostat' color='warning' size='2x' className='mb-2' />
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Temperature 1
									</div>
									<MinMaxValue range={monitor.temperature_1} unit='°C' />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--danger' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Thermostat' color='danger' size='2x' className='mb-2' />
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Temperature 2
									</div>
									<MinMaxValue range={monitor.temperature_2} unit='°C' />
								</CardBody>
							</Card>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* GPIO Data — digital On/Off separately; analog Min/Max */}
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
									<OnOffValue pair={monitor.digital_in_1} />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital In 2
									</div>
									<OnOffValue pair={monitor.digital_in_2} />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital Out 1
									</div>
									<OnOffValue pair={monitor.digital_out_1} />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital Out 2
									</div>
									<OnOffValue pair={monitor.digital_out_2} />
								</CardBody>
							</Card>
						</div>
					</div>

					<div className='row g-3'>
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Analog In 1
									</div>
									<MinMaxValue range={monitor.analog_in_1} digits={2} />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Analog In 2
									</div>
									<MinMaxValue range={monitor.analog_in_2} digits={2} />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Analog In 3
									</div>
									<MinMaxValue range={monitor.analog_in_3} digits={2} />
								</CardBody>
							</Card>
						</div>

						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Analog In 4
									</div>
									<MinMaxValue range={monitor.analog_in_4} digits={2} />
								</CardBody>
							</Card>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Main Dashboard Charts — aggregate statistics, independent from device charts */}
			<MainDashboardCharts />
		</div>
	);
};

export default MainDashboardMonitor;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Card, { CardBody } from '../../bootstrap/Card';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { getIotData, type IotDataRecord } from '../../../api/data/iotData';

interface GpioDataFromApiProps {
	deviceId: number | string;
}

/** Stat card color classes for each position */
const STAT_COLORS = ['stat-card--primary', 'stat-card--info', 'stat-card--success', 'stat-card--warning'];

const formatNumber = (value: number | undefined | null, digits = 2) => {
	if (value == null || Number.isNaN(Number(value))) return '—';
	return Number(value).toFixed(digits);
};

const GpioDataFromApi: React.FC<GpioDataFromApiProps> = ({ deviceId }) => {
	const { showErrorNotification } = useToasterNotification();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['iot-data-latest', deviceId],
		queryFn: () =>
			getIotData({
				limit: 1,
				offset: 0,
				device_id: deviceId,
			}),
		enabled: !!deviceId,
		refetchInterval: 30_000, // Poll every 30s for live data
	});

	React.useEffect(() => {
		if (isError && error) {
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	const record: IotDataRecord | undefined = data?.results?.[0];

	if (isLoading) {
		return (
			<Card className='shadow-sm' borderSize={1}>
				<CardBody>
					<h5 className='fw-bold mb-4'>GPIO Data</h5>
					<div className='text-center text-muted py-4'>Loading GPIO data…</div>
				</CardBody>
			</Card>
		);
	}

	if (!record) {
		return (
			<Card className='shadow-sm' borderSize={1}>
				<CardBody>
					<h5 className='fw-bold mb-4'>GPIO Data</h5>
					<div className='text-center text-muted py-4'>No GPIO data available.</div>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card className='shadow-sm' borderSize={1}>
			<CardBody>
				<h5 className='fw-bold mb-4'>GPIO Data</h5>

				{/* Digital In / Digital Out row */}
				<div className='row g-3 mb-3'>
					{/* Digital In 1 & 2 */}
					{[1, 2].map((i) => {
						const nameKey = `digital_in_name_${i}` as keyof IotDataRecord;
						const valKey = `digital_in_${i}` as keyof IotDataRecord;
						const label = (record[nameKey] as string) || `Digital In ${i}`;
						const active = record[valKey] as boolean;
						return (
							<div key={`din${i}`} className='col-12 col-sm-6 col-xl-3'>
								<Card className={`h-100 text-center stat-card ${STAT_COLORS[i - 1]}`} borderSize={1}>
									<CardBody className='py-3'>
										<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
											{label}
										</div>
										<span
											className={`btn btn-sm px-4 ${active ? 'btn-success' : 'btn-secondary'}`}
											style={{ minWidth: '70px', cursor: 'default', pointerEvents: 'none' }}>
											{active ? 'ON' : 'OFF'}
										</span>
									</CardBody>
								</Card>
							</div>
						);
					})}

					{/* Digital Out 1 & 2 */}
					{[1, 2].map((i) => {
						const nameKey = `digital_out_name_${i}` as keyof IotDataRecord;
						const valKey = `digital_out_${i}` as keyof IotDataRecord;
						const label = (record[nameKey] as string) || `Digital Out ${i}`;
						const active = record[valKey] as boolean;
						return (
							<div key={`dout${i}`} className='col-12 col-sm-6 col-xl-3'>
								<Card className={`h-100 text-center stat-card ${STAT_COLORS[i + 1]}`} borderSize={1}>
									<CardBody className='py-3'>
										<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
											{label}
										</div>
										<span
											className={`btn btn-sm px-4 ${active ? 'btn-success' : 'btn-secondary'}`}
											style={{ minWidth: '70px', cursor: 'default', pointerEvents: 'none' }}>
											{active ? 'HIGH' : 'LOW'}
										</span>
									</CardBody>
								</Card>
							</div>
						);
					})}
				</div>

				{/* Analog In 1-4 row */}
				<div className='row g-3'>
					{[1, 2, 3, 4].map((i) => {
						const nameKey = `analog_name_${i}` as keyof IotDataRecord;
						const valKey = `analog_in_${i}` as keyof IotDataRecord;
						const unitKey = `analog_unit_${i}` as keyof IotDataRecord;
						const ratioKey = `analog_ratio_${i}` as keyof IotDataRecord;
						const label = (record[nameKey] as string) || `Analog In ${i}`;
						const rawValue = record[valKey] as number;
						const ratio = record[ratioKey] as { source: string; parsedValue: number } | null;
						const unit = (record[unitKey] as string) || '';
						// Same multiplication logic as the IOT Data table
						const displayValue = ratio?.parsedValue != null
							? rawValue * ratio.parsedValue
							: rawValue;
						return (
							<div key={`ain${i}`} className='col-12 col-sm-6 col-xl-3'>
								<Card className={`h-100 text-center stat-card ${STAT_COLORS[i - 1]}`} borderSize={1}>
									<CardBody className='py-3'>
										<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
											{label}
										</div>
										<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
											{formatNumber(displayValue, 2)}{unit ? ` ${unit}` : ''}
										</div>
									</CardBody>
								</Card>
							</div>
						);
					})}
				</div>
			</CardBody>
		</Card>
	);
};

export default GpioDataFromApi;

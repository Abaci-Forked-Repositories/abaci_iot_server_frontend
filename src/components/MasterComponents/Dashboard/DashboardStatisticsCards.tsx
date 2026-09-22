import React, { useState } from 'react';
import Card, { CardBody } from '../../bootstrap/Card';
import Icon from '../../icon/Icon';

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

@keyframes btn-bounce {
	0%, 100% { transform: translateY(0); }
	30% { transform: translateY(-4px); }
	60% { transform: translateY(-2px); }
}
.gpio-out-btn {
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.gpio-out-btn:hover {
	animation: btn-bounce 0.5s ease;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
`;

interface DashboardStatisticsCardsProps {
	deviceName?: string;
}

const DashboardStatisticsCards: React.FC<DashboardStatisticsCardsProps> = ({
	deviceName,
}) => {
	const [chargingOn, setChargingOn] = useState(true);
	const [shortCircuit, setShortCircuit] = useState(false);
	const [overload, setOverload] = useState(false);
	const [fanStatus, setFanStatus] = useState(true);
	const [digitalIn1, setDigitalIn1] = useState(false);
	const [digitalIn2, setDigitalIn2] = useState(true);
	const [digitalOut1, setDigitalOut1] = useState(false);
	const [digitalOut2, setDigitalOut2] = useState(false);

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

							{/* Mode */}
							<div className='d-flex justify-content-between align-items-center mb-3 py-2 border-bottom'>
								<span className='text-muted'>Mode</span>
								<span className='fw-semibold'>Inverter</span>
							</div>

							{/* Charging On/Off */}
							<div className='d-flex justify-content-between align-items-center py-2'>
								<span className='text-muted'>Charging</span>
								<button
									type='button'
									onClick={() => setChargingOn(!chargingOn)}
									className={`btn btn-sm px-4 gpio-out-btn ${
										chargingOn ? 'btn-success' : 'btn-danger'
									}`}
									style={{ minWidth: '80px' }}>
									{chargingOn ? 'ON' : 'OFF'}
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

							{/* Short Circuit */}
							<div className='d-flex justify-content-between align-items-center mb-3 py-2 border-bottom'>
								<span className='text-muted'>Short Circuit</span>
								<span
									className={`badge ${
										shortCircuit ? 'bg-danger' : 'bg-success'
									}`}
									style={{
										width: '14px',
										height: '14px',
										borderRadius: '50%',
										display: 'inline-block',
									}}
								/>
							</div>

							{/* Overload */}
							<div className='d-flex justify-content-between align-items-center mb-3 py-2 border-bottom'>
								<span className='text-muted'>Overload</span>
								<span
									className={`badge ${overload ? 'bg-danger' : 'bg-success'}`}
									style={{
										width: '14px',
										height: '14px',
										borderRadius: '50%',
										display: 'inline-block',
									}}
								/>
							</div>

							{/* Fan Status */}
							<div className='d-flex justify-content-between align-items-center py-2'>
								<span className='text-muted'>Fan Status</span>
								<span
									className={`badge ${fanStatus ? 'bg-success' : 'bg-warning'}`}
									style={{
										width: '14px',
										height: '14px',
										borderRadius: '50%',
										display: 'inline-block',
									}}
								/>
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
						{/* Output Voltage */}
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Bolt' color='primary' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Output Voltage
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										230.5 V
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Load Percentage */}
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='FlashOn' color='info' size='2x' className='mb-2' />

									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Load Percentage
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										67.2 %
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Battery Voltage */}
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='BatteryChargingFull' color='success' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Battery Voltage
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										48.3 V
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Temperature 1 */}
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Thermostat' color='warning' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Temperature 1
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										42.8 °C
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Temperature 2 */}
						<div className='col-12 col-sm-6 col-md-4 col-xl'>
							<Card className='h-100 text-center stat-card stat-card--danger' borderSize={1}>
								<CardBody className='py-3'>
									<Icon icon='Thermostat' color='danger' size='2x' className='mb-2' />
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Temperature 2
									</div>
									<div className='fw-bold' style={{ fontSize: '1.5rem' }}>
										38.1 °C
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

					{/* Top Part — Digital */}
					<div className='row g-3 mb-3'>
						{/* Digital In 1 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital In 1
									</div>
									<span
										className={`btn btn-sm px-4 ${digitalIn1 ? 'btn-success' : 'btn-secondary'}`}
										style={{ minWidth: '70px', cursor: 'default', pointerEvents: 'none' }}>
										{digitalIn1 ? 'ON' : 'OFF'}
									</span>
								</CardBody>
							</Card>
						</div>

						{/* Digital In 2 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital In 2
									</div>
									<span
										className={`btn btn-sm px-4 ${digitalIn2 ? 'btn-success' : 'btn-secondary'}`}
										style={{ minWidth: '70px', cursor: 'default', pointerEvents: 'none' }}>
										{digitalIn2 ? 'ON' : 'OFF'}
									</span>
								</CardBody>
							</Card>
						</div>

						{/* Digital Out 1 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital Out 1
									</div>
									<button
										type='button'
										onClick={() => setDigitalOut1(!digitalOut1)}
										className={`btn btn-sm px-4 gpio-out-btn ${
											digitalOut1 ? 'btn-success' : 'btn-secondary'
										}`}
										style={{ minWidth: '70px' }}>
										{digitalOut1 ? 'HIGH' : 'LOW'}
									</button>
								</CardBody>
							</Card>
						</div>

						{/* Digital Out 2 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
										Digital Out 2
									</div>
									<button
										type='button'
										onClick={() => setDigitalOut2(!digitalOut2)}
										className={`btn btn-sm px-4 gpio-out-btn ${
											digitalOut2 ? 'btn-success' : 'btn-secondary'
										}`}
										style={{ minWidth: '70px' }}>
										{digitalOut2 ? 'HIGH' : 'LOW'}
									</button>
								</CardBody>
							</Card>
						</div>
					</div>

					{/* Bottom Part — Analog */}
					<div className='row g-3'>
						{/* Analog In 1 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--primary' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 1
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										3.25
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Analog In 2 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--info' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 2
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										1.78
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Analog In 3 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--success' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 3
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										0.00
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Analog In 4 */}
						<div className='col-12 col-sm-6 col-xl-3'>
							<Card className='h-100 text-center stat-card stat-card--warning' borderSize={1}>
								<CardBody className='py-3'>
									<div className='text-muted mb-1' style={{ fontSize: '0.8rem' }}>
										Analog In 4
									</div>
									<div className='fw-bold' style={{ fontSize: '1.3rem' }}>
										4.56
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

import React, { FC, useCallback, useEffect, useState } from 'react';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Spinner from '../../bootstrap/Spinner';
import StatusBadge from '../../BadgeWithIcon.jsx';
import QueIconLogo from '../../../assets/que-icon-logo.svg';
import {
	// AdaptorCheckResponse,
	// getAdaptorCheck,
	getServerTime,
	getSystemConfig,
	SystemConfig,
} from '../../../api/administration/cloudSync.api';
import { fetchActivationStatus } from '../../../api/administration/activation.api';

const SERVER_TIME_POLL_MS = 60_000;

const OverviewRow: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<div className='d-flex justify-content-between align-items-start gap-2 py-2 border-bottom border-light'>
		<span className='text-muted small flex-shrink-0'>{label}</span>
		<div className='text-end fw-semibold small text-break'>{children}</div>
	</div>
);

function formatServerTime(iso: string): string {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

// Future: Adaptor status in System Overview
// function formatAdaptorVersion(version: string | null | undefined): string {
// 	if (!version) return '—';
// 	return version.startsWith('v') ? version : `v${version}`;
// }
//
// function adaptorStatusLabel(adaptor: AdaptorCheckResponse | null): string | undefined {
// 	if (!adaptor) return undefined;
// 	return adaptor.system_configured && adaptor.code === 'OK' ? 'Running' : 'Offline';
// }

const SystemOverviewPanel: FC = () => {
	const [loading, setLoading] = useState(true);
	const [config, setConfig] = useState<SystemConfig | null>(null);
	const [databaseAvailable, setDatabaseAvailable] = useState<boolean | null>(null);
	// const [adaptor, setAdaptor] = useState<AdaptorCheckResponse | null>(null);
	const [serverTime, setServerTime] = useState<string | null>(null);
	const [serverTimezone, setServerTimezone] = useState<string | null>(null);

	const loadConfig = useCallback(async () => {
		setLoading(true);
		try {
			const [systemConfig, activation /* , adaptorCheck */] = await Promise.all([
				getSystemConfig(),
				fetchActivationStatus().catch(() => null),
				// getAdaptorCheck().catch(() => null),
			]);
			setConfig(systemConfig);
			setDatabaseAvailable(
				activation ? Boolean(activation.data.database_available) : null,
			);
			// setAdaptor(adaptorCheck);
		} catch {
			setConfig(null);
			setDatabaseAvailable(null);
			// setAdaptor(null);
		} finally {
			setLoading(false);
		}
	}, []);

	const pollServerTime = useCallback(async () => {
		try {
			const data = await getServerTime();
			setServerTime(data.server_time);
			setServerTimezone(data.server_timezone);
		} catch {
			/* keep last known time */
		}
	}, []);

	useEffect(() => {
		void loadConfig();
	}, [loadConfig]);

	useEffect(() => {
		void pollServerTime();
		const id = window.setInterval(() => {
			void pollServerTime();
		}, SERVER_TIME_POLL_MS);
		return () => window.clearInterval(id);
	}, [pollServerTime]);

	return (
		<Card stretch className='system-overview-panel'>
			<CardHeader>
				<CardLabel>
					<CardTitle tag='div' className='h5'>
						System Overview
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody className='pt-0 d-flex flex-column h-100'>
				{loading && !config ? (
					<div className='d-flex justify-content-center align-items-center flex-grow-1 py-5'>
						<Spinner color='primary' />
					</div>
				) : (
					<>
						<div className='flex-grow-1'>
							<div className='d-flex align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom'>
								<div className='d-flex align-items-center gap-2'>
									<img
										src={QueIconLogo}
										alt='ABACI'
										width={40}
										height={32}
										decoding='async'
									/>
									<div>
										<div className='fw-bold'>ABACI</div>
										<div className='text-muted small'>Queue Management</div>
									</div>
								</div>
								<div className='text-end'>
									<div className='fw-bold'>v{config?.version || '—'}</div>
									<div className='text-muted small'>Edge</div>
								</div>
							</div>

							<div className='text-uppercase text-muted small fw-semibold mb-2'>System</div>
							<OverviewRow label='Activation'>
								<StatusBadge
									status={config?.is_activated ? 'Activated' : 'Inactive'}
									emptyFallback='—'
								/>
							</OverviewRow>
							<OverviewRow label='Max Serving Points'>
								{config?.no_of_serving_point_license ?? '—'}
							</OverviewRow>
							<OverviewRow label='Server Time'>
								<div>
									{serverTime ? formatServerTime(serverTime) : '—'}
									{serverTimezone && (
										<div className='text-muted fw-normal'>{serverTimezone}</div>
									)}
								</div>
							</OverviewRow>
							{/* Future: Adaptor field — GET api/administration/adaptor-check/
							<OverviewRow label='Adaptor'>
								<div className='d-flex flex-column align-items-end gap-1'>
									<StatusBadge
										status={adaptorStatusLabel(adaptor)}
										emptyFallback='—'
									/>
									<span className='text-muted fw-normal'>
										{formatAdaptorVersion(adaptor?.version)}
									</span>
								</div>
							</OverviewRow>
							*/}

							<div className='text-uppercase text-muted small fw-semibold mt-4 mb-2'>
								Connectivity
							</div>
							<OverviewRow label='Database'>
								<StatusBadge
									status={
										databaseAvailable === null
											? undefined
											: databaseAvailable
												? 'Online'
												: 'Offline'
									}
									emptyFallback='—'
								/>
							</OverviewRow>
							<OverviewRow label='Cloud'>
								<StatusBadge
									status={config?.cloud_connectivity_status ? 'Online' : 'Offline'}
									emptyFallback='—'
								/>
							</OverviewRow>
							<OverviewRow label='Device ID'>
								<span className='font-monospace' style={{ fontSize: '0.75rem' }}>
									{config?.system_unique_id || '—'}
								</span>
							</OverviewRow>
						</div>

						<div className='text-center text-muted small mt-auto pt-3 border-top'>
							© {new Date().getFullYear()} Abaci Technologies
						</div>
					</>
				)}
			</CardBody>
		</Card>
	);
};

export default SystemOverviewPanel;

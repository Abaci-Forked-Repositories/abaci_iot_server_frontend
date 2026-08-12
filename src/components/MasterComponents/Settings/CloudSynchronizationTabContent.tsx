import React, { FC, useCallback, useEffect, useState } from 'react';
import Checks from '../../bootstrap/forms/Checks';
import Spinner from '../../bootstrap/Spinner';
import Alert from '../../bootstrap/Alert';
import usePermissions from '../../../hooks/usePermissions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import StatusBadge from '../../BadgeWithIcon.jsx';
import {
	ConfigOutboxSummary,
	getCloudSync,
	getConfigOutboxSummary,
	patchCloudSync,
	refreshCloudSyncAfterToggle,
} from '../../../api/administration/cloudSync.api';
import {
	formatPermissionDeniedMessage,
	isForbiddenPermissionError,
} from '../QueueManagement/queueManagementUtils';

const OUTBOX_POLL_MS = 15_000;

function formatCount(n: number): string {
	return new Intl.NumberFormat('en-US').format(n);
}

type MetricTone = 'default' | 'success' | 'primary' | 'danger' | 'warning';

const METRIC_STYLES: Record<MetricTone, { wrap: string; value: string }> = {
	default: { wrap: 'bg-light border', value: 'text-dark' },
	success: { wrap: 'bg-success bg-opacity-10 border border-success border-opacity-25', value: 'text-success' },
	primary: { wrap: 'bg-primary bg-opacity-10 border border-primary border-opacity-25', value: 'text-primary' },
	danger: { wrap: 'bg-danger bg-opacity-10 border border-danger border-opacity-25', value: 'text-danger' },
	warning: { wrap: 'bg-warning bg-opacity-10 border border-warning border-opacity-25', value: 'text-warning' },
};

const OutboxMetricCard: FC<{
	label: string;
	value: number;
	tone?: MetricTone;
}> = ({ label, value, tone = 'default' }) => {
	const styles = METRIC_STYLES[tone];
	return (
		<div className={`rounded-3 p-3 h-100 ${styles.wrap}`}>
			<div className='text-uppercase text-muted small fw-semibold mb-1'>{label}</div>
			<div className={`fs-4 fw-bold ${styles.value}`}>{formatCount(value)}</div>
		</div>
	);
};

const CloudSynchronizationTabContent: FC = () => {
	const { can } = usePermissions();
	const canWrite = can('settings_write');
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	const [loading, setLoading] = useState(true);
	const [toggling, setToggling] = useState(false);
	const [accessDenied, setAccessDenied] = useState<string | null>(null);
	const [enabled, setEnabled] = useState(false);
	const [connected, setConnected] = useState(false);
	const [summary, setSummary] = useState<ConfigOutboxSummary | null>(null);
	const [summaryLoading, setSummaryLoading] = useState(false);

	const applyCloudSync = useCallback((enable_cloud_sync: boolean, cloud_connectivity_status: boolean) => {
		setEnabled(enable_cloud_sync);
		setConnected(cloud_connectivity_status);
	}, []);

	const loadStatus = useCallback(async () => {
		setLoading(true);
		setAccessDenied(null);
		try {
			const status = await getCloudSync();
			applyCloudSync(status.enable_cloud_sync, status.cloud_connectivity_status);
		} catch (err) {
			if (isForbiddenPermissionError(err)) {
				setAccessDenied(formatPermissionDeniedMessage(err));
			} else {
				showErrorNotification(err);
			}
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [applyCloudSync]);

	const fetchSummary = useCallback(async (showSpinner: boolean) => {
		if (showSpinner) setSummaryLoading(true);
		try {
			const data = await getConfigOutboxSummary();
			setSummary(data);
		} catch (err) {
			// Keep last known summary on poll errors; toast only on first load
			if (showSpinner) showErrorNotification(err);
		} finally {
			if (showSpinner) setSummaryLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		void loadStatus();
	}, [loadStatus]);

	// Poll outbox every 30s while sync is ON (stops when OFF or leaving tab)
	useEffect(() => {
		if (!enabled) {
			setSummary(null);
			return undefined;
		}

		void fetchSummary(true);
		const id = window.setInterval(() => {
			void fetchSummary(false);
		}, OUTBOX_POLL_MS);

		return () => {
			window.clearInterval(id);
		};
	}, [enabled, fetchSummary]);

	const handleToggle = async (next: boolean) => {
		if (!canWrite || toggling) return;
		setToggling(true);
		try {
			await patchCloudSync(next);
			const refreshed = await refreshCloudSyncAfterToggle();
			applyCloudSync(refreshed.enable_cloud_sync, refreshed.cloud_connectivity_status);
			showSuccessNotification(
				refreshed.enable_cloud_sync ? 'Cloud sync enabled.' : 'Cloud sync disabled.',
			);
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setToggling(false);
		}
	};

	if (loading) {
		return (
			<div className='d-flex justify-content-center align-items-center py-5'>
				<Spinner color='primary' />
			</div>
		);
	}

	if (accessDenied) {
		return (
			<Alert color='warning' isLight className='mb-0'>
				{accessDenied}
			</Alert>
		);
	}

	return (
		<div className='cloud-sync-settings p-1 p-md-2'>
			<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4'>
				<div className='flex-grow-1'>
					<div className='fw-semibold'>Enable Cloud Sync</div>
					<div className='text-muted small'>
						Sync configuration and data with the cloud platform.
					</div>
					{enabled && (
						<div className='mt-2'>
							<StatusBadge
								status={connected ? 'Connected' : 'Connectivity unavailable'}
							/>
						</div>
					)}
				</div>
				<div className='d-flex align-items-center gap-2'>
					{toggling && <Spinner isSmall />}
					<Checks
						id='enable_cloud_sync'
						type='switch'
						checked={enabled}
						disabled={!canWrite || toggling}
						ariaLabel='Enable Cloud Sync'
						onChange={() => {
							void handleToggle(!enabled);
						}}
					/>
				</div>
			</div>

			{enabled && (
				<div className='mt-2'>
					<div className='fw-bold mb-3'>Outbox Summary</div>
					{summaryLoading && !summary ? (
						<div className='d-flex justify-content-center py-4'>
							<Spinner color='primary' />
						</div>
					) : summary ? (
						<>
							<div className='row g-3 mb-3'>
								<div className='col-md-4'>
									<OutboxMetricCard label='Total' value={summary.total} />
								</div>
								<div className='col-md-4'>
									<OutboxMetricCard label='Synced' value={summary.synced} tone='success' />
								</div>
								<div className='col-md-4'>
									<OutboxMetricCard label='Pending' value={summary.pending} tone='primary' />
								</div>
							</div>
							<div className='row g-3'>
								<div className='col-6 col-md-3'>
									<OutboxMetricCard label='Retrying' value={summary.retrying} />
								</div>
								<div className='col-6 col-md-3'>
									<OutboxMetricCard label='Error' value={summary.error} tone='danger' />
								</div>
								<div className='col-6 col-md-3'>
									<OutboxMetricCard label='Stuck' value={summary.stuck} tone='warning' />
								</div>
								<div className='col-6 col-md-3'>
									<OutboxMetricCard label='Processing' value={summary.processing} />
								</div>
							</div>
						</>
					) : (
						<Alert color='light' isLight className='mb-0'>
							Outbox summary is unavailable.
						</Alert>
					)}
				</div>
			)}
		</div>
	);
};

export default CloudSynchronizationTabContent;

import React, { FC, useCallback, useEffect, useState } from 'react';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Alert from '../../bootstrap/Alert';
import StatusBadge from '../../BadgeWithIcon.jsx';
import UpgradeLicenseModal from './UpgradeLicenseModal';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	getSystemConfig,
	SystemConfig,
} from '../../../api/administration/cloudSync.api';
import {
	getLicenseDetails,
	LicenseDetails,
} from '../../../api/administration/licenseDetails.api';
import { queuesApi } from '../../../services/queueManagementApi';
import {
	formatPermissionDeniedMessage,
	isForbiddenPermissionError,
} from '../QueueManagement/queueManagementUtils';

const InfoRow: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<div className='mb-3'>
		<div className='text-muted small mb-1'>{label}</div>
		<div className='fw-semibold text-break'>{children}</div>
	</div>
);

const SectionTitle: FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className='fw-bold mb-3'>{children}</div>
);

function formatDateTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

const LicensingTabContent: FC = () => {
	const { showErrorNotification } = useToasterNotification();
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);

	/** UI data source — GET license-details/ */
	const [loading, setLoading] = useState(true);
	const [accessDenied, setAccessDenied] = useState<string | null>(null);
	const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | null>(null);

	/**
	 * Kept for later use (not shown in this tab’s fields).
	 * system-config + serving-points count still load in the background.
	 */
	const [, setConfig] = useState<SystemConfig | null>(null);
	const [, setActiveServingPointsCount] = useState<number | null>(null);

	const loadLicenseDetails = useCallback(async (options?: { quiet?: boolean }) => {
		if (!options?.quiet) {
			setLoading(true);
		}
		setAccessDenied(null);
		try {
			const data = await getLicenseDetails();
			setLicenseDetails(data);
		} catch (err) {
			if (isForbiddenPermissionError(err)) {
				setAccessDenied(formatPermissionDeniedMessage(err));
			} else {
				showErrorNotification(err);
			}
			setLicenseDetails(null);
		} finally {
			if (!options?.quiet) {
				setLoading(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadSystemConfig = useCallback(async () => {
		try {
			const data = await getSystemConfig();
			setConfig(data);
		} catch {
			setConfig(null);
		}
	}, []);

	const loadActiveServingPoints = useCallback(async () => {
		try {
			const res = await queuesApi.servingPoints({
				limit: 1,
				offset: 0,
				is_active: true,
			});
			setActiveServingPointsCount(res.count ?? res.results?.length ?? 0);
		} catch {
			setActiveServingPointsCount(null);
		}
	}, []);

	useEffect(() => {
		void loadLicenseDetails();
	}, [loadLicenseDetails]);

	useEffect(() => {
		void loadSystemConfig();
	}, [loadSystemConfig]);

	useEffect(() => {
		void loadActiveServingPoints();
	}, [loadActiveServingPoints]);

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

	if (!licenseDetails) {
		return (
			<Alert color='light' isLight className='mb-0'>
				Licensing details are unavailable.
			</Alert>
		);
	}

	const {
		system_activated,
		system_unique_id,
		customer_id,
		device_license_count,
		no_of_serving_point_license,
		active_serving_point_count,
		remaining_serving_point_license,
		last_licensed_at,
		license_expires_at,
		license_type,
	} = licenseDetails;

	return (
		<>
			<div className='licensing-settings p-1 p-md-2'>
				<section className='mb-4'>
					<SectionTitle>Device License</SectionTitle>
					<div className='row g-3'>
						<div className='col-md-6'>
							<InfoRow label='Activation Status'>
								<StatusBadge
									status={system_activated ? 'Activated' : 'Inactive'}
								/>
							</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='Device ID'>{system_unique_id || '—'}</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='Customer ID'>{customer_id || '—'}</InfoRow>
						</div>
					</div>
				</section>

				<section className='mb-4'>
					<SectionTitle>Serving Point Entitlement</SectionTitle>
					<div className='row g-3'>
						<div className='col-md-6'>
							<InfoRow label='Max Allowed Serving Points'>
								{no_of_serving_point_license}
							</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='Active Serving Points'>
								{active_serving_point_count}
							</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='Remaining Slots'>
								{remaining_serving_point_license}
							</InfoRow>
						</div>
					</div>
				</section>

				<section className='mb-4'>
					<SectionTitle>License Details</SectionTitle>
					<div className='row g-3'>
						<div className='col-md-6'>
							<InfoRow label='Last Licensed'>
								{formatDateTime(last_licensed_at)}
							</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='License Expires'>
								{formatDateTime(license_expires_at)}
							</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='Device License Count'>
								{device_license_count ?? '—'}
							</InfoRow>
						</div>
						<div className='col-md-6'>
							<InfoRow label='License Type'>{license_type || '—'}</InfoRow>
						</div>
					</div>
				</section>

				<hr className='my-4' />

				<div className='d-flex justify-content-end'>
					<Button color='primary' icon='Upgrade' onClick={() => setShowUpgradeModal(true)}>
						Upgrade License
					</Button>
				</div>
			</div>

			<UpgradeLicenseModal
				isOpen={showUpgradeModal}
				setIsOpen={setShowUpgradeModal}
				deviceId={system_unique_id || ''}
				onUpgraded={() => {
					void loadLicenseDetails({ quiet: true });
				}}
			/>
		</>
	);
};

export default LicensingTabContent;

import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AbaciLoader from './AbaciLoader/AbaciLoader';
import {
	fetchActivationStatus,
	type ActivationStatus,
	type ActivateLicenseResponse,
} from '../api/administration/activation.api';
import ActivationPage from '../pages/Auth/ActivationPage';
import ActivationSuccessPanel from '../pages/Auth/ActivationSuccessPanel';
import SuperAdminPage from '../pages/Auth/SuperAdminPage';
import ConfigErrorPage from '../pages/Auth/ConfigErrorPage';

interface Props {
	children: ReactNode;
}

/** Public display / kiosk routes must never be blocked by the activation gate. */
function isPublicScreenPath(pathname: string): boolean {
	return pathname.includes('/public') || pathname.startsWith('/screenstokenstatus');
}

/**
 * App-wide gate: until system_activated + admin_user_availability,
 * replace the entire UI with Activation or First Admin.
 * Login and the rest of the app only mount after both flags pass.
 */
const ProductValidation: FC<Props> = ({ children }) => {
	const location = useLocation();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<ActivationStatus | null>(null);
	const [usedMock, setUsedMock] = useState(false);
	/** Hold success panel until Continue — prevents refetch skipping it. */
	const [activationSuccessPending, setActivationSuccessPending] =
		useState<ActivateLicenseResponse | null>(null);

	const loadStatus = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, usedMock: mock } = await fetchActivationStatus();
			setStatus(data);
			setUsedMock(mock);
		} catch (err) {
			const message =
				(err as { message?: string })?.message || 'Failed to load activation status.';
			setError(message);
			setStatus(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isPublicScreenPath(location.pathname)) {
			setLoading(false);
			return;
		}
		loadStatus();
	}, [loadStatus, location.pathname]);

	const handleActivationSuccess = useCallback((result: ActivateLicenseResponse) => {
		setActivationSuccessPending(result);
	}, []);

	const handleContinueAfterActivation = useCallback(() => {
		setActivationSuccessPending(null);
		loadStatus();
	}, [loadStatus]);

	const handleAdminCreated = useCallback(async () => {
		await loadStatus();
	}, [loadStatus]);

	if (isPublicScreenPath(location.pathname)) {
		return <>{children}</>;
	}

	if (loading && !activationSuccessPending) {
		return <AbaciLoader />;
	}

	if (error || !status) {
		return (
			<ConfigErrorPage
				message={
					error ||
					'Activation status is unavailable. Confirm the backend is running and try again.'
				}
				onRetry={loadStatus}
			/>
		);
	}

	if (!status.database_available) {
		const dbMessage =
			status.database_error === 'schema_missing'
				? 'Database schema is missing. Run migrations on the edge device, then retry.'
				: status.message ||
					status.detail ||
					'Database is not available. Check the edge device configuration.';
		return <ConfigErrorPage title='Database unavailable' message={dbMessage} onRetry={loadStatus} />;
	}

	if (activationSuccessPending) {
		return (
			<ActivationSuccessPanel
				usedMock={usedMock}
				details={{
					no_of_sensor_license: activationSuccessPending.no_of_sensor_license,
					no_of_serving_point_license:
						activationSuccessPending.no_of_serving_point_license,
					customer_id: activationSuccessPending.customer_id,
					system_unique_id:
						activationSuccessPending.system_unique_id ?? status.system_unique_id,
					is_demo: activationSuccessPending.is_demo,
					demo_expiry: activationSuccessPending.demo_expiry,
					message: activationSuccessPending.message,
				}}
				onContinue={handleContinueAfterActivation}
			/>
		);
	}

	if (!status.system_activated) {
		return (
			<ActivationPage
				productId={status.system_unique_id}
				isDeactivated={Boolean(status.is_a_deactivated_system)}
				usedMock={usedMock}
				onActivationSuccess={handleActivationSuccess}
			/>
		);
	}

	if (!status.admin_user_availability) {
		return <SuperAdminPage usedMock={usedMock} onCreated={handleAdminCreated} />;
	}

	return <>{children}</>;
};

export default ProductValidation;

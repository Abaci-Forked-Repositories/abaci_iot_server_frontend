import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AbaciLoader from './AbaciLoader/AbaciLoader';
// ─── Activation imports commented out (no backend available) ───
// To restore: uncomment all imports and logic below.
// import {
// 	fetchActivationStatus,
// 	type ActivationStatus,
// 	type ActivateLicenseResponse,
// } from '../api/administration/activation.api';
// import ActivationSuccessPanel from '../pages/Auth/ActivationSuccessPanel';
// import SuperAdminPage from '../pages/Auth/SuperAdminPage';
// import ConfigErrorPage from '../pages/Auth/ConfigErrorPage';
// import SystemStatusBlockedPage from '../pages/Auth/SystemStatusBlockedPage';
// ────────────────────────────────────────────────────────────────

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
 *
 * activation-status is fetched on every route change.
 * Full-page loader only on first load (no cached status); later navigations refresh quietly.
 *
 * ⚠️  Activation checking logic commented out — no backend available.
 *     Component now simply passes through to children so the login page renders.
 *     To restore: uncomment the imports above and the logic block below.
 */
const ProductValidation: FC<Props> = ({ children }) => {
	const location = useLocation();

	if (isPublicScreenPath(location.pathname)) {
		return <>{children}</>;
	}

	// ─── Activation checking logic commented out (no backend available) ───
	// To restore: uncomment this entire block and the imports above.
	//
	// const [loading, setLoading] = useState(true);
	// const [error, setError] = useState<string | null>(null);
	// const [status, setStatus] = useState<ActivationStatus | null>(null);
	// const [usedMock, setUsedMock] = useState(false);
	// const [activationSuccessPending, setActivationSuccessPending] =
	// 	useState<ActivateLicenseResponse | null>(null);
	// const statusRef = useRef<ActivationStatus | null>(null);
	//
	// useEffect(() => {
	// 	statusRef.current = status;
	// }, [status]);
	//
	// const loadStatus = useCallback(async (options?: { showLoader?: boolean }) => {
	// 	const showLoader = options?.showLoader ?? !statusRef.current;
	// 	if (showLoader) {
	// 		setLoading(true);
	// 		setError(null);
	// 	}
	// 	try {
	// 		const { data, usedMock: mock } = await fetchActivationStatus();
	// 		setStatus(data);
	// 		setUsedMock(mock);
	// 		setError(null);
	// 	} catch (err) {
	// 		const message =
	// 			(err as { message?: string })?.message || 'Failed to load activation status.';
	// 		// Background refresh failures keep last known status (no full-page error flash).
	// 		if (showLoader || !statusRef.current) {
	// 			setError(message);
	// 			setStatus(null);
	// 		}
	// 	} finally {
	// 		if (showLoader) {
	// 			setLoading(false);
	// 		}
	// 	}
	// }, []);
	//
	// // Fetch on every route change; full-page loader only when no status cached yet.
	// useEffect(() => {
	// 	if (isPublicScreenPath(location.pathname)) {
	// 		setLoading(false);
	// 		return;
	// 	}
	// 	void loadStatus({ showLoader: !statusRef.current });
	// }, [location.pathname, loadStatus]);
	//
	// const handleActivationSuccess = useCallback((result: ActivateLicenseResponse) => {
	// 	setActivationSuccessPending(result);
	// }, []);
	//
	// const handleContinueAfterActivation = useCallback(() => {
	// 	setActivationSuccessPending(null);
	// 	void loadStatus({ showLoader: true });
	// }, [loadStatus]);
	//
	// const handleAdminCreated = useCallback(async () => {
	// 	await loadStatus({ showLoader: true });
	// }, [loadStatus]);
	//
	// const handleRetry = useCallback(() => {
	// 	void loadStatus({ showLoader: true });
	// }, [loadStatus]);
	//
	// if (loading && !activationSuccessPending) {
	// 	return <AbaciLoader />;
	// }
	//
	// if (error || !status) {
	// 	return (
	// 		<ConfigErrorPage
	// 			message={
	// 				error ||
	// 				'Activation status is unavailable. Confirm the backend is running and try again.'
	// 			}
	// 			onRetry={handleRetry}
	// 		/>
	// 	);
	// }
	//
	// if (!status.database_available) {
	// 	const dbMessage =
	// 		status.database_error === 'schema_missing'
	// 			? 'Database schema is missing. Run migrations on the edge device, then retry.'
	// 			: status.message ||
	// 				status.detail ||
	// 				'Database is not available. Check the edge device configuration.';
	// 	return <ConfigErrorPage title='Database unavailable' message={dbMessage} onRetry={handleRetry} />;
	// }
	//
	// if (activationSuccessPending) {
	// 	return (
	// 		<ActivationSuccessPanel
	// 			usedMock={usedMock}
	// 			details={{
	// 				no_of_sensor_license: activationSuccessPending.no_of_sensor_license,
	// 				no_of_serving_point_license:
	// 					activationSuccessPending.no_of_serving_point_license,
	// 				customer_id: activationSuccessPending.customer_id,
	// 				system_unique_id:
	// 					activationSuccessPending.system_unique_id ?? status.system_unique_id,
	// 				is_demo: activationSuccessPending.is_demo,
	// 				demo_expiry: activationSuccessPending.demo_expiry,
	// 				message: activationSuccessPending.message,
	// 			}}
	// 			onContinue={handleContinueAfterActivation}
	// 		/>
	// 	);
	// }
	//
	// if (status.is_a_deactivated_system) {
	// 	return (
	// 		<SystemStatusBlockedPage
	// 			title='System deactivated'
	// 			message='This system has been deactivated. Please contact your administrator.'
	// 			deviceId={status.system_unique_id}
	// 			deactivationDate={status.deactivation_date}
	// 			onRetry={handleRetry}
	// 		/>
	// 	);
	// }
	//
	// if (!status.system_activated) {
	// 	return (
	// 		<SystemStatusBlockedPage
	// 			title='System not activated'
	// 			message='This system is not activated. Please contact your administrator.'
	// 			deviceId={status.system_unique_id}
	// 			onRetry={handleRetry}
	// 		/>
	// 	);
	// }
	//
	// if (!status.admin_user_availability) {
	// 	return <SuperAdminPage usedMock={usedMock} onCreated={handleAdminCreated} />;
	// }
	// ─────────────────────────────────────────────────────────────────────────

	return <>{children}</>;
};

export default ProductValidation;

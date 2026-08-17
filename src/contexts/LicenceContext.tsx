import React, {
	createContext,
	FC,
	ReactNode,
	useCallback,
	useMemo,
} from 'react';

/* ================= TYPES ================= */

interface Licence {
	isValid: boolean;
	uniqueID: string | null;
	registrationDate: string | null;
	version: string | null;
	message: string;
	features: string[];
	expiryDate: string | null;
	expirationTimestamp: number | null;
	registration_date: string | null;
	expiry_date: string | null;
	expiration_timestamp: number | null;
	is_valid: boolean;
	unique_id: string | null;
}

interface LicenceContextProps {
	loading: boolean;
	adminExists: boolean | null;
	license: Licence | null;
	version: string | null;
	features: string[];
	uniqueKey: string | null;
	refreshStatus: () => Promise<void>;
	resetLicenceState: () => void;
	hasFeature: (featureKey: string) => boolean;
	hasQrFeature: () => boolean;
	status: Licence | null;
	checkSystemStatus: () => Promise<void>;
	showWarning: boolean;
	warningMessage: string;
	closeWarning: () => void;
	clearLicenceStorage: () => void;
	serverData: { ip_address: string | null; port: number | null } | null;
}

export const LicenceContext = createContext<LicenceContextProps>({} as LicenceContextProps);

interface Props {
	children: ReactNode;
}

/**
 * Legacy licence context — kept for AdminSetup / LicenceSetup compatibility.
 * Activation and onboarding use ProductValidation + activation-status instead.
 * GET /api/systems/status/ was removed (no longer needed).
 */
export const LicenceProvider: FC<Props> = ({ children }) => {
	const noopAsync = useCallback(async () => {}, []);
	const noop = useCallback(() => {}, []);
	const hasFeature = useCallback((_featureKey: string) => false, []);
	const hasQrFeature = useCallback(() => false, []);

	const value = useMemo(
		() => ({
			loading: false,
			adminExists: null,
			license: null,
			version: null,
			features: [] as string[],
			uniqueKey: null,
			refreshStatus: noopAsync,
			resetLicenceState: noop,
			hasFeature,
			hasQrFeature,
			checkSystemStatus: noopAsync,
			status: null,
			showWarning: false,
			warningMessage: '',
			closeWarning: noop,
			clearLicenceStorage: noop,
			serverData: null,
		}),
		[noop, noopAsync, hasFeature, hasQrFeature],
	);

	return <LicenceContext.Provider value={value}>{children}</LicenceContext.Provider>;
};

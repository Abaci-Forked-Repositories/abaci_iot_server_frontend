/**
 * In-memory store for forgot-password MSW flow.
 * Mock OTP is always 123456 while USE_MOCK_SERVICE is on.
 */

const STORAGE_KEY = 'mock_forgot_password_state';

export type MockForgotPasswordState = {
	username: string | null;
	otp: string | null;
	verified: boolean;
};

const DEFAULT_STATE: MockForgotPasswordState = {
	username: null,
	otp: null,
	verified: false,
};

export const MOCK_OTP_CODE = '123456';

export function getForgotPasswordMockState(): MockForgotPasswordState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULT_STATE };
		return { ...DEFAULT_STATE, ...JSON.parse(raw) };
	} catch {
		return { ...DEFAULT_STATE };
	}
}

export function setForgotPasswordMockState(
	patch: Partial<MockForgotPasswordState>,
): MockForgotPasswordState {
	const next = { ...getForgotPasswordMockState(), ...patch };
	localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	return next;
}

export function resetForgotPasswordMockState(): void {
	localStorage.removeItem(STORAGE_KEY);
}

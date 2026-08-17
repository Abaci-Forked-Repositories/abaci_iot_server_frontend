/** Client-side password policy for first-admin creation (matches onboarding guide). */

export const ADMIN_PASSWORD_MIN = 8;
export const ADMIN_PASSWORD_MAX = 15;

const POLICY_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;

export function isValidAdminFirstUserPassword(password: string): boolean {
	return POLICY_REGEX.test(password);
}

export const ADMIN_PASSWORD_POLICY_MESSAGE =
	'Password must be 8–15 characters with uppercase, lowercase, a digit, and one of #?!@$%^&*-.';

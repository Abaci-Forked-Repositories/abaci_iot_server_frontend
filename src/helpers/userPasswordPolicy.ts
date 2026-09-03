export const USER_PASSWORD_MIN_LENGTH = 8;

export const USER_PASSWORD_SYMBOLS = '!@#$%^&*()_+-=[]|~';

const SYMBOL_REGEX = /[!@#$%^&*()_+\-=\[\]~|]/;

export type PasswordCharacterType = 'uppercase' | 'lowercase' | 'number' | 'symbol';

export const USER_PASSWORD_CHARACTER_CHECKS: Array<{
	id: PasswordCharacterType;
	label: string;
	test: (password: string) => boolean;
}> = [
	{ id: 'uppercase', label: 'Uppercase letters (A-Z)', test: (p) => /[A-Z]/.test(p) },
	{ id: 'lowercase', label: 'Lowercase letters (a-z)', test: (p) => /[a-z]/.test(p) },
	{ id: 'number', label: 'Numbers (0-9)', test: (p) => /[0-9]/.test(p) },
	{
		id: 'symbol',
		label: `Symbols ${USER_PASSWORD_SYMBOLS}`,
		test: (p) => SYMBOL_REGEX.test(p),
	},
];

export const countPasswordCharacterTypes = (password: string): number =>
	USER_PASSWORD_CHARACTER_CHECKS.filter((check) => check.test(password)).length;

export const meetsUserPasswordCharacterMix = (password: string): boolean =>
	countPasswordCharacterTypes(password) >= 3;

export const meetsUserPasswordLength = (password: string): boolean =>
	password.length >= USER_PASSWORD_MIN_LENGTH;

export const USER_PASSWORD_MIX_LABEL =
	`Must include at least three of the following mix of character types: uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and symbols ${USER_PASSWORD_SYMBOLS}`;

export const USER_PASSWORD_MIX_MESSAGE = USER_PASSWORD_MIX_LABEL;

/** Short inline message — details stay in the requirements checklist. */
export const USER_PASSWORD_POLICY_INLINE_ERROR =
	'Password does not meet the requirements below.';

export type PasswordRequirementItem = {
	id: string;
	label: string;
	met: boolean;
};

export const getUserPasswordRequirements = (password: string): PasswordRequirementItem[] => [
	{
		id: 'length',
		label: `At least ${USER_PASSWORD_MIN_LENGTH} characters`,
		met: password.length >= USER_PASSWORD_MIN_LENGTH,
	},
	{
		id: 'mix',
		label: USER_PASSWORD_MIX_LABEL,
		met: meetsUserPasswordCharacterMix(password),
	},
];

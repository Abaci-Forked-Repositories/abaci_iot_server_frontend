import moment from 'moment';

export interface ThemeDisplayClockDateOptions {
	/** Uppercase month/day, e.g. `06 JUL 2026` (Pip-Boy style). */
	uppercase?: boolean;
}

/** Live theme clocks — date, e.g. `06 Jul 2026`. */
export function formatThemeDisplayClockDate(
	date: Date,
	options?: ThemeDisplayClockDateOptions,
): string {
	const formatted = moment(date).format('DD MMM YYYY');
	return options?.uppercase ? formatted.toUpperCase() : formatted;
}

/** Live theme clocks — 12-hour time with AM/PM, e.g. `2:04 PM`. */
export function formatThemeDisplayClockTime(date: Date): string {
	return moment(date).format('h:mm A');
}

/** Live theme clocks — 12-hour time with seconds and AM/PM, e.g. `2:04:10 PM`. */
export function formatThemeDisplayClockTimeWithSeconds(date: Date): string {
	return moment(date).format('h:mm:ss A');
}

/** Combined label for `aria-label` on theme clock widgets. */
export function formatThemeDisplayClockAriaLabel(date: Date): string {
	return `Current date and time ${formatThemeDisplayClockDate(date)} ${formatThemeDisplayClockTimeWithSeconds(date)}`;
}

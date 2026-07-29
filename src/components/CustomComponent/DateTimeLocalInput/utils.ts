import { ChangeEvent } from 'react';
import dayjs from 'dayjs';

/** Format a Date for datetime-local string value (`YYYY-MM-DDTHH:mm`). */
export function toDateTimeLocalValue(value: Date): string {
	return dayjs(value).format('YYYY-MM-DDTHH:mm');
}

export function parseLocalDateTime(value: string | undefined): dayjs.Dayjs | null {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const parsed = dayjs(trimmed);
	return parsed.isValid() ? parsed : null;
}

export function combineDateAndTime(date: Date, time: string): string {
	const [hours = '0', minutes = '0'] = time.split(':');
	return dayjs(date)
		.hour(Number(hours))
		.minute(Number(minutes))
		.second(0)
		.millisecond(0)
		.format('YYYY-MM-DDTHH:mm');
}

export function emitInputChange(
	onChange: ((e: ChangeEvent<HTMLInputElement>) => void) | undefined,
	name: string | undefined,
	localValue: string,
) {
	if (!onChange || !name) return;
	onChange({
		target: { name, value: localValue },
	} as ChangeEvent<HTMLInputElement>);
}

import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

export interface DashboardCountGroup {
	total: number;
	online?: number;
	offline?: number;
	active?: number;
	inactive?: number;
}

export interface DashboardStatisticsResponse {
	users: DashboardCountGroup;
	devices: DashboardCountGroup;
	sites: DashboardCountGroup;
}

/** Min/max pair used by main (aggregate) dashboard status / analog metrics */
export type DashboardMinMax = {
	min: number;
	max: number;
};

/** On/off counts for aggregate digital GPIO on the main dashboard */
export type DashboardOnOff = {
	on: number;
	off: number;
};

/**
 * Aggregate inverter / GPIO monitor for the main dashboard.
 * Differs from per-device dashboard: alert fields are numeric values,
 * status + analog metrics are min/max, digital GPIO is on/off pairs
 * (no mode/charging/fan).
 */
export type MainDashboardData = {
	short_circuit: number;
	overload: number;
	output_voltage: DashboardMinMax;
	load_percentage: DashboardMinMax;
	battery_voltage: DashboardMinMax;
	temperature_1: DashboardMinMax;
	temperature_2: DashboardMinMax;
	digital_in_1: DashboardOnOff;
	digital_in_2: DashboardOnOff;
	digital_out_1: DashboardOnOff;
	digital_out_2: DashboardOnOff;
	analog_in_1: DashboardMinMax;
	analog_in_2: DashboardMinMax;
	analog_in_3: DashboardMinMax;
	analog_in_4: DashboardMinMax;
};

const toNumber = (value: unknown, fallback = NaN): number => {
	if (value == null || value === '') return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

const toMinMax = (value: unknown, minKey?: unknown, maxKey?: unknown): DashboardMinMax => {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const obj = value as Record<string, unknown>;
		return {
			min: toNumber(obj.min ?? obj.Min),
			max: toNumber(obj.max ?? obj.Max),
		};
	}
	return {
		min: toNumber(minKey ?? value),
		max: toNumber(maxKey ?? value),
	};
};

const toOnOff = (value: unknown, onKey?: unknown, offKey?: unknown): DashboardOnOff => {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const obj = value as Record<string, unknown>;
		return {
			on: toNumber(obj.on ?? obj.On ?? obj.high ?? obj.High),
			off: toNumber(obj.off ?? obj.Off ?? obj.low ?? obj.Low),
		};
	}
	return {
		on: toNumber(onKey),
		off: toNumber(offKey),
	};
};

/** Accept nested `{ dashboard|monitor|data }` or flat payload; support `_min`/`_max` / `_on`/`_off` keys. */
export const unwrapMainDashboard = (data: unknown): MainDashboardData => {
	const root = (data ?? {}) as Record<string, unknown>;
	const payload = (root.dashboard ?? root.monitor ?? root.data ?? root) as Record<
		string,
		unknown
	>;

	return {
		short_circuit: toNumber(payload.short_circuit),
		overload: toNumber(payload.overload),
		output_voltage: toMinMax(
			payload.output_voltage,
			payload.output_voltage_min,
			payload.output_voltage_max,
		),
		load_percentage: toMinMax(
			payload.load_percentage,
			payload.load_percentage_min,
			payload.load_percentage_max,
		),
		battery_voltage: toMinMax(
			payload.battery_voltage,
			payload.battery_voltage_min,
			payload.battery_voltage_max,
		),
		temperature_1: toMinMax(
			payload.temperature_1,
			payload.temperature_1_min,
			payload.temperature_1_max,
		),
		temperature_2: toMinMax(
			payload.temperature_2,
			payload.temperature_2_min,
			payload.temperature_2_max,
		),
		digital_in_1: toOnOff(
			payload.digital_in_1,
			payload.digital_in_1_on,
			payload.digital_in_1_off,
		),
		digital_in_2: toOnOff(
			payload.digital_in_2,
			payload.digital_in_2_on,
			payload.digital_in_2_off,
		),
		digital_out_1: toOnOff(
			payload.digital_out_1,
			payload.digital_out_1_on,
			payload.digital_out_1_off,
		),
		digital_out_2: toOnOff(
			payload.digital_out_2,
			payload.digital_out_2_on,
			payload.digital_out_2_off,
		),
		analog_in_1: toMinMax(
			payload.analog_in_1,
			payload.analog_in_1_min,
			payload.analog_in_1_max,
		),
		analog_in_2: toMinMax(
			payload.analog_in_2,
			payload.analog_in_2_min,
			payload.analog_in_2_max,
		),
		analog_in_3: toMinMax(
			payload.analog_in_3,
			payload.analog_in_3_min,
			payload.analog_in_3_max,
		),
		analog_in_4: toMinMax(
			payload.analog_in_4,
			payload.analog_in_4_min,
			payload.analog_in_4_max,
		),
	};
};

/** GET /api/dashboard/statistics */
export const getDashboardStatistics = async (): Promise<DashboardStatisticsResponse> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/dashboard/statistics`);
		return response.data;
	} catch (error) {
		console.error('Error fetching dashboard statistics:', error);
		throw error;
	}
};

/** GET /api/dashboard/ — aggregate main monitor (min/max, digital on/off) */
export const getMainDashboard = async (): Promise<MainDashboardData> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/dashboard/`);
		return unwrapMainDashboard(response.data);
	} catch (error) {
		console.error('Error fetching main dashboard:', error);
		throw error;
	}
};

/** Line-chart payload for the main dashboard (categories ↔ series data by index) */
export type DashboardPageStatisticsSeries = {
	name: string;
	unit: string | null;
	/** Numbers for points; `null` draws a gap */
	data: Array<number | null>;
};

export type DashboardPageStatistics = {
	title: string;
	categories: string[];
	series: DashboardPageStatisticsSeries[];
};

const toNullableNumber = (value: unknown): number | null => {
	if (value == null || value === '') return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
};

/**
 * Normalize chart payload:
 * - coerce values to number | null
 * - pad/truncate each series so data.length === categories.length
 */
export const normalizePageStatistics = (raw: unknown): DashboardPageStatistics => {
	const root = (raw ?? {}) as Record<string, unknown>;
	const payload = (root.data ?? root.statistics ?? root.chart ?? root) as Record<
		string,
		unknown
	>;

	const categories = Array.isArray(payload.categories)
		? payload.categories.map((c) => String(c ?? ''))
		: [];
	const len = categories.length;

	const seriesRaw = Array.isArray(payload.series) ? payload.series : [];
	const series: DashboardPageStatisticsSeries[] = seriesRaw.map((item) => {
		const s = (item ?? {}) as Record<string, unknown>;
		const unit = s.unit == null || s.unit === '' ? null : String(s.unit);
		const dataRaw = Array.isArray(s.data) ? s.data : [];
		const data: Array<number | null> = Array.from({ length: len }, (_, i) =>
			toNullableNumber(dataRaw[i]),
		);
		return {
			name: String(s.name ?? ''),
			unit,
			data,
		};
	});

	return {
		title: String(payload.title ?? 'Page Statistics'),
		categories,
		series,
	};
};

/** Dummy chart data until the real endpoint is wired */
export const DUMMY_PAGE_STATISTICS: DashboardPageStatistics = normalizePageStatistics({
	title: 'Page Statistics',
	categories: [
		'01 Jan',
		'02 Jan',
		'03 Jan',
		'04 Jan',
		'05 Jan',
		'06 Jan',
		'07 Jan',
		'08 Jan',
		'09 Jan',
		'10 Jan',
		'11 Jan',
		'12 Jan',
	],
	series: [
		{
			name: 'Session Duration',
			unit: 'mins',
			data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
		},
		{
			name: 'Page Views',
			unit: 'per session',
			data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
		},
		{
			name: 'Total Visits',
			unit: null,
			data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
		},
	],
});

/**
 * GET /api/dashboard/page-statistics/ — placeholder.
 * Returns dummy data for now; swap to the real request when backend is ready.
 */
export const getDashboardPageStatistics = async (): Promise<DashboardPageStatistics> => {
	// TODO: replace with real API when available
	// const response = await authAxios.get(`${baseURL}/api/dashboard/page-statistics/`);
	// return normalizePageStatistics(response.data);
	return DUMMY_PAGE_STATISTICS;
};

// import React, { useMemo } from 'react';
// import Card, { CardBody } from '../../bootstrap/Card';
// import PageStatisticsChart from '../../extras/charts/PageStatisticsChart';
// import {
// 	type DashboardPageStatistics,
// 	normalizePageStatistics,
// } from '../../../api/dashboard/dashboard';
// import { getDeviceCharts } from '../../../api/devices/devices';
// import { useQuery } from '@tanstack/react-query';

// /**
//  * Shape of a single chart config returned by the API.
//  * Uses the same DashboardPageStatistics structure for chart data,
//  * plus an optional `id` and `type` for future extensibility.
//  */
// export type DeviceChartConfig = {
// 	id?: string | number;
// 	title: string;
// 	type?: 'line' | 'area' | 'bar'; // future use
// 	chart: DashboardPageStatistics;
// };

// const getColClass = (total: number, index: number): string => {
//     // A single chart always takes the full width
//     if (total === 1) return 'col-12';

//     // If the total is odd, make the last chart full width
//     if (total % 2 !== 0 && index === total - 1) {
//         return 'col-12';
//     }

//     // All other charts take half width on large screens
//     return 'col-12 col-lg-6';
// };



// const DeviceCharts: React.FC<{ deviceId: number | string }> = ({ deviceId }) => {
// 	const { data: charts, isLoading, error } = useQuery({
// 		queryKey: ['device-charts', deviceId],
// 		queryFn: () => getDeviceCharts(deviceId),
// 	});
// 	if (!charts || charts.length === 0) return null;

// 	return (
// 		<div className='row g-4'>
// 			{charts.map((chartConfig, index) => (
// 				<div key={chartConfig.id ?? index} className={getColClass(charts.length, index)}>
// 					<Card className='shadow-sm h-100' borderSize={1}>
// 						<CardBody>
// 							<h5 className='fw-bold mb-4'>{chartConfig.title}</h5>
// 							<PageStatisticsChart
// 								data={chartConfig.chart}
// 								height={380}
// 							/>
// 						</CardBody>
// 					</Card>
// 				</div>
// 			))}
// 		</div>
// 	);
// };

// export default DeviceCharts;

// // ─────────────────────────────────────────────────────────────
// // DUMMY DATA — replace with real API call when backend is ready
// // ─────────────────────────────────────────────────────────────

// /** Dummy chart 1 — Output Voltage over time */
// export const DUMMY_CHART_1: DeviceChartConfig = {
// 	id: 'output-voltage',
// 	title: 'Output Voltage',
// 	chart: normalizePageStatistics({
// 		title: 'Output Voltage',
// 		categories: [
// 			'10:00', '10:05', '10:10', '10:15', '10:20',
// 			'10:25', '10:30', '10:35', '10:40', '10:45',
// 			'10:50', '10:55',
// 		],
// 		series: [
// 			{
// 				name: 'Output Voltage',
// 				unit: 'V',
// 				data: [230, 228, 232, 229, 231, 230, 227, 233, 230, 229, 231, 230],
// 			},
// 		],
// 	}),
// };

// /** Dummy chart 2 — Battery Voltage over time */
// export const DUMMY_CHART_2: DeviceChartConfig = {
// 	id: 'battery-voltage',
// 	title: 'Battery Voltage',
// 	chart: normalizePageStatistics({
// 		title: 'Battery Voltage',
// 		categories: [
// 			'10:00', '10:05', '10:10', '10:15', '10:20',
// 			'10:25', '10:30', '10:35', '10:40', '10:45',
// 			'10:50', '10:55',
// 		],
// 		series: [
// 			{
// 				name: 'Battery Voltage',
// 				unit: 'V',
// 				data: [12.5, 12.6, 12.4, 12.7, 12.5, 12.3, 12.6, 12.8, 12.5, 12.4, 12.6, 12.5],
// 			},
// 		],
// 	}),
// };

// /** Dummy chart 3 — Temperature over time */
// export const DUMMY_CHART_3: DeviceChartConfig = {
// 	id: 'temperature',
// 	title: 'Temperature',
// 	chart: normalizePageStatistics({
// 		title: 'Temperature',
// 		categories: [
// 			'10:00', '10:05', '10:10', '10:15', '10:20',
// 			'10:25', '10:30', '10:35', '10:40', '10:45',
// 			'10:50', '10:55',
// 		],
// 		series: [
// 			{
// 				name: 'Temp 1',
// 				unit: '°C',
// 				data: [35, 36, 37, 38, 37, 36, 35, 36, 37, 38, 37, 36],
// 			},
// 			{
// 				name: 'Temp 2',
// 				unit: '°C',
// 				data: [32, 33, 33, 34, 33, 32, 33, 34, 33, 32, 33, 34],
// 			},
// 		],
// 	}),
// };

// /** Dummy chart 4 — Load Percentage over time */
// export const DUMMY_CHART_4: DeviceChartConfig = {
// 	id: 'load-percentage',
// 	title: 'Load Percentage',
// 	chart: normalizePageStatistics({
// 		title: 'Load Percentage',
// 		categories: [
// 			'10:00', '10:05', '10:10', '10:15', '10:20',
// 			'10:25', '10:30', '10:35', '10:40', '10:45',
// 			'10:50', '10:55',
// 		],
// 		series: [
// 			{
// 				name: 'Load %',
// 				unit: '%',
// 				data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
// 			},
// 		],
// 	}),
// };

// /** All dummy charts — simulates API returning 4 charts */
// export const DUMMY_DEVICE_CHARTS: DeviceChartConfig[] = [
// 	DUMMY_CHART_1,
// 	DUMMY_CHART_2,
// 	DUMMY_CHART_3,
// 	// DUMMY_CHART_4,
// ];


import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card, { CardBody } from '../../bootstrap/Card';
import PageStatisticsChart from '../../extras/charts/PageStatisticsChart';
import {
	type DashboardPageStatistics,
	normalizePageStatistics,
} from '../../../api/dashboard/dashboard';
import { getDeviceCharts } from '../../../api/devices/devices';

export type DeviceChartConfig = {
	id?: string | number;
	title: string;
	type?: 'line' | 'area' | 'bar';
	chart: DashboardPageStatistics;
};

type RawPoint =
	| number
	| string
	| null
	| undefined
	| { source?: string; parsedValue?: number | null };

type RawGraph = {
	title?: string;
	categories?: string[];
	series?: {
		name: string;
		unit?: string;
		color?: string;
		strokeWidth?: number;
		dashArray?: number;
		data?: RawPoint[];
	}[];
};

/** Accepts { source, parsedValue } objects, numbers or numeric strings. */
const toNumber = (p: RawPoint): number | null => {
	if (p == null) return null;
	if (typeof p === 'number') return Number.isFinite(p) ? p : null;
	if (typeof p === 'string') {
		const n = Number(p);
		return Number.isFinite(n) ? n : null;
	}
	if (typeof p.parsedValue === 'number' && Number.isFinite(p.parsedValue)) {
		return p.parsedValue;
	}
	const n = Number(p.source);
	return Number.isFinite(n) ? n : null;
};

const formatTime = (iso: string): string => {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso; // not a date, show as-is
	return d.toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});
};

/**
 * Converts the backend response into DeviceChartConfig[].
 * Supports:
 *  - object keyed by chart id:  { "U": { title, categories, series } }
 *  - an array of graphs (or of already-built DeviceChartConfig)
 */
export const normalizeGraphsResponse = (raw: unknown): DeviceChartConfig[] => {
	if (!raw || typeof raw !== 'object') return [];

	const entries: [string, any][] = Array.isArray(raw)
		? raw.map((g, i) => [String(g?.id ?? i), g])
		: Object.entries(raw as Record<string, RawGraph>);

	return entries
		.filter(([, g]) => g && typeof g === 'object')
		.map(([key, g]) => {
			// already in final shape
			if (g.chart) return { id: g.id ?? key, ...g } as DeviceChartConfig;

			const graph = g as RawGraph;
			const rawCategories = graph.categories ?? [];

			// API sends newest first -> reverse so time flows left to right
			const categories = [...rawCategories].reverse().map(formatTime);

			const series = (graph.series ?? []).map((s) => ({
				...s,
				unit: s.unit ?? '',
				data: (s.data ?? [])
					.slice(0, rawCategories.length)
					.map(toNumber)
					.reverse(), // keep aligned with categories
			}));

			return {
				id: key,
				title: graph.title || key,
				chart: normalizePageStatistics({
					title: graph.title || key,
					categories,
					series,
				} as any),
			};
		});
};

const getColClass = (total: number, index: number): string => {
	if (total === 1) return 'col-12';
	if (total % 2 !== 0 && index === total - 1) return 'col-12';
	return 'col-12 col-lg-6';
};

const DeviceCharts: React.FC<{ deviceId: number | string }> = ({ deviceId }) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['device-charts', deviceId],
		queryFn: () => getDeviceCharts(deviceId),
		enabled: !!deviceId,
		refetchInterval: 10_000, // remove if you don't want live updates
	});

	const charts = useMemo(() => normalizeGraphsResponse(data), [data]);

	if (isLoading) {
		return <div className='text-center text-muted py-4'>Loading charts…</div>;
	}
	if (isError) {
		return <div className='text-center text-danger py-4'>Failed to load charts.</div>;
	}
	if (charts.length === 0) return null;

	return (
		<div className='row g-4'>
			{charts.map((chartConfig, index) => (
				<div
					key={chartConfig.id ?? index}
					className={getColClass(charts.length, index)}>
					<Card className='shadow-sm h-100' borderSize={1}>
						<CardBody>
							<h5 className='fw-bold mb-4'>{chartConfig.title}</h5>
							<PageStatisticsChart data={chartConfig.chart} height={380} />
						</CardBody>
					</Card>
				</div>
			))}
		</div>
	);
};

export default DeviceCharts;
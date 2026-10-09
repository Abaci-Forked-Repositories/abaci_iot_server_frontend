import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import Card, { CardBody } from '../../bootstrap/Card';
import { getDeviceCharts } from '../../../api/devices/devices';

/** Distinct color palette for device detail charts */
const PALETTE = ['#6366F1', '#EC4899', '#14B8A6', '#F97316', '#3B82F6', '#A855F7'];
const DASHES = [0, 5, 8];

/** Shape of a single chart config returned by the API */
export type DeviceChartConfig = {
	id?: string | number;
	title: string;
	type?: 'line' | 'area' | 'bar';
	chart: {
		title: string;
		categories: string[];
		series: {
			name: string;
			unit?: string | null;
			color?: string;
			strokeWidth?: number;
			dashArray?: number;
			data: Array<number | null>;
		}[];
	};
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
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});
};

/**
 * Converts the backend response into DeviceChartConfig[].
 * Handles the {source, parsedValue} object format from the API,
 * reverses newest-first ordering, and assigns palette colors.
 *
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

			// API sends newest first → reverse so time flows left to right
			const categories = [...rawCategories].reverse().map(formatTime);

			const series = (graph.series ?? []).map((s, seriesIndex) => {
				const rawData = (s.data ?? [])
					.slice(0, rawCategories.length)
					.map(toNumber)
					.reverse(); // keep aligned with reversed categories

				return {
					name: String(s.name ?? `Series ${seriesIndex + 1}`),
					unit: s.unit ?? null,
					// Use API color if provided, otherwise assign from palette
					color: s.color || PALETTE[seriesIndex % PALETTE.length],
					strokeWidth: s.strokeWidth ?? 2,
					dashArray: s.dashArray ?? 0,
					data: rawData,
				};
			});

			return {
				id: key,
				title: graph.title || key,
				chart: {
					title: graph.title || key,
					categories,
					series,
				},
			};
		});
};

const getColClass = (total: number, index: number): string => {
	if (total === 1) return 'col-12';
	if (total % 2 !== 0 && index === total - 1) return 'col-12';
	return 'col-12 col-lg-6';
};

/** Build ApexCharts options specifically for device detail charts */
const buildDeviceChartOptions = (
	categories: string[],
	seriesCount: number,
	height: number,
): ApexOptions => {
	// Use different widths per series so overlapping constant-value lines
	// remain visible (thinner lines drawn on top of thicker ones)
	const strokeWidths = Array.from({ length: seriesCount }, (_, i) => {
		if (seriesCount <= 1) return 4;
		// First series thickest, last series thinnest — ensures all visible
		return Math.max(2, 4 - i);
	});

		// All lines solid — distinct colors are enough to differentiate series
		const SOLID = 0;

		return {
			chart: {
				height,
				type: 'line',
				zoom: { enabled: true, type: 'x' as const },
				toolbar: {
					show: true,
					tools: { zoom: true, zoomin: true, zoomout: true, pan: true, reset: true },
				},
				animations: { enabled: false },
			},
			colors: Array.from({ length: seriesCount }, (_, i) => PALETTE[i % PALETTE.length]),
			dataLabels: { enabled: false },
			stroke: {
				width: strokeWidths,
				curve: 'smooth' as const,
				dashArray: strokeWidths.map(() => SOLID),
			},
		title: { text: undefined },
		legend: {
			position: 'bottom',
			tooltipHoverFormatter(val, opts) {
				const point =
					opts.w.globals.series[opts.seriesIndex]?.[opts.dataPointIndex];
				const display = point == null ? '—' : String(point);
				return `${val} - <strong>${display}</strong>`;
			},
		},
		markers: { size: 0, hover: { sizeOffset: 5 } },
		xaxis: {
			categories,
			tickAmount: Math.min(categories.length - 1, 15),
			labels: { rotate: -45, hideOverlappingLabels: true },
		},
		tooltip: {
			shared: true,
			intersect: false,
		},
		grid: { borderColor: '#f1f1f1' },
	};
};

/**
 * DeviceDetailCharts — charts specific to a single device's detail page.
 * Fetches data from /api/devices/{id}/get-graphs/ and renders independently
 * from the main dashboard charts.
 *
 * Differences from MainDashboardCharts:
 *  - Per-device data (requires deviceId)
 *  - Zoom/pan enabled (device charts benefit from drill-down)
 *  - Smooth curve interpolation
 *  - Different color palette
 *  - Shorter default height (380 vs 480)
 *  - Shared tooltip (crosshair mode)
 */
const DeviceDetailCharts: React.FC<{ deviceId: number | string }> = ({ deviceId }) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['device-charts', deviceId],
		queryFn: () => getDeviceCharts(deviceId),
		enabled: !!deviceId,
		refetchInterval: 10_000,
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
			{charts.map((chartConfig, index) => {
				const chartSeries = chartConfig.chart.series.map((s) => ({
					name: s.name,
					data: s.data,
				}));
				const options = buildDeviceChartOptions(
					chartConfig.chart.categories,
					chartConfig.chart.series.length,
					380,
				);

				return (
					<div
						key={chartConfig.id ?? index}
						className={getColClass(charts.length, index)}>
						<Card className='shadow-sm h-100' borderSize={1}>
							<CardBody>
								<h5 className='fw-bold mb-4'>{chartConfig.title}</h5>
								<Chart
									options={options}
									series={chartSeries}
									type='line'
									height={380}
								/>
							</CardBody>
						</Card>
					</div>
				);
			})}
		</div>
	);
};

export default DeviceDetailCharts;

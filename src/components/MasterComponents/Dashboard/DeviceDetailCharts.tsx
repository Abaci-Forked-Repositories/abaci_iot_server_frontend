import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import Card, { CardBody } from '../../bootstrap/Card';
import { getDeviceCharts } from '../../../api/devices/devices';

/** Modern vibrant palette with good contrast on dark/light backgrounds */
const PALETTE = ['#6366F1', '#EC4899', '#14B8A6', '#F97316', '#3B82F6', '#A855F7'];

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

/**
 * Format an ISO timestamp from the API for the X-axis.
 * Shows the exact UTC time from the response — no timezone conversion.
 * e.g. "2026-10-09T12:45:39.972596Z" → "12:45:39"
 */
const formatTime = (iso: string): string => {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	const hh = String(d.getUTCHours()).padStart(2, '0');
	const mm = String(d.getUTCMinutes()).padStart(2, '0');
	const ss = String(d.getUTCSeconds()).padStart(2, '0');
	return `${hh}:${mm}:${ss}`;
};

/**
 * Converts the backend response into DeviceChartConfig[].
 * Handles the {source, parsedValue} object format from the API,
 * reverses newest-first ordering, and assigns palette colors.
 */
export const normalizeGraphsResponse = (raw: unknown): DeviceChartConfig[] => {
	if (!raw || typeof raw !== 'object') return [];

	const entries: [string, any][] = Array.isArray(raw)
		? raw.map((g, i) => [String(g?.id ?? i), g])
		: Object.entries(raw as Record<string, RawGraph>);

	return entries
		.filter(([, g]) => g && typeof g === 'object')
		.map(([key, g]) => {
			if (g.chart) return { id: g.id ?? key, ...g } as DeviceChartConfig;

			const graph = g as RawGraph;
			const rawCategories = graph.categories ?? [];

			const categories = [...rawCategories].reverse().map(formatTime);

			const series = (graph.series ?? []).map((s, seriesIndex) => {
				const rawData = (s.data ?? [])
					.slice(0, rawCategories.length)
					.map(toNumber)
					.reverse();

				return {
					name: String(s.name ?? `Series ${seriesIndex + 1}`),
					unit: s.unit ?? null,
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

/** Build modern ApexCharts options for device detail charts */
const buildDeviceChartOptions = (
	categories: string[],
	seriesCount: number,
	height: number,
	seriesColors: string[],
): ApexOptions => {
	const strokeWidths = Array.from({ length: seriesCount }, (_, i) => {
		if (seriesCount <= 1) return 3;
		return Math.max(2, 3 - Math.floor(i / 2));
	});

	return {
		chart: {
			height,
			type: 'line',
			zoom: { enabled: true, type: 'x' as const },
			toolbar: {
				show: true,
				tools: { zoom: true, zoomin: true, zoomout: true, pan: true, reset: true },
				autoSelected: 'zoom' as const,
			},
			animations: { enabled: false },
			/** Subtle drop shadow on each line for depth */
			dropShadow: {
				enabled: true,
				top: 3,
				left: 0,
				blur: 4,
				opacity: 0.15,
			},
			/** Light background for chart area */
			background: 'transparent',
			/** Sparkline off — we want full chart */
			sparkline: { enabled: false },
		},
		colors: seriesColors,
		dataLabels: { enabled: false },
		stroke: {
			width: strokeWidths,
			curve: 'smooth' as const,
			dashArray: strokeWidths.map(() => 0),
			/** Rounded line caps for modern feel */
			lineCap: 'round' as const,
		},
		/** Solid fill — lines are drawn by stroke; drop shadow adds depth */
		fill: {
			type: 'solid',
			opacity: 1,
		},
		title: { text: undefined },
		legend: {
			show: true,
			showForSingleSeries: true,
			position: 'bottom',
			horizontalAlign: 'left' as const,
			fontSize: '13px',
			fontWeight: 500,
			markers: {
				size: 10,
				offsetX: -3,
			},
			itemMargin: { horizontal: 12, vertical: 4 },
			tooltipHoverFormatter(val, opts) {
				const point =
					opts.w.globals.series[opts.seriesIndex]?.[opts.dataPointIndex];
				const display = point == null ? '—' : String(point);
				return `${val} - <strong>${display}</strong>`;
			},
		},
		/** Subtle markers on hover only */
		markers: {
			size: 0,
			hover: { size: 5, sizeOffset: 3 },
			strokeWidth: 2,
			strokeDashArray: 0,
		},
		xaxis: {
			categories,
			...(categories.length > 1
				? { tickAmount: Math.min(categories.length - 1, 12) }
				: {}),
			labels: {
				show: true,
				rotate: categories.length > 1 ? -45 : 0,
				hideOverlappingLabels: categories.length > 1,
				style: {
					fontSize: '11px',
					fontWeight: 400,
					colors: '#94a3b8',
				},
				datetimeUTC: false,
			},
			axisBorder: { show: true, color: '#e2e8f0' },
			axisTicks: { show: false },
			crosshairs: {
				show: true,
				stroke: { color: '#6366F1', width: 1, dashArray: 4 },
			},
		},
		yaxis: {
			labels: {
				style: {
					fontSize: '11px',
					fontWeight: 400,
					colors: '#94a3b8',
				},
				/** Clean number formatting */
				formatter: (val: number) => {
					if (Number.isNaN(val)) return '—';
					if (Math.abs(val) >= 1000) return val.toFixed(0);
					return val.toFixed(1);
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		tooltip: {
			shared: true,
			intersect: false,
			theme: 'dark' as const,
			style: { fontSize: '13px' },
			/** Custom marker dots in tooltip */
			marker: { show: true },
			x: { show: true, format: 'HH:mm:ss' },
		},
		/** Dashed horizontal grid only (no vertical) for clean look */
		grid: {
			show: true,
			borderColor: '#f1f5f9',
			strokeDashArray: 4,
			position: 'back' as const,
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: true } },
			padding: { top: 0, right: 8, bottom: 0, left: 8 },
		},
		/** Subtle plot area border */
		plotOptions: {
			line: {
				isSlopeChart: false,
			},
		},
	};
};

/**
 * DeviceDetailCharts — charts specific to a single device's detail page.
 * Modern, polished design with gradient fills, drop shadows,
 * refined grid, and interactive crosshair tooltips.
 */
const DeviceDetailCharts: React.FC<{ deviceId: number | string }> = ({ deviceId }) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['device-charts', deviceId],
		queryFn: () => getDeviceCharts(deviceId),
		enabled: !!deviceId,
		refetchInterval: 30_000,
	});

	const charts = useMemo(() => normalizeGraphsResponse(data), [data]);

	if (isLoading) {
		return (
			<div className='row g-4'>
				<div className='col-12'>
					<Card className='shadow-sm' borderSize={1}>
						<CardBody className='py-5'>
							<div className='text-center text-muted'>
								<span className='spinner-border spinner-border-sm me-2' role='status' />
								Loading charts…
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='row g-4'>
				<div className='col-12'>
					<Card className='shadow-sm' borderSize={1}>
						<CardBody className='py-5'>
							<div className='text-center text-danger'>Failed to load charts.</div>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}

	if (charts.length === 0) return null;

	return (
		<div className='row g-4'>
			{charts.map((chartConfig, index) => {
				const chartSeries = chartConfig.chart.series.map((s) => ({
					name: s.name,
					data: s.data,
				}));
				const seriesColors = chartConfig.chart.series.map(
					(s, i) => s.color || PALETTE[i % PALETTE.length],
				);
				const options = buildDeviceChartOptions(
					chartConfig.chart.categories,
					chartConfig.chart.series.length,
					380,
					seriesColors,
				);

				return (
					<div
						key={chartConfig.id ?? index}
						className={getColClass(charts.length, index)}>
						<Card
							className='h-100'
							borderSize={0}
							style={{
								borderRadius: '16px',
								boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
								border: '1px solid #f1f5f9',
								overflow: 'hidden',
							}}>
							<CardBody style={{ padding: '20px 20px 8px' }}>
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

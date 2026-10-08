import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
	DUMMY_PAGE_STATISTICS,
	type DashboardPageStatistics,
} from '../../../api/dashboard/dashboard';

export type PageStatisticsChartProps = {
	/** API-shaped chart payload; defaults to dummy data */
	data?: DashboardPageStatistics;
	height?: number;
};

const STROKE_WIDTHS = [5, 7, 5];
const DASH_ARRAYS = [0, 8, 5];
const COLORS = ['#7986CB', '#F06292', '#4DB6AC'];

const formatTooltipTitle = (seriesName: string, unit: string | null | undefined) => {
	if (!unit) return seriesName;
	return `${seriesName} (${unit})`;
};

const PageStatisticsChart: React.FC<PageStatisticsChartProps> = ({
	data = DUMMY_PAGE_STATISTICS,
	height = 480,
}) => {
	const chartSeries = useMemo(
		() =>
			data.series.map((s) => ({
				name: s.name,
				data: s.data,
			})),
		[data.series],
	);

	const options = useMemo<ApexOptions>(() => {
		const seriesCount = Math.max(data.series.length, 1);

		return {
			chart: {
				height,
				type: 'line',
				zoom: { enabled: false },
				toolbar: { show: false },
			},
			colors: COLORS,
			dataLabels: { enabled: false },
			stroke: {
				width: Array.from(
					{ length: seriesCount },
					(_, i) => STROKE_WIDTHS[i % STROKE_WIDTHS.length],
				),
				curve: 'straight',
				dashArray: Array.from(
					{ length: seriesCount },
					(_, i) => DASH_ARRAYS[i % DASH_ARRAYS.length],
				),
			},
			title: {
				text: data.title || 'Page Statistics',
				align: 'left',
			},
			legend: {
				tooltipHoverFormatter(val, opts) {
					const point =
						opts.w.globals.series[opts.seriesIndex]?.[opts.dataPointIndex];
					const display = point == null ? '—' : String(point);
					return `${val} - <strong>${display}</strong>`;
				},
			},
			markers: {
				size: 0,
				hover: { sizeOffset: 6 },
			},
			xaxis: {
				categories: data.categories,
			},
			tooltip: {
				y: data.series.map((s) => ({
					title: {
						formatter: () => formatTooltipTitle(s.name, s.unit),
					},
				})),
			},
			grid: {
				borderColor: '#f1f1f1',
			},
		};
	}, [data.title, data.categories, data.series, height]);

	if (!data.categories.length || !data.series.length) {
		return (
			<div className='text-center text-muted py-5'>No chart data available.</div>
		);
	}

	return (
		<Chart options={options} series={chartSeries} type='line' height={height} />
	);
};

export default PageStatisticsChart;

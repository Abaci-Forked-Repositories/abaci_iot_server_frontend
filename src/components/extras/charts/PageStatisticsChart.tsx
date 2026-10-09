import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { type DashboardPageStatistics } from '../../../api/dashboard/dashboard';

// Same look as the "Page Statistics" example: indigo, pink, teal, then extras
const PALETTE = ['#7986CB', '#F06292', '#4DB6AC', '#FFB74D', '#64B5F6', '#BA68C8'];
// first line solid, the next ones dashed, repeating
const DASHES = [0, 8, 5];

const PageStatisticsChart: React.FC<{
	data: DashboardPageStatistics;
	height?: number;
}> = ({ data, height = 480 }) => {
	const chartSeries = useMemo(
		() => data.series.map((s) => ({ name: s.name, data: s.data })),
		[data.series],
	);

	const options = useMemo<ApexOptions>(() => {
		const series = data.series;
		// 12 points can take a thick line; 100 points need a thinner one
		const defaultWidth = data.categories.length > 30 ? 3 : 5;

		return {
			chart: {
				height,
				type: 'line',
				zoom: { enabled: false },
				toolbar: { show: false },
				animations: { enabled: false }, // avoids re-animating on every refetch
			},
			colors: series.map(
				(s, i) => s.color || PALETTE[i % PALETTE.length],
			),
			dataLabels: { enabled: false },
			stroke: {
				width: series.map((s) => (s.strokeWidth as number) || defaultWidth),
				curve: 'straight',
				dashArray: series.map(
					(s, i) => (s.dashArray as number) ?? DASHES[i % DASHES.length],
				),
			},
			title: { text: data.title || 'Page Statistics', align: 'left' },
			legend: {
				position: 'bottom',
				tooltipHoverFormatter(val, opts) {
					const point =
						opts.w.globals.series[opts.seriesIndex]?.[opts.dataPointIndex];
					const display = point == null ? '—' : String(point);
					return `${val} - <strong>${display}</strong>`;
				},
			},
			markers: { size: 0, hover: { sizeOffset: 6 } },
			xaxis: {
				categories: data.categories,
				tickAmount: Math.min(data.categories.length - 1, 11), // ~12 labels like the example
				labels: { rotate: 0, hideOverlappingLabels: true },
			},
			tooltip: {
				y: series.map((s) => ({
					title: {
						formatter: () => (s.unit ? `${s.name} (${s.unit})` : s.name),
					},
				})),
			},
			grid: { borderColor: '#f1f1f1' },
		};
	}, [data.title, data.categories, data.series, height]);

	if (!data.categories.length || !data.series.length) {
		return <div className='text-center text-muted py-5'>No chart data available.</div>;
	}

	return <Chart options={options} series={chartSeries} type='line' height={height} />;
};

export default PageStatisticsChart;
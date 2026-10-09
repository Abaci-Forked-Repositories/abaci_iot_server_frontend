import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import Card, { CardBody } from '../../bootstrap/Card';
import {
	type DashboardPageStatistics,
	normalizePageStatistics,
	getDashboardPageStatistics,
} from '../../../api/dashboard/dashboard';

/** Color palette for the main dashboard aggregate charts */
const PALETTE = ['#7986CB', '#F06292', '#4DB6AC', '#FFB74D', '#64B5F6', '#BA68C8'];
const DASHES = [0, 8, 5];

const buildApexOptions = (data: DashboardPageStatistics, height: number): ApexOptions => {
	const series = data.series;
	const defaultWidth = data.categories.length > 30 ? 3 : 5;

	return {
		chart: {
			height,
			type: 'line',
			zoom: { enabled: false },
			toolbar: { show: false },
			animations: { enabled: false },
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
		title: { text: data.title || 'Dashboard Statistics', align: 'left' },
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
			tickAmount: Math.min(data.categories.length - 1, 11),
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
};

/**
 * MainDashboardCharts — charts specific to the main (aggregate) dashboard.
 * Fetches data from /api/dashboard/page-statistics/ and renders independently
 * from the device detail charts.
 */
const MainDashboardCharts: React.FC = () => {
	const { data: rawData, isLoading, isError } = useQuery({
		queryKey: ['dashboard', 'page-statistics'],
		queryFn: getDashboardPageStatistics,
	});

	const chartData = useMemo(
		() => normalizePageStatistics(rawData),
		[rawData],
	);

	if (isLoading) {
		return <div className='text-center text-muted py-4'>Loading dashboard charts…</div>;
	}

	if (isError) {
		return <div className='text-center text-danger py-4'>Failed to load dashboard charts.</div>;
	}

	if (!chartData.categories.length || !chartData.series.length) {
		return <div className='text-center text-muted py-5'>No chart data available.</div>;
	}

	const chartSeries = chartData.series.map((s) => ({ name: s.name, data: s.data }));
	const options = buildApexOptions(chartData, 480);

	return (
		<Card className='shadow-sm' borderSize={1}>
			<CardBody>
				<Chart options={options} series={chartSeries} type='line' height={480} />
			</CardBody>
		</Card>
	);
};

export default MainDashboardCharts;

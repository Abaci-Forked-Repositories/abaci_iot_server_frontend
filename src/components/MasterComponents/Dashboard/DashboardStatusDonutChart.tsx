import React, { useEffect, useMemo, useRef } from 'react';
import type { ApexOptions } from 'apexcharts';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Chart from '../../extras/Chart';
import type { StatusDonutChartData } from './dashboardStatisticsConfig';

interface DashboardStatusDonutChartProps {
	title: string;
	icon: string;
	data: StatusDonutChartData;
}

type PieChartContext = {
	toggleDataPointSelection: (dataPointIndex: number) => void;
	pie?: {
		pieClicked: (dataPointIndex: number) => void;
	};
};

const expandSlice = (chart: PieChartContext, index: number) => {
	if (chart.pie?.pieClicked) {
		chart.pie.pieClicked(index);
		return;
	}
	chart.toggleDataPointSelection(index);
};

const collapseSlice = (chart: PieChartContext, index: number) => {
	if (chart.pie?.pieClicked) {
		chart.pie.pieClicked(index);
		return;
	}
	chart.toggleDataPointSelection(index);
};

const DashboardStatusDonutChart: React.FC<DashboardStatusDonutChartProps> = ({
	title,
	icon,
	data,
}) => {
	const activeSliceRef = useRef<number | null>(null);
	const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
		},
		[],
	);

	const chartOptions = useMemo((): ApexOptions => {
		return {
			chart: {
				type: 'donut',
				height: 320,
				dropShadow: {
					enabled: true,
					top: 3,
					left: 0,
					blur: 10,
					opacity: 0.14,
				},
				animations: {
					enabled: true,
					easing: 'easeinout',
					speed: 680,
					animateGradually: {
						enabled: true,
						delay: 120,
					},
					dynamicAnimation: {
						enabled: true,
						speed: 280,
					},
				},
				events: {
					dataPointMouseEnter: (
						_event: unknown,
						chartContext: PieChartContext,
						config: { dataPointIndex: number },
					) => {
						if (leaveTimerRef.current) {
							clearTimeout(leaveTimerRef.current);
							leaveTimerRef.current = null;
						}

						const idx = config.dataPointIndex;
						if (activeSliceRef.current !== null && activeSliceRef.current !== idx) {
							collapseSlice(chartContext, activeSliceRef.current);
						}
						if (activeSliceRef.current !== idx) {
							expandSlice(chartContext, idx);
							activeSliceRef.current = idx;
						}
					},
					dataPointMouseLeave: (
						_event: unknown,
						chartContext: PieChartContext,
						config: { dataPointIndex: number },
					) => {
						const idx = config.dataPointIndex;
						leaveTimerRef.current = setTimeout(() => {
							if (activeSliceRef.current === idx) {
								collapseSlice(chartContext, idx);
								activeSliceRef.current = null;
							}
						}, 90);
					},
				},
			},
			labels: data.labels,
			stroke: {
				show: true,
				width: 2,
				colors: ['#ffffff'],
			},
			states: {
				hover: {
					filter: {
						type: 'none',
					},
				},
				active: {
					allowMultipleDataPointsSelection: false,
					filter: {
						type: 'none',
					},
				},
			},
			legend: {
				position: 'bottom',
				fontSize: '13px',
				markers: {
					width: 10,
					height: 10,
					radius: 10,
				},
			},
			dataLabels: {
				enabled: true,
				formatter: (val: number) => `${Math.round(val)}%`,
				dropShadow: {
					enabled: false,
				},
			},
			tooltip: {
				enabled: true,
				y: {
					formatter: (val: number) => `${val}`,
				},
			},
			plotOptions: {
				pie: {
					expandOnClick: true,
					customScale: 1,
					donut: {
						size: '62%',
						labels: {
							show: true,
							name: {
								show: true,
								fontSize: '14px',
								fontWeight: 600,
								offsetY: -6,
							},
							value: {
								show: true,
								fontSize: '24px',
								fontWeight: 700,
								offsetY: 6,
							},
							total: {
								show: true,
								showAlways: false,
								label: 'Total',
								fontSize: '13px',
								fontWeight: 600,
								color: '#64748b',
								formatter: () => String(data.total),
							},
						},
					},
				},
			},
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: { height: 280 },
						legend: { position: 'bottom' },
					},
				},
			],
		};
	}, [data.labels, data.series, data.total]);

	return (
		<Card className='dashboard-donut-card dashboard-donut-card--static h-100 shadow-sm'>
			<CardHeader className='dashboard-donut-card__header'>
				<CardLabel icon={icon}>
					<CardTitle tag='h5' className='mb-0'>
						{title}
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody className='dashboard-donut-card__body d-flex flex-column align-items-center justify-content-center py-3'>
				{data.total === 0 || data.series.length === 0 ? (
					<div className='text-center text-muted py-5'>No data for this chart.</div>
				) : (
					<div className='dashboard-donut-chart__stage w-100'>
						<Chart
							key={`${title}-${data.total}-${data.series.join('-')}`}
							series={data.series}
							options={chartOptions}
							type='donut'
							height={320}
							width='100%'
							className='dashboard-donut-chart'
						/>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default DashboardStatusDonutChart;

import { authAxios } from '../axiosInstance';

export interface DashboardStatusCount {
	label: string;
	count: number;
}

export interface DashboardCountGroup {
	total?: number;
	active?: number;
	inactive?: number;
	online?: number;
	offline?: number;
	by_status?: Record<string, DashboardStatusCount>;
}

export interface DashboardStatisticsResponse {
	devices?: DashboardCountGroup;
	sites?: DashboardCountGroup;
	users?: DashboardCountGroup;
}

const unwrap = <T>(request: Promise<{ data: T }>) => request.then((response) => response.data);

/** GET /api/dashboard/statistics/ */
export const dashboardApi = {
	statistics: () =>
		unwrap<DashboardStatisticsResponse>(
			authAxios.get('api/dashboard/statistics/'),
		),
};

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

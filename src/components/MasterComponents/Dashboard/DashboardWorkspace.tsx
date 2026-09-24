import React from 'react';
import DashboardStatisticsCards from './DashboardStatisticsCards';

interface DashboardWorkspaceProps {
	deviceId: number | string;
	deviceName?: string;
}

const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({
	deviceId,
	deviceName,
}) => {
	return (
		<div className='d-flex flex-column gap-4 h-100'>
			<DashboardStatisticsCards deviceId={deviceId} deviceName={deviceName} />
		</div>
	);
};

export default DashboardWorkspace;

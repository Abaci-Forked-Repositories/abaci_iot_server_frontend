import React from 'react';
import DashboardStatisticsCards from './DashboardStatisticsCards';

interface DashboardWorkspaceProps {
	deviceName?: string;
}

const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({ deviceName }) => {
	return (
		<div className='d-flex flex-column gap-4 h-100'>
			<DashboardStatisticsCards deviceName={deviceName} />
		</div>
	);
};

export default DashboardWorkspace;

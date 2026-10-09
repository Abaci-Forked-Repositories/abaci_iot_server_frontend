import React from 'react';
import DeviceDetailMonitor from './DeviceDetailMonitor';

interface DeviceDetailDashboardProps {
	deviceId: number | string;
	deviceName?: string;
}

/**
 * DeviceDetailDashboard — top-level wrapper for a single device's detail page dashboard.
 * This is specific to the device detail view and independent from the main dashboard.
 */
const DeviceDetailDashboard: React.FC<DeviceDetailDashboardProps> = ({
	deviceId,
	deviceName,
}) => {
	return (
		<div className='d-flex flex-column gap-4 h-100'>
			<DeviceDetailMonitor deviceId={deviceId} deviceName={deviceName} />
		</div>
	);
};

export default DeviceDetailDashboard;

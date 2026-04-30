import React from 'react';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import type { Screen } from '../../../services/screensManagementApi';

interface ScreenDetailPanelProps {
	screen: Screen | null;
	actionLoadingKey: string | null;
	onActivateToggle: (screen: Screen) => void;
	onAudioToggle: (screen: Screen) => void;
	onHeartbeat: (screen: Screen) => void;
}

const ScreenDetailPanel: React.FC<ScreenDetailPanelProps> = ({
	screen,
	actionLoadingKey,
	onActivateToggle,
	onAudioToggle,
	onHeartbeat,
}) => {
	if (!screen) {
		return (
			<div className='screen-detail-empty'>
				Select a screen card to see details and actions.
			</div>
		);
	}

	return (
		<div className='screen-detail-panel'>
			<div className='d-flex align-items-center justify-content-between mb-2'>
				<h5 className='mb-0'>{screen.name}</h5>
				<Badge color={screen.is_active ? 'success' : 'secondary'} isLight>
					{screen.is_active ? 'Active' : 'Inactive'}
				</Badge>
			</div>
			<div className='screen-detail-row'>
				<span>ID</span>
				<span>{screen.id}</span>
			</div>
			<div className='screen-detail-row'>
				<span>Location</span>
				<span>{screen.location || '-'}</span>
			</div>
			<div className='screen-detail-row'>
				<span>Template</span>
				<span>{screen.template?.name || '-'}</span>
			</div>
			<div className='screen-detail-row'>
				<span>Online</span>
				<span>{screen.is_online ? 'Yes' : 'No'}</span>
			</div>
			<div className='screen-detail-row'>
				<span>Audio</span>
				<span>{screen.enable_audio ? 'Enabled' : 'Disabled'}</span>
			</div>
			<div className='screen-detail-row'>
				<span>Last heartbeat</span>
				<span>{screen.last_heartbeat ? new Date(screen.last_heartbeat).toLocaleString() : '-'}</span>
			</div>
			<div className='d-flex flex-wrap gap-2 mt-3'>
				<Button
					size='sm'
					color={screen.is_active ? 'danger' : 'success'}
					isLight
					isDisable={actionLoadingKey === `screen-active-${screen.id}`}
					onClick={() => onActivateToggle(screen)}>
					{screen.is_active ? 'Deactivate' : 'Activate'}
				</Button>
				<Button
					size='sm'
					color='secondary'
					isLight
					isDisable={actionLoadingKey === `screen-audio-${screen.id}`}
					onClick={() => onAudioToggle(screen)}>
					Toggle Audio
				</Button>
				<Button
					size='sm'
					color='primary'
					isLight
					isDisable={actionLoadingKey === `screen-heartbeat-${screen.id}`}
					onClick={() => onHeartbeat(screen)}>
					Send Heartbeat
				</Button>
			</div>
		</div>
	);
};

export default ScreenDetailPanel;

import React from 'react';
import Icon from '../../icon/Icon';
import StandardTvFrame from '../../StandardTvFrame/StandardTvFrame';
import type { Screen } from '../../../services/screensManagementApi';

interface ScreenTvPreviewProps {
	screen: Screen | null;
}

const ScreenTvPreview: React.FC<ScreenTvPreviewProps> = ({ screen }) => {
	const online = Boolean(screen?.is_online);

	return (
		<div className='screen-tv-root'>
			<StandardTvFrame
				aspectRatio='16 / 9'
				flicker={online}
				footerSlot={
					<>
						<span className='std-tv-footer-brand'>ABACI</span>
						<span className='std-tv-footer-led' />
					</>
				}>
				<div className='screen-tv-content'>
					<span className={`screen-tv-chip ${online ? 'is-online' : 'is-offline'}`}
						style={{ position: 'absolute', top: 8, right: 8 }}>
						{online ? 'Live' : 'Offline'}
					</span>
					<Icon icon='Tv' size='3x' className='screen-tv-icon' />
					<div className='screen-tv-title'>{screen?.name || 'Select a screen'}</div>
					<div className='screen-tv-sub'>{screen?.location || 'No location configured'}</div>
					<div className='screen-tv-footer-inner'>
						<span className='screen-tv-footer-label'>Now playing</span>
						<span className='screen-tv-footer-value'>
							{screen?.template?.name || 'No template attached'}
						</span>
					</div>
				</div>
			</StandardTvFrame>
		</div>
	);
};

export default ScreenTvPreview;

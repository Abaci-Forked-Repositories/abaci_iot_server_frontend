import React from 'react';
import Icon from '../../icon/Icon';
import StandardTvFrame from '../../StandardTvFrame/StandardTvFrame';
import type { Screen } from '../../../services/screensManagementApi';
import { getScreenTemplateId, getScreenTemplateName } from '../../../services/screenTemplatesApi';
import type { Template } from '../../../services/templatesApi';

interface ScreenTvPreviewProps {
	screen: Screen | null;
	templateById?: Record<number, Template>;
}

const ScreenTvPreview: React.FC<ScreenTvPreviewProps> = ({ screen, templateById = {} }) => {
	const online = Boolean(screen?.is_online);
	const assignments = [...(screen?.screen_templates ?? [])].sort((a, b) => a.order - b.order);
	const firstAssignment = assignments[0];
	const nowPlaying = firstAssignment
		? templateById[getScreenTemplateId(firstAssignment)]?.template_name ??
			getScreenTemplateName(firstAssignment)
		: screen?.template?.name || 'No template attached';

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
						<span className='screen-tv-footer-value'>{nowPlaying}</span>
					</div>
				</div>
			</StandardTvFrame>
		</div>
	);
};

export default ScreenTvPreview;

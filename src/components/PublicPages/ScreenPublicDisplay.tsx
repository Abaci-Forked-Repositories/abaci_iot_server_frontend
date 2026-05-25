import React from 'react';
import TemplateFabricPreview from '../MasterComponents/Templates/TemplateFabricPreview';
import type { PublicQueueStatus, PublicScreenInfo, PublicScreenTemplate } from '../../services/publicScreenApi';

interface ScreenPublicDisplayProps {
	screen: PublicScreenInfo;
	template: PublicScreenTemplate | null;
	queuesByUuid: Record<string, PublicQueueStatus>;
}

const ScreenPublicDisplay: React.FC<ScreenPublicDisplayProps> = ({
	screen,
	template,
	queuesByUuid,
}) => {
	const online = Boolean(screen.is_online);
	const htmlContent = template?.html_content?.trim() ?? '';

	return (
		<div className='screen-public-root screen-public-root--fullscreen'>
			{htmlContent ? (
				<TemplateFabricPreview
					key={template?.screen_template_id ?? template?.id ?? 'template'}
					className='screen-public-fabric-preview'
					htmlContent={htmlContent}
					configuration={template?.configuration ?? null}
					orientation='landscape'
					queuesByUuid={queuesByUuid}
					flicker={online}
					fullScreen
				/>
			) : (
				<div className='screen-public-fallback'>
					<div className='screen-public-fallback-title'>{screen.name}</div>
					<div className='screen-public-fallback-sub'>
						{screen.location || 'No location configured'}
					</div>
					{template?.name && (
						<div className='screen-public-fallback-template'>{template.name}</div>
					)}
				</div>
			)}
			<span
				className={`screen-tv-chip screen-public-status-chip ${online ? 'is-online' : 'is-offline'}`}>
				{online ? 'Live' : 'Offline'}
			</span>
		</div>
	);
};

export default ScreenPublicDisplay;

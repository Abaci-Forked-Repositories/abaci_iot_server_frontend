import React from 'react';
import TemplateFabricPreview from '../MasterComponents/Templates/TemplateFabricPreview';
import type { PublicQueueStatus, PublicScreenInfo, PublicScreenTemplate } from '../../services/publicScreenApi';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

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
	const backgroundUrl = resolveMediaUrl(screen.background_image);

	return (
		<div className='screen-public-root screen-public-root--fullscreen'>
			{backgroundUrl && (
				<div
					className='screen-public-background'
					style={{ backgroundImage: `url("${backgroundUrl}")` }}
					aria-hidden
				/>
			)}
			{htmlContent ? (
				<div className='screen-public-template-layer'>
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
				</div>
			) : (
				<div className='screen-public-fallback screen-public-fallback--over-bg'>
					<div className='screen-public-fallback-title'>{screen.name}</div>
					<div className='screen-public-fallback-sub'>
						{screen.location || ''}
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

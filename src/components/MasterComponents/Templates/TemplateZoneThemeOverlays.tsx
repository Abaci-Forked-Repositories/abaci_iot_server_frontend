import React from 'react';
import type { Queue } from '../../../services/queueManagementApi';
import { TokenDisplayThemeCard } from '../TokenDisplayThemes';
import {
	type FabricZoneOverlayRect,
	getZoneAppearanceFromRect,
	getZoneOverlayBounds,
} from '../../../utils/zoneAppearanceFabric';
import type { RecentQueueToken } from '../../../services/publicScreenApi';

// Mock history lets template designers preview the full zone layout in the editor.
const MOCK_RECENT_TOKENS: RecentQueueToken[] = [
	{ token_display: 'B026', serving_point_name: 'Counter 03' },
	{ token_display: 'B025', serving_point_name: 'Counter 02' },
	{ token_display: 'B024', serving_point_name: 'Counter 01' },
	{ token_display: 'B023', serving_point_name: 'Counter 04' },
];

export interface TemplateZoneThemeOverlaysProps {
	zones: FabricZoneOverlayRect[];
	queuesById: Map<number, Queue>;
	/** Bump when canvas zones move/resize so bounds recompute. */
	revision?: number;
}

const TemplateZoneThemeOverlays: React.FC<TemplateZoneThemeOverlaysProps> = ({
	zones,
	queuesById,
	revision = 0,
}) => {
	void revision;

	return (
		<div
			className='tdc-zone-overlays'
			aria-hidden>
			{zones.map((rect) => {
				const appearance = getZoneAppearanceFromRect(rect);
				if (appearance.mode === 'theme' && !appearance.displayTheme) return null;

				const bounds = getZoneOverlayBounds(rect);
				const queueIds = Array.isArray(rect.queueIds) ? rect.queueIds : [];
				const queueName =
					(queueIds[0] != null ? queuesById.get(queueIds[0])?.name : null) ??
					(Array.isArray(rect.queueChipNames) ? rect.queueChipNames[0] : null) ??
					rect.name ??
					'Queue';
				const zoneOpacity = typeof (rect as any).opacity === 'number' ? (rect as any).opacity : 1;

				return (
					<div
						key={rect.id ?? `${bounds.left}-${bounds.top}`}
						className='tdc-zone-theme-overlay'
						style={{
							left: bounds.left,
							top: bounds.top,
							width: bounds.width,
							height: bounds.height,
							borderRadius: bounds.borderRadius,
							opacity: zoneOpacity,
						}}>
					<TokenDisplayThemeCard
						appearance={appearance}
						queueName={queueName}
						tokenDisplay='05'
						status='waiting'
						recentTokens={MOCK_RECENT_TOKENS}
						fillContainer
						showHistoryTime={false}
					/>
					</div>
				);
			})}
		</div>
	);
};

export default TemplateZoneThemeOverlays;

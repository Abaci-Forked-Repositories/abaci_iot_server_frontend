import React from 'react';
import type { Queue } from '../../../services/queueManagementApi';
import { TokenDisplayThemeCard } from '../TokenDisplayThemes';
import {
	type FabricZoneOverlayRect,
	getZoneAppearanceFromRect,
	getZoneOverlayBounds,
} from '../../../utils/zoneAppearanceFabric';

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
		<div className='tdc-zone-overlays' aria-hidden>
			{zones.map((rect) => {
				const appearance = getZoneAppearanceFromRect(rect);
				if (appearance.mode !== 'theme' || !appearance.displayTheme) return null;

				const bounds = getZoneOverlayBounds(rect);
				const queueIds = Array.isArray(rect.queueIds) ? rect.queueIds : [];
				const queueName =
					(queueIds[0] != null ? queuesById.get(queueIds[0])?.name : null) ??
					(Array.isArray(rect.queueChipNames) ? rect.queueChipNames[0] : null) ??
					rect.name ??
					'Queue';

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
						}}>
						<TokenDisplayThemeCard
							appearance={appearance}
							queueName={queueName}
							tokenDisplay='05'
							status='waiting'
							fillContainer
						/>
					</div>
				);
			})}
		</div>
	);
};

export default TemplateZoneThemeOverlays;

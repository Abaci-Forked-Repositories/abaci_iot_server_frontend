import React, { memo, useMemo } from 'react';

/** Tessellated rhombus grid — terracotta, olive, and sand shards. */
const MOSAIC_SHADES = ['terra', 'olive', 'sand', 'terra-deep', 'olive-soft', 'sand-deep'] as const;

const TerracottaOliveSandMosaicField: React.FC = () => {
	const tiles = useMemo(
		() =>
			Array.from({ length: 30 }, (_, i) => ({
				id: i,
				shade: MOSAIC_SHADES[i % MOSAIC_SHADES.length],
				flip: i % 2 === 1,
				delay: (i % 6) * 0.07 + Math.floor(i / 6) * 0.04,
			})),
		[],
	);

	return (
		<div className='tdc-tos-mosaic-field' aria-hidden='true'>
			{tiles.map((tile) => (
				<span
					key={tile.id}
					className={[
						'tdc-tos-mosaic-cell',
						`tdc-tos-mosaic-cell--${tile.shade}`,
						tile.flip ? 'tdc-tos-mosaic-cell--flip' : '',
					]
						.filter(Boolean)
						.join(' ')}
					style={{ animationDelay: `${tile.delay}s` }}
				/>
			))}
			<div className='tdc-tos-mosaic-field__veil' />
		</div>
	);
};

export default memo(TerracottaOliveSandMosaicField);

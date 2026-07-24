import React, { memo, useMemo } from 'react';

/** Soft pastel route-map panels — Tokyo/Seoul line colors as matte mosaic tiles. */
const LINE_SHADES = ['orange', 'red', 'sky', 'green', 'silver', 'gold'] as const;

const MetroMosaicMapField: React.FC = () => {
	const tiles = useMemo(
		() =>
			Array.from({ length: 24 }, (_, i) => ({
				id: i,
				shade: LINE_SHADES[i % LINE_SHADES.length],
				delay: (i % 6) * 0.05 + Math.floor(i / 6) * 0.03,
			})),
		[],
	);

	return (
		<div className='tdc-mm-map-field' aria-hidden='true'>
			<div className='tdc-mm-map-field__grid' />
			{tiles.map((tile) => (
				<span
					key={tile.id}
					className={`tdc-mm-map-cell tdc-mm-map-cell--${tile.shade}`}
					style={{ animationDelay: `${tile.delay}s` }}
				/>
			))}
			<div className='tdc-mm-map-field__route'>
				<span className='tdc-mm-map-field__dot' />
				<span className='tdc-mm-map-field__rail' />
				<span className='tdc-mm-map-field__dot' />
				<span className='tdc-mm-map-field__rail' />
				<span className='tdc-mm-map-field__dot tdc-mm-map-field__dot--active' />
			</div>
			<div className='tdc-mm-map-field__veil' />
		</div>
	);
};

export default memo(MetroMosaicMapField);

import React, { memo, useMemo } from 'react';

/** Drifting dunes, warm sun glow, and floating sand grains. */
const TerracottaOliveSandBackdrop: React.FC = () => {
	const grains = useMemo(
		() =>
			[
				[6, 18, 0.9, 0],
				[14, 42, 0.6, 0.5],
				[22, 8, 1.1, 1.1],
				[30, 62, 0.7, 0.3],
				[38, 28, 0.8, 1.6],
				[46, 72, 0.5, 0.8],
				[54, 14, 1.0, 2.0],
				[62, 48, 0.6, 0.2],
				[70, 22, 0.9, 1.4],
				[78, 58, 0.7, 0.6],
				[86, 34, 1.1, 1.8],
				[92, 68, 0.5, 0.4],
				[10, 78, 0.8, 1.2],
				[18, 52, 0.6, 2.2],
				[44, 86, 0.7, 0.9],
				[58, 6, 0.9, 1.7],
				[74, 82, 0.5, 0.15],
				[82, 12, 0.8, 2.4],
			] as Array<[number, number, number, number]>,
		[],
	);

	return (
		<div className='tdc-tos-backdrop' aria-hidden='true'>
			<div className='tdc-tos-backdrop__sun' />
			<div className='tdc-tos-backdrop__haze tdc-tos-backdrop__haze--olive' />
			<div className='tdc-tos-backdrop__haze tdc-tos-backdrop__haze--terra' />
			<div className='tdc-tos-backdrop__dunes'>
				<span className='tdc-tos-backdrop__dune tdc-tos-backdrop__dune--a' />
				<span className='tdc-tos-backdrop__dune tdc-tos-backdrop__dune--b' />
				<span className='tdc-tos-backdrop__dune tdc-tos-backdrop__dune--c' />
			</div>
			<div className='tdc-tos-backdrop__grains'>
				{grains.map(([x, y, r, delay], i) => (
					<span
						key={`${x}-${y}-${i}`}
						className='tdc-tos-backdrop__grain'
						style={
							{
								left: `${x}%`,
								top: `${y}%`,
								width: `${r * 0.28}em`,
								height: `${r * 0.28}em`,
								'--tos-grain-delay': `${delay}s`,
							} as React.CSSProperties
						}
					/>
				))}
			</div>
			<div className='tdc-tos-backdrop__vignette' />
		</div>
	);
};

export default memo(TerracottaOliveSandBackdrop);

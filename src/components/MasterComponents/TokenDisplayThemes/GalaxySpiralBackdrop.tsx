import React, { memo, useMemo } from 'react';

/** Twinkling starfield + soft nebula haze for Galaxy Spiral. */
const GalaxySpiralBackdrop: React.FC = () => {
	const stars = useMemo(
		() =>
			[
				[8, 12, 1.1, 0],
				[18, 28, 0.7, 0.4],
				[32, 8, 1.3, 0.8],
				[42, 36, 0.6, 1.2],
				[55, 18, 1.0, 0.2],
				[68, 42, 0.8, 1.6],
				[78, 14, 1.2, 0.6],
				[88, 32, 0.7, 1.1],
				[12, 58, 0.9, 1.4],
				[26, 72, 1.1, 0.3],
				[38, 62, 0.6, 0.9],
				[48, 78, 1.0, 1.8],
				[62, 68, 0.8, 0.5],
				[74, 82, 1.2, 1.3],
				[86, 56, 0.7, 0.7],
				[94, 74, 0.9, 1.5],
				[6, 88, 0.6, 0.1],
				[22, 48, 1.0, 1.9],
				[52, 52, 0.5, 0.55],
				[70, 24, 0.8, 1.7],
				[40, 22, 0.6, 2.1],
				[16, 40, 0.9, 0.95],
				[84, 88, 1.1, 1.25],
				[58, 8, 0.7, 2.4],
			] as Array<[number, number, number, number]>,
		[],
	);

	return (
		<div className='tdc-gs-backdrop' aria-hidden='true'>
			<div className='tdc-gs-backdrop__nebula tdc-gs-backdrop__nebula--a' />
			<div className='tdc-gs-backdrop__nebula tdc-gs-backdrop__nebula--b' />
			<div className='tdc-gs-backdrop__haze' />
			<div className='tdc-gs-backdrop__stars'>
				{stars.map(([x, y, r, delay], i) => (
					<span
						key={`${x}-${y}-${i}`}
						className='tdc-gs-backdrop__star'
						style={
							{
								left: `${x}%`,
								top: `${y}%`,
								width: `${r * 0.34}em`,
								height: `${r * 0.34}em`,
								'--gs-star-delay': `${delay}s`,
							} as React.CSSProperties
						}
					/>
				))}
			</div>
			<div className='tdc-gs-backdrop__vignette' />
		</div>
	);
};

export default memo(GalaxySpiralBackdrop);

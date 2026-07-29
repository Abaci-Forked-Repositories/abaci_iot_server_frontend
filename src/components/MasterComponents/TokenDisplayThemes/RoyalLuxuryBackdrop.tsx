import React, { memo, useId } from 'react';

/** Decorative diamond lattice + gold intersection glints for Royal Luxury. */
const RoyalLuxuryBackdrop: React.FC = () => {
	const uid = useId().replace(/:/g, '');
	const dotsId = `tdc-rl-diamond-dots-${uid}`;
	const glintId = `tdc-rl-glint-${uid}`;

	return (
		<div className='tdc-rl-backdrop' aria-hidden='true'>
			<svg className='tdc-rl-backdrop__grid' viewBox='0 0 400 400' preserveAspectRatio='xMidYMid slice'>
				<defs>
					<pattern
						id={dotsId}
						width='56'
						height='56'
						patternUnits='userSpaceOnUse'
						patternTransform='rotate(45 28 28)'>
						<circle cx='0' cy='0' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='14' cy='0' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='28' cy='0' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='42' cy='0' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='56' cy='0' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='0' cy='56' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='14' cy='56' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='28' cy='56' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='42' cy='56' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='56' cy='56' r='1.15' fill='rgba(212, 175, 55, 0.55)' />
						<circle cx='0' cy='14' r='1.15' fill='rgba(212, 175, 55, 0.4)' />
						<circle cx='0' cy='28' r='1.15' fill='rgba(212, 175, 55, 0.4)' />
						<circle cx='0' cy='42' r='1.15' fill='rgba(212, 175, 55, 0.4)' />
						<circle cx='56' cy='14' r='1.15' fill='rgba(212, 175, 55, 0.4)' />
						<circle cx='56' cy='28' r='1.15' fill='rgba(212, 175, 55, 0.4)' />
						<circle cx='56' cy='42' r='1.15' fill='rgba(212, 175, 55, 0.4)' />
					</pattern>
					<radialGradient id={glintId} cx='50%' cy='50%' r='50%'>
						<stop offset='0%' stopColor='#fff4c4' stopOpacity='1' />
						<stop offset='35%' stopColor='#e8c96a' stopOpacity='0.95' />
						<stop offset='70%' stopColor='#b8860b' stopOpacity='0.35' />
						<stop offset='100%' stopColor='#b8860b' stopOpacity='0' />
					</radialGradient>
				</defs>
				{/* Oversized so diagonal loop never shows empty edges */}
				<g className='tdc-rl-backdrop__dots'>
					<rect x='-120' y='-120' width='640' height='640' fill={`url(#${dotsId})`} />
				</g>
				{[
					[56, 56],
					[168, 56],
					[280, 56],
					[112, 112],
					[224, 112],
					[336, 112],
					[56, 168],
					[168, 168],
					[280, 168],
					[112, 224],
					[224, 224],
					[336, 224],
					[56, 280],
					[168, 280],
					[280, 280],
					[112, 336],
					[224, 336],
				].map(([x, y], i) => (
					<g
						key={`${x}-${y}`}
						className='tdc-rl-backdrop__glint'
						style={{ animationDelay: `${0.18 + i * 0.045}s` }}
						transform={`translate(${x} ${y})`}>
						<circle r='7' fill={`url(#${glintId})`} opacity='0.85' />
						<path
							d='M0-5.5 L1.2-1.2 L5.5 0 L1.2 1.2 L0 5.5 L-1.2 1.2 L-5.5 0 L-1.2-1.2 Z'
							fill='#f5e6a3'
						/>
					</g>
				))}
			</svg>
			<div className='tdc-rl-backdrop__brush' />
			<div className='tdc-rl-backdrop__vignette' />
		</div>
	);
};

export default memo(RoyalLuxuryBackdrop);

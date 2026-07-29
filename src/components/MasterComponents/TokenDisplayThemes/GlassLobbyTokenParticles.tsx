import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface GlassLobbyTokenParticlesProps {
	/** Template editor — animate even when OS reduced-motion is on. */
	previewMode?: boolean;
	/** Particle count tuned for the stage grid behind all cards. */
	density?: 'stage';
}

interface ParticleSpec {
	left: number;
	sizeEm: number;
	driftPx: number;
	duration: number;
	delay: number;
}

/** >1 = faster rise (2 ≈ half the travel time). */
const PARTICLE_SPEED = 2;

const PARTICLE_SPECS: ParticleSpec[] = [
	{ left: 6, sizeEm: 0.95, driftPx: 14, duration: 38, delay: 6 },
	{ left: 16, sizeEm: 0.72, driftPx: -11, duration: 44, delay: 18 },
	{ left: 26, sizeEm: 0.88, driftPx: 10, duration: 40, delay: 28 },
	{ left: 36, sizeEm: 0.68, driftPx: -13, duration: 48, delay: 4 },
	{ left: 46, sizeEm: 1, driftPx: 12, duration: 42, delay: 34 },
	{ left: 54, sizeEm: 0.76, driftPx: -9, duration: 46, delay: 14 },
	{ left: 62, sizeEm: 0.9, driftPx: 11, duration: 39, delay: 24 },
	{ left: 72, sizeEm: 0.7, driftPx: -14, duration: 50, delay: 10 },
	{ left: 82, sizeEm: 0.86, driftPx: 9, duration: 43, delay: 36 },
	{ left: 92, sizeEm: 0.64, driftPx: -10, duration: 47, delay: 20 },
	{ left: 11, sizeEm: 0.82, driftPx: 15, duration: 41, delay: 40 },
	{ left: 33, sizeEm: 0.74, driftPx: -7, duration: 45, delay: 2 },
	{ left: 49, sizeEm: 0.92, driftPx: 11, duration: 37, delay: 30 },
	{ left: 58, sizeEm: 0.66, driftPx: -12, duration: 49, delay: 16 },
	{ left: 77, sizeEm: 0.98, driftPx: 13, duration: 40, delay: 8 },
	{ left: 88, sizeEm: 0.78, driftPx: -8, duration: 46, delay: 26 },
];

const STAGE_PARTICLE_SPECS: ParticleSpec[] = [
	...PARTICLE_SPECS,
	...PARTICLE_SPECS.slice(0, 6).map((spec, index) => ({
		...spec,
		left: Math.min(94, spec.left + 3 + index),
		delay: (spec.delay + 9 + index * 4) % spec.duration,
		driftPx: spec.driftPx * (index % 2 === 0 ? 1.15 : -1.1),
	})),
];

const GlassLobbyTokenParticles: React.FC<GlassLobbyTokenParticlesProps> = ({
	previewMode = false,
	density = 'stage',
}) => {
	const reduceMotion = useReducedMotion();
	const shouldAnimate = previewMode || !reduceMotion;
	const rootRef = useRef<HTMLDivElement>(null);
	const [travel, setTravel] = useState(0);

	useLayoutEffect(() => {
		const el = rootRef.current;
		if (!el) return undefined;

		const sync = () => {
			const h = el.clientHeight;
			if (h > 0) setTravel(h);
		};

		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const yStart = travel * 1.06;
	const yEnd = travel * -0.12;
	const specs = density === 'stage' ? STAGE_PARTICLE_SPECS : PARTICLE_SPECS;

	return (
		<div ref={rootRef} className='tdc-gl-stage__particles' aria-hidden='true'>
			{specs.map((spec, index) => (
				<motion.span
					key={index}
					className='tdc-gl-stage__particle'
					style={{
						left: `${spec.left}%`,
						width: `${spec.sizeEm}em`,
						height: `${spec.sizeEm}em`,
						marginLeft: `${-spec.sizeEm / 2}em`,
					}}
					initial={false}
					animate={
						shouldAnimate && travel > 0
							? {
									y: [yStart, yStart * 0.78, yStart * 0.48, yStart * 0.18, yEnd],
									x: [0, spec.driftPx, spec.driftPx * 0.35, -spec.driftPx * 0.45, 0],
									opacity: [0, 1, 1, 1, 0],
								}
							: {
									y: travel * (0.18 + (index % 6) * 0.12),
									x: 0,
									opacity: 0.75,
								}
					}
					transition={
						shouldAnimate && travel > 0
							? {
									duration: spec.duration / PARTICLE_SPEED,
									repeat: Infinity,
									ease: 'linear',
									delay: -spec.delay / PARTICLE_SPEED,
									times: [0, 0.12, 0.5, 0.88, 1],
								}
							: { duration: 0 }
					}
				/>
			))}
		</div>
	);
};

export default GlassLobbyTokenParticles;

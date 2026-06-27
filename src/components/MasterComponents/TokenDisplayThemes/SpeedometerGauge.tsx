import React, { useEffect, useId, useMemo, useRef, useState, memo } from 'react';

export interface SpeedometerGaugeProps {
	/** Token string — needle angle is derived from numeric digits. */
	token: string;
	className?: string;
}

const CX = 100;
const CY = 100;
const R_OUTER = 88;
const R_INNER = 72;
/** Outer rim track — car orbits at this radius. */
const R_RIM = R_OUTER + 4;

const RIM_ORBIT_PERIOD_S = 14;

/** Map token digits to 0–100 for needle position. */
function tokenToPercent(token: string): number {
	const digits = token.replace(/\D/g, '');
	if (!digits) return 0;
	const num = parseInt(digits, 10);
	if (!Number.isFinite(num)) return 0;
	return Math.min(100, num % 101);
}

/** Speedometer arc: 225° → 495° (270° sweep, bottom-left to bottom-right). */
function percentToAngle(percent: number): number {
	return 225 + (percent / 100) * 270;
}

function polar(cx: number, cy: number, r: number, deg: number) {
	const rad = ((deg - 90) * Math.PI) / 180;
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
	const start = polar(cx, cy, r, startDeg);
	const end = polar(cx, cy, r, endDeg);
	const large = endDeg - startDeg > 180 ? 1 : 0;
	return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

const MAJOR_TICKS = [0, 20, 40, 60, 80, 100];

/** Side-view car — drawn facing +X; aligns with clockwise rim tangent when orbiting. */
const RimCarIcon: React.FC = () => (
	<g className='tdc-cs-gauge__car' transform='translate(-7, -3.4)'>
		<path
			className='tdc-cs-gauge__car-body'
			d='M0 3.2 L2.2 1.2 L4.5 0.6 L9.5 0.6 L12.2 1.4 L14 3.2 L14 5.2 L12.4 6.2 L2.2 6.2 L0 5.2 Z'
		/>
		<path
			className='tdc-cs-gauge__car-cabin'
			d='M4.2 1.8 L9.8 1.8 L11.2 3.2 L2.8 3.2 Z'
		/>
		<circle className='tdc-cs-gauge__car-wheel' cx='3.4' cy='6.2' r='1.1' />
		<circle className='tdc-cs-gauge__car-wheel' cx='11.2' cy='6.2' r='1.1' />
		<circle className='tdc-cs-gauge__car-headlight' cx='13.4' cy='3.4' r='0.55' />
	</g>
);

const RIM_ORBIT_PERIOD_MS = RIM_ORBIT_PERIOD_S * 1000;

/** Isolated orbit layer — memo + rAF so parent re-renders never reset the transform. */
const RimCarOrbit = memo(function RimCarOrbit({ glowFilterId }: { glowFilterId: string }) {
	const armRef = useRef<SVGGElement>(null);

	useEffect(() => {
		const arm = armRef.current;
		if (!arm) return undefined;

		let raf = 0;
		const start = performance.now();

		const tick = (now: number) => {
			const angle =
				(((now - start) % RIM_ORBIT_PERIOD_MS) / RIM_ORBIT_PERIOD_MS) * 360;
			arm.setAttribute('transform', `rotate(${angle} ${CX} ${CY})`);
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<g className='tdc-cs-gauge__rim-orbit'>
			<g ref={armRef}>
				{/*
				 * Centre-relative rim offset — parent arm rotates around (CX, CY).
				 * Car faces +X; as the arm spins, heading stays tangent to the path.
				 */}
				<g transform={`translate(${CX}, ${CY - R_RIM})`} filter={`url(#${glowFilterId})`}>
					<RimCarIcon />
				</g>
			</g>
		</g>
	);
});

const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({ token, className = '' }) => {
	const skipAnimRef = useRef(true);
	const [needleAngle, setNeedleAngle] = useState(() => percentToAngle(tokenToPercent(token)));
	const [sweeping, setSweeping] = useState(false);

	const uid = useId().replace(/:/g, '');
	const carGlowFilterId = `tdc-cs-car-glow-${uid}`;
	const needleGlowFilterId = `tdc-cs-needle-glow-${uid}`;
	const gaugeFaceGradientId = `tdc-cs-gauge-face-${uid}`;

	const targetAngle = useMemo(() => percentToAngle(tokenToPercent(token)), [token]);

	useEffect(() => {
		if (skipAnimRef.current) {
			skipAnimRef.current = false;
			setNeedleAngle(targetAngle);
			return;
		}
		setSweeping(true);
		setNeedleAngle(targetAngle);
	}, [targetAngle]);

	const ticks = useMemo(() => {
		const items: React.ReactNode[] = [];
		for (let i = 0; i <= 100; i += 5) {
			const isMajor = i % 20 === 0;
			const angle = percentToAngle(i);
			const outer = polar(CX, CY, R_OUTER, angle);
			const inner = polar(CX, CY, isMajor ? R_INNER - 6 : R_INNER, angle);
			items.push(
				<line
					key={`tick-${i}`}
					x1={inner.x}
					y1={inner.y}
					x2={outer.x}
					y2={outer.y}
					className={isMajor ? 'tdc-cs-gauge__tick tdc-cs-gauge__tick--major' : 'tdc-cs-gauge__tick'}
				/>,
			);
		}
		return items;
	}, []);

	const labels = useMemo(
		() =>
			MAJOR_TICKS.map((val) => {
				const angle = percentToAngle(val);
				const pos = polar(CX, CY, R_INNER - 16, angle);
				return (
					<text
						key={`label-${val}`}
						x={pos.x}
						y={pos.y}
						className='tdc-cs-gauge__label'
						textAnchor='middle'
						dominantBaseline='middle'>
						{val}
					</text>
				);
			}),
		[],
	);

	return (
		<svg
			className={['tdc-cs-gauge', sweeping ? 'tdc-cs-gauge--sweep' : '', className]
				.filter(Boolean)
				.join(' ')}
			viewBox='0 0 200 200'
			aria-hidden='true'
			focusable='false'
			onTransitionEnd={() => setSweeping(false)}>
			<defs>
				<filter id={needleGlowFilterId} x='-50%' y='-50%' width='200%' height='200%'>
					<feGaussianBlur stdDeviation='2' result='blur' />
					<feMerge>
						<feMergeNode in='blur' />
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
				<radialGradient id={gaugeFaceGradientId} cx='50%' cy='50%' r='50%'>
					<stop offset='0%' stopColor='#0a0a0a' />
					<stop offset='85%' stopColor='#000000' />
					<stop offset='100%' stopColor='#111111' />
				</radialGradient>
				<filter id={carGlowFilterId} x='-80%' y='-80%' width='260%' height='260%'>
					<feGaussianBlur stdDeviation='1.2' result='blur' />
					<feMerge>
						<feMergeNode in='blur' />
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
			</defs>

			<circle cx={CX} cy={CY} r={R_RIM} className='tdc-cs-gauge__rim' />

			<circle cx={CX} cy={CY} r={R_OUTER} fill={`url(#${gaugeFaceGradientId})`} />

			<path
				d={arcPath(CX, CY, R_OUTER - 2, 225, 495)}
				className='tdc-cs-gauge__arc'
				fill='none'
			/>

			{ticks}
			{labels}

			<text x={CX} y={CY - 28} className='tdc-cs-gauge__unit' textAnchor='middle'>
				TOKEN
			</text>

			<g
				className='tdc-cs-gauge__needle-group'
				style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
				<line
					x1={CX}
					y1={CY}
					x2={CX}
					y2={CY - (R_INNER - 10)}
					className='tdc-cs-gauge__needle'
					filter={`url(#${needleGlowFilterId})`}
				/>
			</g>

			<circle cx={CX} cy={CY} r={5} className='tdc-cs-gauge__hub' />
			<circle cx={CX} cy={CY} r={2.5} className='tdc-cs-gauge__hub-core' />

			{/* Fuel-style status sub-gauge */}
			<path
				d={arcPath(CX, CY + 18, 22, 200, 340)}
				className='tdc-cs-gauge__sub-arc'
				fill='none'
			/>
			<text x={CX - 18} y={CY + 32} className='tdc-cs-gauge__sub-label'>
				0
			</text>
			<text x={CX} y={CY + 36} className='tdc-cs-gauge__sub-label'>
				½
			</text>
			<text x={CX + 18} y={CY + 32} className='tdc-cs-gauge__sub-label'>
				1
			</text>

			<RimCarOrbit glowFilterId={carGlowFilterId} />
		</svg>
	);
};

export default memo(SpeedometerGauge);

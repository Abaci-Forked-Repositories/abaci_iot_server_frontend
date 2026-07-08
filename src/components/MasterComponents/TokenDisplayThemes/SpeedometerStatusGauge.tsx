import React, { memo, useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SpeedometerStatusGaugeProps {
	statusModifier: string;
	statusLabel: string;
	className?: string;
}

const CX = 50;
const CY = 46;
const R_OUTER = 38;
const R_INNER = 28;
const ARC_START_DEG = 205;
const ARC_END_DEG = 335;
const WAITING_ANGLE = ARC_START_DEG;
const SERVING_ANGLE = ARC_END_DEG;
/** viewBox must include full arc geometry (arc extends to ~y=84). */
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 90;

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

function statusToAngle(statusModifier: string): number {
	return statusModifier === 'serving' ? SERVING_ANGLE : WAITING_ANGLE;
}

const SpeedometerStatusGauge: React.FC<SpeedometerStatusGaugeProps> = ({
	statusModifier,
	statusLabel,
	className = '',
}) => {
	const skipAnimRef = useRef(true);
	const uid = useId().replace(/:/g, '');
	const waitingGlowId = `tdc-cs-status-wait-${uid}`;
	const servingGlowId = `tdc-cs-status-serve-${uid}`;

	const targetAngle = useMemo(() => statusToAngle(statusModifier), [statusModifier]);
	const [needleAngle, setNeedleAngle] = useState(targetAngle);
	const [isSweeping, setIsSweeping] = useState(false);

	useEffect(() => {
		setNeedleAngle(targetAngle);

		if (skipAnimRef.current) {
			skipAnimRef.current = false;
			return undefined;
		}

		setIsSweeping(true);
		const timer = setTimeout(() => setIsSweeping(false), 720);
		return () => clearTimeout(timer);
	}, [targetAngle]);

	const midAngle = (ARC_START_DEG + ARC_END_DEG) / 2;
	const waitingLabelPos = polar(CX, CY, R_INNER - 10, ARC_START_DEG + 8);
	const servingLabelPos = polar(CX, CY, R_INNER - 10, ARC_END_DEG - 8);

	return (
		<div
			className={['tdc-cs-status-gauge', className].filter(Boolean).join(' ')}
			role='img'
			aria-live='polite'
			aria-label={`Status: ${statusLabel}`}>
			<svg
				className={[
					'tdc-cs-status-gauge__svg',
					isSweeping ? 'tdc-cs-status-gauge__svg--sweep' : '',
					`tdc-cs-status-gauge__svg--${statusModifier === 'serving' ? 'serving' : 'waiting'}`,
				]
					.filter(Boolean)
					.join(' ')}
				viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
				preserveAspectRatio='xMidYMid meet'
				aria-hidden='true'
				focusable='false'>
				<defs>
					<filter id={waitingGlowId} x='-40%' y='-40%' width='180%' height='180%'>
						<feGaussianBlur stdDeviation='1.4' result='blur' />
						<feMerge>
							<feMergeNode in='blur' />
							<feMergeNode in='SourceGraphic' />
						</feMerge>
					</filter>
					<filter id={servingGlowId} x='-40%' y='-40%' width='180%' height='180%'>
						<feGaussianBlur stdDeviation='1.4' result='blur' />
						<feMerge>
							<feMergeNode in='blur' />
							<feMergeNode in='SourceGraphic' />
						</feMerge>
					</filter>
				</defs>

				<path
					d={arcPath(CX, CY, R_OUTER, ARC_START_DEG, midAngle)}
					className='tdc-cs-status-gauge__zone tdc-cs-status-gauge__zone--waiting'
					fill='none'
				/>
				<path
					d={arcPath(CX, CY, R_OUTER, midAngle, ARC_END_DEG)}
					className='tdc-cs-status-gauge__zone tdc-cs-status-gauge__zone--serving'
					fill='none'
				/>

				<path
					d={arcPath(CX, CY, R_OUTER - 1, ARC_START_DEG, ARC_END_DEG)}
					className='tdc-cs-status-gauge__rim'
					fill='none'
				/>

				<circle cx={CX} cy={CY} r={R_OUTER - 6} className='tdc-cs-status-gauge__face' />

				{[ARC_START_DEG, midAngle, ARC_END_DEG].map((angle) => {
					const outer = polar(CX, CY, R_OUTER, angle);
					const inner = polar(CX, CY, R_INNER, angle);
					const isMajor = angle === ARC_START_DEG || angle === ARC_END_DEG;
					return (
						<line
							key={`tick-${angle}`}
							x1={inner.x}
							y1={inner.y}
							x2={outer.x}
							y2={outer.y}
							className={
								isMajor
									? 'tdc-cs-status-gauge__tick tdc-cs-status-gauge__tick--major'
									: 'tdc-cs-status-gauge__tick'
							}
						/>
					);
				})}

				<text
					x={waitingLabelPos.x}
					y={waitingLabelPos.y}
					className='tdc-cs-status-gauge__label tdc-cs-status-gauge__label--waiting'
					textAnchor='middle'
					dominantBaseline='middle'
					filter={`url(#${waitingGlowId})`}>
					WAIT
				</text>
				<text
					x={servingLabelPos.x}
					y={servingLabelPos.y}
					className='tdc-cs-status-gauge__label tdc-cs-status-gauge__label--serving'
					textAnchor='middle'
					dominantBaseline='middle'
					filter={`url(#${servingGlowId})`}>
					SERVE
				</text>

				<circle cx={CX} cy={CY} r={3.2} className='tdc-cs-status-gauge__hub' />

				<g
					className='tdc-cs-status-gauge__needle-group'
					style={{
						transform: `rotate(${needleAngle}deg)`,
						transformOrigin: `${CX}px ${CY}px`,
					}}>
					<line
						x1={CX}
						y1={CY}
						x2={CX}
						y2={CY - (R_INNER - 4)}
						className='tdc-cs-status-gauge__needle'
					/>
				</g>
			</svg>
		</div>
	);
};

export default memo(SpeedometerStatusGauge);

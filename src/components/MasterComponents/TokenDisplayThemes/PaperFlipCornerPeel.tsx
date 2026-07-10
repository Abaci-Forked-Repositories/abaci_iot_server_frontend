import React, { useEffect, useRef, useState } from 'react';
import { PaperFlipPageFace, type PageSnapshot } from './paperFlipPageFace';
import {
	cornerPageTurnTransform,
	PAPER_FLIP_PEEL_MS,
} from './paperFlipPeelGeometry';

export interface PaperFlipCornerPeelProps {
	from: PageSnapshot;
	to: PageSnapshot;
	flipSeq: number;
	onComplete: () => void;
}

const PaperFlipCornerPeel: React.FC<PaperFlipCornerPeelProps> = ({
	from,
	to,
	flipSeq,
	onComplete,
}) => {
	const rafRef = useRef<number | null>(null);
	const [rawProgress, setRawProgress] = useState(0);

	useEffect(() => {
		let cancelled = false;
		setRawProgress(0);
		const start = performance.now();

		const tick = (now: number) => {
			if (cancelled) return;
			const raw = Math.min(1, (now - start) / PAPER_FLIP_PEEL_MS);
			setRawProgress(raw);
			if (raw < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				onComplete();
			}
		};

		rafRef.current = requestAnimationFrame(tick);

		return () => {
			cancelled = true;
			if (rafRef.current != null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [flipSeq, onComplete]);

	const { rotateX, rotateY, rotateZ, translateZ } =
		cornerPageTurnTransform(rawProgress);
	const lift = Math.pow(rawProgress, 0.85);

	return (
		<>
			<div className='tdc-pf-page tdc-pf-page--base tdc-pf-page--under'>
				<PaperFlipPageFace data={to} side='front' />
			</div>

			<div className='tdc-pf-page tdc-pf-page--over-flip'>
				<div
					className='tdc-pf-page--over-flip__panel'
					style={{
						transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateZ(${translateZ}px)`,
					}}>
					<div className='tdc-pf-page--over-flip__face tdc-pf-page--over-flip__face--front'>
						<PaperFlipPageFace data={from} side='front' />
					</div>
					<div className='tdc-pf-page--over-flip__face tdc-pf-page--over-flip__face--back'>
						<PaperFlipPageFace data={from} side='back' />
					</div>
				</div>
				<div
					className='tdc-pf-page--over-flip__edge-shadow'
					style={{ opacity: Math.min(0.55, lift * 0.5) }}
					aria-hidden='true'
				/>
			</div>
		</>
	);
};

export default PaperFlipCornerPeel;

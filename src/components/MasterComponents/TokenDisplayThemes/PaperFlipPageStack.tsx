import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PaperFlipClock from './PaperFlipClock';

export interface PaperFlipPageStackProps {
	token: string;
	queueName?: string;
	subtitle?: string;
	statusLabel: string;
	statusModifier: string;
	className?: string;
	/** Template editor preview — always animate even when OS reduced-motion is on. */
	previewMode?: boolean;
}

interface PageSnapshot {
	token: string;
	queueName?: string;
	subtitle?: string;
	statusLabel: string;
	statusModifier: string;
}

interface FlipState {
	from: PageSnapshot;
	to: PageSnapshot;
}

const FLIP_MS = 1050;
const FLIP_EASE = [0.42, 0, 0.22, 1] as const;
const FLIP_TIMES = [0, 0.1, 0.3, 0.58, 0.82, 1] as const;
const FLIP_PERSPECTIVE_PX = 1500;

/**
 * Top-right hinge — peel OUTWARD over the new page (not tuck behind it).
 * Corner lifts toward viewer first (on top), then sweeps left and away.
 */
const PEEL_MOTION = {
	rotateX: [0, 0, 10, 16, -8, -32],
	rotateY: [0, 0, -8, -22, -38, -54],
	z: [2, 2, 8, 16, 10, 2],
	opacity: [1, 1, 1, 1, 0.94, 0],
} as const;

const SHADOW_MOTION = {
	opacity: [0, 0, 0.22, 0.58, 0.42, 0],
	scaleX: [0.08, 0.08, 0.28, 0.62, 0.82, 0.55],
	scaleY: [0.06, 0.06, 0.22, 0.58, 0.78, 0.48],
} as const;

const FOLD_SHADE_MOTION = {
	opacity: [0, 0, 0.18, 0.42, 0.32, 0],
} as const;

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldAnimate(previewMode?: boolean): boolean {
	if (previewMode) return true;
	return !prefersReducedMotion();
}

function peelTransform({
	rotateX,
	rotateY,
	z,
}: {
	rotateX: string | number;
	rotateY: string | number;
	z: string | number;
}): string {
	const rx = typeof rotateX === 'number' ? `${rotateX}deg` : rotateX;
	const ry = typeof rotateY === 'number' ? `${rotateY}deg` : rotateY;
	const tz = typeof z === 'number' ? `${z}px` : z;
	return `perspective(${FLIP_PERSPECTIVE_PX}px) translateZ(${tz}) rotateX(${rx}) rotateY(${ry})`;
}

function PaperFlipPageFace({
	data,
	side,
}: {
	data: PageSnapshot;
	side: 'front' | 'back';
}) {
	if (side === 'back') {
		return (
			<div className='tdc-pf-page__back' aria-hidden='true'>
				<div className='tdc-pf-page__back-texture' />
			</div>
		);
	}

	return (
		<div className='tdc-pf-page__front'>
			<header className='tdc-pf-page__header'>
				{data.queueName ? (
					<span className='tdc-pf-page__queue'>{data.queueName}</span>
				) : (
					<span className='tdc-pf-page__queue tdc-pf-page__queue--empty' aria-hidden='true' />
				)}
				{data.subtitle ? (
					<span className='tdc-pf-page__subtitle'>{data.subtitle}</span>
				) : null}
			</header>

			<div className='tdc-pf-page__token-wrap'>
				<PaperFlipClock />
				<span className='tdc-pf-page__token'>{data.token}</span>
			</div>

			<footer className='tdc-pf-page__footer'>
				<span
					className={[
						'tdc-pf-page__status',
						`tdc-pf-page__status--${data.statusModifier}`,
					].join(' ')}>
					<span className='tdc-pf-page__status-dot' aria-hidden='true' />
					<span className='tdc-pf-page__status-label'>{data.statusLabel}</span>
				</span>
			</footer>
		</div>
	);
}

const PaperFlipPageStack: React.FC<PaperFlipPageStackProps> = ({
	token,
	queueName,
	subtitle,
	statusLabel,
	statusModifier,
	className = '',
	previewMode = false,
}) => {
	const snapshot = React.useMemo<PageSnapshot>(
		() => ({
			token,
			queueName,
			subtitle,
			statusLabel,
			statusModifier,
		}),
		[token, queueName, subtitle, statusLabel, statusModifier],
	);

	const mountedRef = useRef(false);
	const pendingSnapshotRef = useRef<PageSnapshot | null>(null);
	const flipRef = useRef<FlipState | null>(null);
	const displayedRef = useRef(snapshot);
	const finishTimerRef = useRef<number | null>(null);
	const flipRunRef = useRef(0);

	const [displayed, setDisplayed] = useState(snapshot);
	const [flip, setFlip] = useState<FlipState | null>(null);
	const [flipSeq, setFlipSeq] = useState(0);

	flipRef.current = flip;

	const clearFinishTimer = useCallback(() => {
		if (finishTimerRef.current != null) {
			window.clearTimeout(finishTimerRef.current);
			finishTimerRef.current = null;
		}
	}, []);

	const completeFlip = useCallback(() => {
		clearFinishTimer();

		const current = flipRef.current;
		if (!current) return;

		displayedRef.current = current.to;
		setDisplayed(current.to);

		const pending = pendingSnapshotRef.current;
		pendingSnapshotRef.current = null;

		if (pending && pending.token !== current.to.token) {
			flipRunRef.current += 1;
			setFlipSeq((seq) => seq + 1);
			setFlip({ from: current.to, to: pending });
			return;
		}

		setFlip(null);
	}, [clearFinishTimer]);

	const scheduleFinishFallback = useCallback(() => {
		clearFinishTimer();
		finishTimerRef.current = window.setTimeout(completeFlip, FLIP_MS + 120);
	}, [clearFinishTimer, completeFlip]);

	const beginFlip = useCallback((from: PageSnapshot, to: PageSnapshot) => {
		flipRunRef.current += 1;
		setFlipSeq((seq) => seq + 1);
		setFlip({ from, to });
	}, []);

	useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		if (token === displayedRef.current.token) {
			if (flipRef.current) {
				if (token !== flipRef.current.to.token) {
					pendingSnapshotRef.current = snapshot;
				}
				return;
			}
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		if (flipRef.current) {
			pendingSnapshotRef.current = snapshot;
			return;
		}

		if (!shouldAnimate(previewMode)) {
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		beginFlip(displayedRef.current, snapshot);
	}, [token, snapshot, previewMode, beginFlip]);

	useEffect(() => () => clearFinishTimer(), [clearFinishTimer]);

	const surfacePage = flip?.to ?? displayed;
	const ariaToken = flip?.to.token ?? displayed.token;
	const activeFlipRun = flipRunRef.current;

	const handleFlipComplete = useCallback(() => {
		if (!flipRef.current) return;
		completeFlip();
	}, [completeFlip]);

	const flipTransition = {
		duration: FLIP_MS / 1000,
		ease: FLIP_EASE,
		times: [...FLIP_TIMES],
	};

	return (
		<div
			className={['tdc-pf-book', className].filter(Boolean).join(' ')}
			aria-live='polite'
			aria-label={`Token ${ariaToken}`}>
			<div className='tdc-pf-book__desk' aria-hidden='true' />
			<div className='tdc-pf-book__stack'>
				<div
					className={[
						'tdc-pf-stage',
						flip ? 'tdc-pf-stage--flipping' : '',
					]
						.filter(Boolean)
						.join(' ')}>
					{/* Base page — always present, never transformed (new token during flip) */}
					<div className='tdc-pf-page tdc-pf-page--base tdc-pf-page--surface'>
						<PaperFlipPageFace data={surfacePage} side='front' />
					</div>

					{flip ? (
						<div className='tdc-pf-peel-layer'>
							<motion.div
								key={`shadow-${flipSeq}-${activeFlipRun}`}
								className='tdc-pf-page__cast-shadow'
								aria-hidden='true'
								style={{ transformOrigin: '100% 0%' }}
								initial={{
									opacity: SHADOW_MOTION.opacity[0],
									scaleX: SHADOW_MOTION.scaleX[0],
									scaleY: SHADOW_MOTION.scaleY[0],
								}}
								animate={{
									opacity: [...SHADOW_MOTION.opacity],
									scaleX: [...SHADOW_MOTION.scaleX],
									scaleY: [...SHADOW_MOTION.scaleY],
								}}
								transition={flipTransition}
							/>

							<motion.div
								key={`hinge-${flipSeq}-${activeFlipRun}`}
								className='tdc-pf-page__hinge'
								style={{
									transformOrigin: '100% 0%',
									transformStyle: 'preserve-3d',
								}}
								initial={{
									rotateX: PEEL_MOTION.rotateX[0],
									rotateY: PEEL_MOTION.rotateY[0],
									z: PEEL_MOTION.z[0],
									opacity: PEEL_MOTION.opacity[0],
								}}
								animate={{
									rotateX: [...PEEL_MOTION.rotateX],
									rotateY: [...PEEL_MOTION.rotateY],
									z: [...PEEL_MOTION.z],
									opacity: [...PEEL_MOTION.opacity],
								}}
								transition={flipTransition}
								transformTemplate={peelTransform}
								onAnimationStart={scheduleFinishFallback}
								onAnimationComplete={handleFlipComplete}>
								<div className='tdc-pf-page__leaf tdc-pf-page--base tdc-pf-page--peel-chrome'>
									<PaperFlipPageFace data={flip.from} side='front' />
									<PaperFlipPageFace data={flip.from} side='back' />
									<div className='tdc-pf-page__edge' aria-hidden='true' />
								</div>
								<motion.div
									className='tdc-pf-page__fold-shade'
									aria-hidden='true'
									initial={{ opacity: FOLD_SHADE_MOTION.opacity[0] }}
									animate={{ opacity: [...FOLD_SHADE_MOTION.opacity] }}
									transition={flipTransition}
								/>
							</motion.div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default PaperFlipPageStack;

export { FLIP_MS as PAPER_FLIP_ANIMATION_MS };

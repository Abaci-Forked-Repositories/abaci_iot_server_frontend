import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FLIP_MS = 700;
const FLIP_EASE = [0.34, 1.12, 0.48, 1] as const;
// Snap 90°→180° in the 48–52% window so the back face appears before edge-on gap
const FLIP_TIMES = [0, 0.12, 0.48, 0.52, 0.88, 0.94, 1] as const;

const FLIP_TRANSITION = {
	duration: FLIP_MS / 1000,
	times: [...FLIP_TIMES],
	ease: FLIP_EASE,
} as const;

export interface GlassLobbyTokenProps {
	value: string;
	className?: string;
	/** Template editor preview — animate even when OS reduced-motion is on. */
	previewMode?: boolean;
}

interface FlipState {
	from: string;
	to: string;
	seq: number;
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldAnimate(previewMode?: boolean): boolean {
	if (previewMode) return true;
	return !prefersReducedMotion();
}

interface HeroFlipProps {
	flip: FlipState;
	digitClass: string;
	onComplete: () => void;
}

/**
 * Single-card page flip: one rotator + front/back faces (backface-hidden).
 * Opacity cross-fades were removed — they caused a blank gap at ±90° edge-on.
 */
const HeroFlip: React.FC<HeroFlipProps> = ({ flip, digitClass, onComplete }) => (
	<div className='tdc-gl-token-hero__stage'>
		<motion.div
			key={flip.seq}
			className='tdc-gl-token-hero__flip'
			style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
			initial={{ rotateX: 0, scale: 1 }}
			animate={{
				rotateX: [0, 0, 90, 180, 180, 180, 180],
				scale: [1, 0.9, 0.9, 0.9, 1, 1.03, 1],
			}}
			transition={FLIP_TRANSITION}
			onAnimationComplete={onComplete}>
			<div className='tdc-gl-token-hero__face tdc-gl-token-hero__face--front'>
				<span className={digitClass} aria-hidden='true'>
					{flip.from}
				</span>
			</div>
			<div className='tdc-gl-token-hero__face tdc-gl-token-hero__face--back'>
				<span className={digitClass}>{flip.to}</span>
			</div>
		</motion.div>
	</div>
);

const GlassLobbyToken: React.FC<GlassLobbyTokenProps> = ({
	value,
	className = '',
	previewMode = false,
}) => {
	const mountedRef = useRef(false);
	const displayedRef = useRef(value);
	const flipRef = useRef<FlipState | null>(null);
	const pendingRef = useRef<string | null>(null);
	const finishTimerRef = useRef<number | null>(null);
	const flipSeqRef = useRef(0);

	const [displayed, setDisplayed] = useState(value);
	const [flip, setFlip] = useState<FlipState | null>(null);

	flipRef.current = flip;

	const clearFinishTimer = useCallback(() => {
		if (finishTimerRef.current != null) {
			window.clearTimeout(finishTimerRef.current);
			finishTimerRef.current = null;
		}
	}, []);

	const beginFlip = useCallback((from: string, to: string) => {
		flipSeqRef.current += 1;
		setFlip({ from, to, seq: flipSeqRef.current });
	}, []);

	const completeFlip = useCallback(() => {
		clearFinishTimer();

		const current = flipRef.current;
		if (!current) return;

		displayedRef.current = current.to;
		setDisplayed(current.to);

		const pending = pendingRef.current;
		pendingRef.current = null;

		if (pending && pending !== current.to) {
			beginFlip(current.to, pending);
			return;
		}

		setFlip(null);
	}, [beginFlip, clearFinishTimer]);

	const scheduleFinishFallback = useCallback(() => {
		clearFinishTimer();
		finishTimerRef.current = window.setTimeout(completeFlip, FLIP_MS + 120);
	}, [clearFinishTimer, completeFlip]);

	useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			displayedRef.current = value;
			setDisplayed(value);
			return;
		}

		if (value === displayedRef.current) {
			if (flipRef.current && value !== flipRef.current.to) {
				pendingRef.current = value;
			}
			return;
		}

		if (flipRef.current) {
			pendingRef.current = value;
			return;
		}

		if (!shouldAnimate(previewMode)) {
			displayedRef.current = value;
			setDisplayed(value);
			return;
		}

		beginFlip(displayedRef.current, value);
	}, [value, previewMode, beginFlip]);

	useEffect(() => {
		if (flip) scheduleFinishFallback();
	}, [flip, scheduleFinishFallback]);

	useEffect(() => () => clearFinishTimer(), [clearFinishTimer]);

	const handleFlipComplete = useCallback(() => {
		completeFlip();
	}, [completeFlip]);

	const digitClass = ['tdc-gl-token', 'tdc-gl-token-hero__digit', className]
		.filter(Boolean)
		.join(' ');

	if (flip) {
		return (
			<span className='tdc-gl-token-hero' aria-label={flip.to}>
				<HeroFlip flip={flip} digitClass={digitClass} onComplete={handleFlipComplete} />
				<span className='tdc-gl-token-hero__glow' aria-hidden='true' />
			</span>
		);
	}

	return <span className={['tdc-gl-token', className].filter(Boolean).join(' ')}>{displayed}</span>;
};

export default GlassLobbyToken;

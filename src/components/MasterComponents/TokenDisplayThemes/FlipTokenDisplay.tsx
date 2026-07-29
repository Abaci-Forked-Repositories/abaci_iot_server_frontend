import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface FlipTokenDisplayProps {
	value: string;
	className?: string;
}

const FLIP_PHASE_MS = 450;
const FLIP_FALLBACK_MS = FLIP_PHASE_MS * 2 + 120;

type FlipPhase = 'idle' | 'top' | 'bottom';

function FlipDigit({ char }: { char: string }) {
	const [shown, setShown] = useState(char);
	const [prev, setPrev] = useState<string | null>(null);
	const [next, setNext] = useState<string | null>(null);
	const [phase, setPhase] = useState<FlipPhase>('idle');
	const skipFlipRef = useRef(true);
	const pendingCharRef = useRef(char);

	const finishFlip = useCallback(() => {
		const nextChar = pendingCharRef.current;
		setShown(nextChar);
		setPhase('idle');
		setPrev(null);
		setNext(null);
	}, []);

	useEffect(() => {
		pendingCharRef.current = char;

		if (skipFlipRef.current) {
			skipFlipRef.current = false;
			setShown(char);
			return;
		}
		if (char === shown || phase !== 'idle') return;

		setPrev(shown);
		setNext(char);
		setPhase('top');
	}, [char, shown, phase]);

	useEffect(() => {
		if (phase === 'idle') return undefined;
		const fallback = window.setTimeout(finishFlip, FLIP_FALLBACK_MS);
		return () => window.clearTimeout(fallback);
	}, [phase, finishFlip]);

	const handleAnimationEnd = useCallback(
		(event: React.AnimationEvent<HTMLSpanElement>) => {
			if (!event.animationName.includes('digit-flip')) return;

			if (phase === 'top') {
				setPhase('bottom');
				return;
			}
			if (phase === 'bottom') {
				finishFlip();
			}
		},
		[phase, finishFlip],
	);

	const isAnimating = phase !== 'idle';
	const topStaticChar = isAnimating && next != null ? next : shown;
	const bottomStaticChar = isAnimating && prev != null ? prev : shown;

	return (
		<span
			className={[
				'flip-digit',
				isAnimating ? 'flip-digit--flipping' : '',
				phase === 'bottom' ? 'flip-digit--flipping-bottom' : '',
			]
				.filter(Boolean)
				.join(' ')}>
			<span className='flip-digit__top' aria-hidden='true'>
				<span className='flip-digit__text flip-digit__text--top'>{topStaticChar}</span>
			</span>
			<span className='flip-digit__bottom' aria-hidden='true'>
				<span className='flip-digit__text flip-digit__text--bottom'>
					{bottomStaticChar}
				</span>
			</span>
			{phase === 'top' && prev != null && (
				<span
					className='flip-digit__flip flip-digit__flip--top'
					aria-hidden='true'
					onAnimationEnd={handleAnimationEnd}>
					<span className='flip-digit__flip-front'>
						<span className='flip-digit__text flip-digit__text--top'>{prev}</span>
					</span>
				</span>
			)}
			{phase === 'bottom' && next != null && (
				<span
					className='flip-digit__flip flip-digit__flip--bottom'
					aria-hidden='true'
					onAnimationEnd={handleAnimationEnd}>
					<span className='flip-digit__flip-front'>
						<span className='flip-digit__text flip-digit__text--bottom'>{next}</span>
					</span>
				</span>
			)}
		</span>
	);
}

const FlipTokenDisplay: React.FC<FlipTokenDisplayProps> = ({ value, className = '' }) => {
	const chars = value.split('');

	return (
		<span className={`flip-token${className ? ` ${className}` : ''}`}>
			{chars.map((char, index) => (
				<FlipDigit key={index} char={char} />
			))}
		</span>
	);
};

export default FlipTokenDisplay;

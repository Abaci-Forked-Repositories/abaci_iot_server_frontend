import React, { useCallback, useEffect, useRef, useState } from 'react';
import MonoFlipClock from './MonoFlipClock';

export interface MonoFlipCardStackProps {
	token: string;
	queueName?: string;
	subtitle?: string;
	statusLabel: string;
	statusModifier: string;
	className?: string;
	/** Template editor preview — animate even when OS reduced-motion is on. */
	previewMode?: boolean;
}

type CardTone = 'light' | 'dark';
type FlipDirection = 'left' | 'right';

interface CardSnapshot {
	token: string;
	tone: CardTone;
}

interface FlipState {
	from: CardSnapshot;
	to: CardSnapshot;
	direction: FlipDirection;
}

const FLIP_MS = 780;

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldAnimate(previewMode?: boolean): boolean {
	if (previewMode) return true;
	return !prefersReducedMotion();
}

function nextTone(tone: CardTone): CardTone {
	return tone === 'light' ? 'dark' : 'light';
}

function flipDirectionForIndex(index: number): FlipDirection {
	return index % 2 === 0 ? 'left' : 'right';
}

function MonoFlipCardFace({
	data,
	side,
}: {
	data: CardSnapshot;
	side: 'front' | 'back';
}) {
	const toneClass = `tdc-mf-card__face--${data.tone}`;
	const isBack = side === 'back';

	return (
		<div
			className={[
				'tdc-mf-card__face',
				toneClass,
				isBack ? 'tdc-mf-card__face--back' : 'tdc-mf-card__face--front',
			]
				.filter(Boolean)
				.join(' ')}
			aria-hidden={isBack}>
			<div className='tdc-mf-card__grain' aria-hidden='true' />
			{/* <span className='tdc-mf-card__eyebrow'>Now Calling</span> */}
			<span className='tdc-mf-card__token'>{data.token}</span>
		</div>
	);
}

const MonoFlipCardStack: React.FC<MonoFlipCardStackProps> = ({
	token,
	queueName,
	subtitle,
	statusLabel,
	statusModifier,
	className = '',
	previewMode = false,
}) => {
	const initialSnapshot: CardSnapshot = { token, tone: 'light' };

	const mountedRef = useRef(false);
	const pendingSnapshotRef = useRef<CardSnapshot | null>(null);
	const flipRef = useRef<FlipState | null>(null);
	const displayedRef = useRef(initialSnapshot);
	const finishTimerRef = useRef<number | null>(null);
	const flipIndexRef = useRef(0);

	const [displayed, setDisplayed] = useState(initialSnapshot);
	const [flip, setFlip] = useState<FlipState | null>(null);

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
			const direction = flipDirectionForIndex(flipIndexRef.current);
			flipIndexRef.current += 1;
			setFlip({
				from: current.to,
				to: pending,
				direction,
			});
			return;
		}

		setFlip(null);
	}, [clearFinishTimer]);

	const scheduleFinishFallback = useCallback(() => {
		clearFinishTimer();
		finishTimerRef.current = window.setTimeout(completeFlip, FLIP_MS + 80);
	}, [clearFinishTimer, completeFlip]);

	const beginFlip = useCallback((from: CardSnapshot, to: CardSnapshot) => {
		const direction = flipDirectionForIndex(flipIndexRef.current);
		flipIndexRef.current += 1;
		setFlip({ from, to, direction });
	}, []);

	useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			const snapshot = { token, tone: 'light' as CardTone };
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		if (token === displayedRef.current.token) {
			if (flipRef.current) {
				if (token !== flipRef.current.to.token) {
					pendingSnapshotRef.current = {
						token,
						tone: nextTone(flipRef.current.to.tone),
					};
				}
				return;
			}
			displayedRef.current = { ...displayedRef.current, token };
			setDisplayed((prev) => ({ ...prev, token }));
			return;
		}

		const nextSnapshot: CardSnapshot = {
			token,
			tone: nextTone(displayedRef.current.tone),
		};

		if (flipRef.current) {
			pendingSnapshotRef.current = nextSnapshot;
			return;
		}

		if (!shouldAnimate(previewMode)) {
			displayedRef.current = nextSnapshot;
			setDisplayed(nextSnapshot);
			return;
		}

		beginFlip(displayedRef.current, nextSnapshot);
	}, [token, previewMode, beginFlip]);

	useEffect(() => () => clearFinishTimer(), [clearFinishTimer]);

	const surfaceCard = flip?.to ?? displayed;
	const ariaToken = flip?.to.token ?? displayed.token;

	const handleFlipEnd = useCallback(
		(event: React.AnimationEvent<HTMLDivElement>) => {
			if (!flipRef.current) return;
			if (!event.animationName.includes('mf-flip')) return;
			completeFlip();
		},
		[completeFlip],
	);

	return (
		<div
			className={['tdc-mf-layout', className].filter(Boolean).join(' ')}
			aria-live='polite'>
			<header className='tdc-mf-header'>
				<MonoFlipClock queueName={queueName} />
				{subtitle ? <span className='tdc-mf-subtitle'>{subtitle}</span> : null}
			</header>

			<div className='tdc-mf-stage' aria-label={`Token ${ariaToken}`}>
				<div
					className={[
						'tdc-mf-card',
						'tdc-mf-card--base',
						`tdc-mf-card--${surfaceCard.tone}`,
					].join(' ')}>
					<MonoFlipCardFace data={surfaceCard} side='front' />
				</div>

				{flip ? (
					<div
						className={[
							'tdc-mf-card',
							'tdc-mf-card--flip',
							`tdc-mf-card--flip-${flip.direction}`,
						].join(' ')}
						onAnimationStart={scheduleFinishFallback}
						onAnimationEnd={handleFlipEnd}>
						<div className='tdc-mf-card__inner'>
							<MonoFlipCardFace data={flip.from} side='front' />
							<MonoFlipCardFace
								data={{ ...flip.from, tone: nextTone(flip.from.tone) }}
								side='back'
							/>
						</div>
						<div className='tdc-mf-card__shadow' aria-hidden='true' />
					</div>
				) : null}
			</div>

			<footer className='tdc-mf-footer'>
				<span
					className={[
						'tdc-mf-status',
						`tdc-mf-status--${statusModifier}`,
					].join(' ')}>
					<span className='tdc-mf-status__dot' aria-hidden='true' />
					<span className='tdc-mf-status__label'>{statusLabel}</span>
				</span>
			</footer>
		</div>
	);
};

export default MonoFlipCardStack;

export { FLIP_MS as MONO_FLIP_ANIMATION_MS };

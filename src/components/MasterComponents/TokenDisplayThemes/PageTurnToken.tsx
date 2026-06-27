import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface PageTurnTokenProps {
	value: string;
	className?: string;
}

interface PeelState {
	from: string;
	to: string;
}

const PEEL_MS = 920;

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const PageTurnToken: React.FC<PageTurnTokenProps> = ({ value, className = '' }) => {
	const skipInitialRef = useRef(true);
	const pendingValueRef = useRef<string | null>(null);
	const peelRef = useRef<PeelState | null>(null);
	const displayedRef = useRef(value);
	const [displayed, setDisplayed] = useState(value);
	const [peel, setPeel] = useState<PeelState | null>(null);
	const [peelLayer, setPeelLayer] = useState<HTMLDivElement | null>(null);

	peelRef.current = peel;
	displayedRef.current = displayed;

	const completePeel = useCallback(() => {
		const current = peelRef.current;
		if (!current) return;

		displayedRef.current = current.to;
		setDisplayed(current.to);

		const pending = pendingValueRef.current;
		pendingValueRef.current = null;

		if (pending && pending !== current.to) {
			setPeel({ from: current.to, to: pending });
			return;
		}

		setPeel(null);
	}, []);

	useEffect(() => {
		if (skipInitialRef.current) {
			skipInitialRef.current = false;
			displayedRef.current = value;
			setDisplayed(value);
			return;
		}

		if (peelRef.current) {
			if (value !== peelRef.current.to) pendingValueRef.current = value;
			return;
		}

		if (value === displayedRef.current) return;

		if (prefersReducedMotion()) {
			displayedRef.current = value;
			setDisplayed(value);
			return;
		}

		setPeel({ from: displayedRef.current, to: value });
	}, [value]);

	useLayoutEffect(() => {
		const layer = peelLayer;
		if (!peel || !layer) return undefined;

		layer.style.transformOrigin = '100% 100%';

		const animation = layer.animate(
			[
				{
					transform: 'perspective(1100px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
					opacity: 1,
				},
				{
					transform: 'perspective(1100px) rotateX(-14deg) rotateY(-10deg) rotateZ(2deg)',
					opacity: 1,
					offset: 0.28,
				},
				{
					transform:
						'perspective(1100px) rotateX(-38deg) rotateY(-24deg) rotateZ(5deg) translateY(-6%)',
					opacity: 0.88,
					offset: 0.62,
				},
				{
					transform:
						'perspective(1100px) rotateX(-62deg) rotateY(-36deg) rotateZ(8deg) translateY(-14%)',
					opacity: 0,
				},
			],
			{
				duration: PEEL_MS,
				easing: 'cubic-bezier(0.38, 0.02, 0.18, 1)',
				fill: 'forwards',
			},
		);

		let finished = false;
		const finish = () => {
			if (finished) return;
			finished = true;
			completePeel();
		};

		animation.finished.then(finish).catch(finish);
		const fallbackTimer = window.setTimeout(finish, PEEL_MS + 120);

		return () => {
			window.clearTimeout(fallbackTimer);
			animation.cancel();
		};
	}, [peel, peelLayer, completePeel]);

	const visible = peel?.to ?? displayed;

	return (
		<div
			className={['tdc-pt-sheet-stack', className].filter(Boolean).join(' ')}
			aria-live='polite'
			aria-label={`Token ${visible}`}>
			<div className='tdc-pt-sheet tdc-pt-sheet--under'>
				<span className='tdc-pt-token__value'>{visible}</span>
			</div>

			{peel ? (
				<div
					key={`${peel.from}->${peel.to}`}
					ref={setPeelLayer}
					className='tdc-pt-sheet tdc-pt-sheet--peel'
					aria-hidden='true'>
					<div className='tdc-pt-sheet__surface'>
						<span className='tdc-pt-token__value'>{peel.from}</span>
					</div>
					<div className='tdc-pt-sheet__curl' aria-hidden='true' />
					<div className='tdc-pt-sheet__shade' aria-hidden='true' />
				</div>
			) : null}
		</div>
	);
};

export default PageTurnToken;

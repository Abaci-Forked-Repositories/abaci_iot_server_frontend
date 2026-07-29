import React, { useEffect, useRef, useState } from 'react';
import SignalBoardDigitRoll from './SignalBoardDigitRoll';

export interface SignalBoardTokenProps {
	value: string;
	className?: string;
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SignalBoardToken: React.FC<SignalBoardTokenProps> = ({ value, className = '' }) => {
	const skipInitialRef = useRef(true);
	const [callFx, setCallFx] = useState(0);
	const animate = !prefersReducedMotion();

	useEffect(() => {
		if (skipInitialRef.current) {
			skipInitialRef.current = false;
			return;
		}
		if (!animate) return;
		setCallFx((seq) => seq + 1);
	}, [value, animate]);

	return (
		<div
			className={['tdc-sig-led', className].filter(Boolean).join(' ')}
			aria-live='polite'
			aria-label={`Token ${value}`}>
			{animate && callFx > 0 ? (
				<>
					<span key={`flash-${callFx}`} className='tdc-sig-led__flash' aria-hidden='true' />
					<span key={`scan-${callFx}`} className='tdc-sig-led__scan' aria-hidden='true' />
					<span key={`ripple-${callFx}`} className='tdc-sig-led__ripple' aria-hidden='true' />
				</>
			) : null}
			<SignalBoardDigitRoll value={value} animate={animate} />
		</div>
	);
};

export default SignalBoardToken;

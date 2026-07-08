import React, { useCallback, useEffect, useRef, useState } from 'react';

const ROLL_MS = 380;
const STAGGER_MS = 45;

export interface SignalBoardDigitRollProps {
	value: string;
	animate?: boolean;
	className?: string;
}

interface RollDigitProps {
	char: string;
	index: number;
	animate: boolean;
}

function RollDigit({ char, index, animate }: RollDigitProps) {
	const skipRef = useRef(true);
	const pendingRef = useRef<string | null>(null);
	const rollRef = useRef<{ from: string; to: string } | null>(null);
	const [shown, setShown] = useState(char);
	const [roll, setRoll] = useState<{ from: string; to: string } | null>(null);

	rollRef.current = roll;

	const finishRoll = useCallback(() => {
		const current = rollRef.current;
		if (!current) return;

		setShown(current.to);
		setRoll(null);

		const pending = pendingRef.current;
		pendingRef.current = null;
		if (pending && pending !== current.to) {
			setRoll({ from: current.to, to: pending });
		}
	}, []);

	useEffect(() => {
		if (skipRef.current) {
			skipRef.current = false;
			setShown(char);
			return;
		}

		if (!animate) {
			setShown(char);
			setRoll(null);
			pendingRef.current = null;
			return;
		}

		if (rollRef.current) {
			if (char !== rollRef.current.to) pendingRef.current = char;
			return;
		}

		if (char === shown) return;

		setRoll({ from: shown, to: char });
	}, [char, shown, animate]);

	useEffect(() => {
		if (!roll) return undefined;
		const fallback = window.setTimeout(
			finishRoll,
			ROLL_MS + index * STAGGER_MS + 100,
		);
		return () => window.clearTimeout(fallback);
	}, [roll, index, finishRoll]);

	return (
		<span
			className={['tdc-sig-digit', roll ? 'tdc-sig-digit--rolling' : '']
				.filter(Boolean)
				.join(' ')}
			aria-hidden='true'>
			<span
				className='tdc-sig-digit__track'
				style={roll ? { animationDelay: `${index * STAGGER_MS}ms` } : undefined}
				onAnimationEnd={(event) => {
					if (!event.animationName.includes('sig-digit-roll')) return;
					finishRoll();
				}}>
				{roll ? (
					<>
						<span className='tdc-sig-digit__cell'>{roll.from}</span>
						<span className='tdc-sig-digit__cell'>{roll.to}</span>
					</>
				) : (
					<span className='tdc-sig-digit__cell'>{shown}</span>
				)}
			</span>
		</span>
	);
}

/** Per-digit vertical LED tick — Signal Board only. */
const SignalBoardDigitRoll: React.FC<SignalBoardDigitRollProps> = ({
	value,
	animate = true,
	className = '',
}) => {
	const chars = value.split('');

	return (
		<span
			className={['tdc-sig-token', className].filter(Boolean).join(' ')}
			aria-hidden='true'>
			{chars.map((char, index) => (
				<RollDigit key={index} char={char} index={index} animate={animate} />
			))}
		</span>
	);
};

export default SignalBoardDigitRoll;

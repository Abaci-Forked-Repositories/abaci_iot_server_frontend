import React, { useEffect, useRef, useState } from 'react';

export interface AuroraNexusTokenProps {
	value: string;
	className?: string;
}

const DIGIT_VARIANTS = ['cyan', 'purple', 'blue', 'magenta'] as const;
const CASCADE_STAGGER_MS = 100;

const AuroraNexusToken: React.FC<AuroraNexusTokenProps> = ({ value, className = '' }) => {
	const skipFlashRef = useRef(true);
	const [flashing, setFlashing] = useState(false);
	const completedDigitsRef = useRef(0);

	useEffect(() => {
		if (skipFlashRef.current) {
			skipFlashRef.current = false;
			return;
		}
		completedDigitsRef.current = 0;
		setFlashing(true);
	}, [value]);

	const chars = value.split('');

	const handleDigitAnimationEnd = () => {
		completedDigitsRef.current += 1;
		if (completedDigitsRef.current >= chars.length) {
			setFlashing(false);
		}
	};

	return (
		<span className={['tdc-an-token', className].filter(Boolean).join(' ')}>
			{chars.map((char, index) => (
				<span
					key={`${char}-${index}`}
					className={[
						'tdc-an-token__digit',
						`tdc-an-token__digit--${DIGIT_VARIANTS[index % DIGIT_VARIANTS.length]}`,
						flashing ? 'tdc-an-token__digit--cascade' : '',
					]
						.filter(Boolean)
						.join(' ')}
					style={
						flashing
							? ({ animationDelay: `${index * CASCADE_STAGGER_MS}ms` } as React.CSSProperties)
							: undefined
					}
					onAnimationEnd={flashing ? handleDigitAnimationEnd : undefined}>
					{char}
				</span>
			))}
		</span>
	);
};

export default AuroraNexusToken;

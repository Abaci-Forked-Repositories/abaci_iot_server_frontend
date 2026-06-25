import React, { useEffect, useRef, useState } from 'react';

export interface AuroraNexusTokenProps {
	value: string;
	className?: string;
}

const DIGIT_VARIANTS = ['cyan', 'purple', 'blue', 'magenta'] as const;

const AuroraNexusToken: React.FC<AuroraNexusTokenProps> = ({ value, className = '' }) => {
	const skipFlashRef = useRef(true);
	const [flashing, setFlashing] = useState(false);

	useEffect(() => {
		if (skipFlashRef.current) {
			skipFlashRef.current = false;
			return;
		}
		setFlashing(true);
	}, [value]);

	const chars = value.split('');

	return (
		<span
			className={[
				'tdc-an-token',
				flashing ? 'tdc-an-token--flash' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			onAnimationEnd={() => setFlashing(false)}>
			{chars.map((char, index) => (
				<span
					key={`${char}-${index}`}
					className={`tdc-an-token__digit tdc-an-token__digit--${DIGIT_VARIANTS[index % DIGIT_VARIANTS.length]}`}>
					{char}
				</span>
			))}
		</span>
	);
};

export default AuroraNexusToken;

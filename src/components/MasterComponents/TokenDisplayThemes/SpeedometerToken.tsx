import React, { useEffect, useRef, useState } from 'react';

export interface SpeedometerTokenProps {
	value: string;
	className?: string;
}

/** Responsive digital-readout token — scales with container via SCSS + reveal on change. */
const SpeedometerToken: React.FC<SpeedometerTokenProps> = ({ value, className = '' }) => {
	const skipRevealRef = useRef(true);
	const [revealing, setRevealing] = useState(false);

	useEffect(() => {
		if (skipRevealRef.current) {
			skipRevealRef.current = false;
			return;
		}
		setRevealing(true);
	}, [value]);

	return (
		<span
			className={[
				'tdc-cs-token',
				revealing ? 'tdc-cs-token--reveal' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			onAnimationEnd={() => setRevealing(false)}>
			{value}
		</span>
	);
};

export default SpeedometerToken;

import React, { useEffect, useRef, useState } from 'react';

export interface OledPulseTokenProps {
	value: string;
	className?: string;
}

const OledPulseToken: React.FC<OledPulseTokenProps> = ({ value, className = '' }) => {
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
				'tdc-op-token',
				revealing ? 'tdc-op-token--reveal' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			onAnimationEnd={() => setRevealing(false)}>
			{value}
		</span>
	);
};

export default OledPulseToken;

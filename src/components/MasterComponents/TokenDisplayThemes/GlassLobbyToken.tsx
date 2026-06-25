import React, { useEffect, useRef, useState } from 'react';

export interface GlassLobbyTokenProps {
	value: string;
	className?: string;
}

const GlassLobbyToken: React.FC<GlassLobbyTokenProps> = ({ value, className = '' }) => {
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
				'tdc-gl-token',
				revealing ? 'tdc-gl-token--fade' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			onAnimationEnd={() => setRevealing(false)}>
			{value}
		</span>
	);
};

export default GlassLobbyToken;

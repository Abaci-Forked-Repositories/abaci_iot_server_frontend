import React, { useEffect, useRef, useState } from 'react';

export interface NeonPrismTokenProps {
	value: string;
	className?: string;
}

const NeonPrismToken: React.FC<NeonPrismTokenProps> = ({ value, className = '' }) => {
	const skipFlashRef = useRef(true);
	const [flashing, setFlashing] = useState(false);

	useEffect(() => {
		if (skipFlashRef.current) {
			skipFlashRef.current = false;
			return;
		}
		setFlashing(true);
	}, [value]);

	return (
		<span
			className={[
				'tdc-np-token',
				flashing ? 'tdc-np-token--flash' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			onAnimationEnd={() => setFlashing(false)}>
			{value}
		</span>
	);
};

export default NeonPrismToken;

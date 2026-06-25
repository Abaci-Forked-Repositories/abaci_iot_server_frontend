import React, { useEffect, useRef, useState } from 'react';

export interface HealthcareTokenProps {
	value: string;
	className?: string;
}

const HealthcareToken: React.FC<HealthcareTokenProps> = ({ value, className = '' }) => {
	const skipRevealRef = useRef(true);
	const [zooming, setZooming] = useState(false);

	useEffect(() => {
		if (skipRevealRef.current) {
			skipRevealRef.current = false;
			return;
		}
		setZooming(true);
	}, [value]);

	return (
		<span
			className={[
				'tdc-dh-token',
				zooming ? 'tdc-dh-token--zoom' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			onAnimationEnd={() => setZooming(false)}>
			{value}
		</span>
	);
};

export default HealthcareToken;

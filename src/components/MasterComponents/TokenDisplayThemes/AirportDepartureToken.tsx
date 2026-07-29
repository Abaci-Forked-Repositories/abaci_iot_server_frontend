import React from 'react';
import FlipTokenDisplay from './FlipTokenDisplay';

export interface AirportDepartureTokenProps {
	value: string;
	className?: string;
	/** Compact digits for table rows; hero size for single-queue board. */
	size?: 'table' | 'hero';
}

const AirportDepartureToken: React.FC<AirportDepartureTokenProps> = ({
	value,
	className = '',
	size = 'table',
}) => (
	<span
		className={[
			'tdc-ad-flip',
			size === 'hero' ? 'tdc-ad-flip--hero' : 'tdc-ad-flip--table',
			className,
		]
			.filter(Boolean)
			.join(' ')}
		aria-hidden={value === '—'}>
		<FlipTokenDisplay value={value} />
	</span>
);

export default AirportDepartureToken;

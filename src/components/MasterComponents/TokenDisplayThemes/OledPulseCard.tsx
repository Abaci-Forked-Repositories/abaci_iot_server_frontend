import React, { useEffect, useRef, useState } from 'react';
import OledPulseToken from './OledPulseToken';

export interface OledPulseCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
}

const OledPulseCard: React.FC<OledPulseCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
}) => {
	const skipSweepRef = useRef(true);
	const [sweepKey, setSweepKey] = useState(0);
	console.log("subtitle", subtitle);

	useEffect(() => {
		if (skipSweepRef.current) {
			skipSweepRef.current = false;
			return;
		}
		setSweepKey((key) => key + 1);
	}, [displayToken]);

	return (
		<div className='tdc-op-layout'>
			<div className='tdc-op-accent-track' aria-hidden='true'>
				<div key={sweepKey} className='tdc-op-accent tdc-op-accent--sweep' />
			</div>

			<header className='tdc-op-meta'>
				<div className='tdc-op-meta__copy'>
					{queueName ? (
						<span className='tdc-op-queue'>{queueName}</span>
					) : (
						<span className='tdc-op-queue tdc-op-queue--empty' aria-hidden='true' />
					)}
					{subtitle ? <span className='tdc-op-subtitle'>{subtitle}</span> : null}
				</div>
				<div className='tdc-op-status' aria-live='polite'>
					<span
						className={`tdc-op-status__dot tdc-op-status__dot--${statusModifier}`}
						aria-hidden='true'
					/>
					<span className='tdc-op-status__label'>{statusLabel}</span>
				</div>
			</header>

			<div className='tdc-op-hero' aria-label={`Token ${displayToken}`}>
				<OledPulseToken value={displayToken} />
			</div>
		</div>
	);
};

export default OledPulseCard;

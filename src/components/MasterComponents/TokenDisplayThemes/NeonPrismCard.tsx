import React from 'react';
import NeonPrismToken from './NeonPrismToken';

export interface NeonPrismCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
}

const NeonPrismCard: React.FC<NeonPrismCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
}) => {
	return (
		<div className='tdc-np-layout'>
			<div className='tdc-np-ambient' aria-hidden='true'>
				<div className='tdc-np-ambient__glow tdc-np-ambient__glow--left' />
				<div className='tdc-np-ambient__glow tdc-np-ambient__glow--right' />
				<div className='tdc-np-ambient__floor' />
			</div>

			<div className='tdc-np-stage'>
				<div className='tdc-np-panel tdc-np-panel--edge tdc-np-panel--far-left' aria-hidden='true'>
					<div className='tdc-np-panel__grid' />
					<div className='tdc-np-panel__rim' />
					<div className='tdc-np-panel__floor-glow' />
				</div>

				<div className='tdc-np-panel tdc-np-panel--wing tdc-np-panel--near-left'>
					<div className='tdc-np-panel__grid' aria-hidden='true' />
					<div className='tdc-np-panel__rim' aria-hidden='true' />
					<div className='tdc-np-panel__floor-glow' aria-hidden='true' />
					<div className='tdc-np-wing'>
						<span className='tdc-np-wing__label'>Queue</span>
						{queueName ? (
							<span className='tdc-np-wing__value'>{queueName}</span>
						) : (
							<span className='tdc-np-wing__value tdc-np-wing__value--empty' aria-hidden='true' />
						)}
						{subtitle ? <span className='tdc-np-wing__sub'>{subtitle}</span> : null}
					</div>
				</div>

				<div
					className='tdc-np-panel tdc-np-panel--center'
					aria-label={`Token ${displayToken}`}>
					<div className='tdc-np-panel__grid' aria-hidden='true' />
					<div className='tdc-np-panel__rim' aria-hidden='true' />
					<div className='tdc-np-panel__floor-glow' aria-hidden='true' />
					<div className='tdc-np-hero'>
						<span className='tdc-np-hero__label'>Now Serving</span>
						<NeonPrismToken value={displayToken} />
					</div>
				</div>

				<div
					className={[
						'tdc-np-panel',
						'tdc-np-panel--wing',
						'tdc-np-panel--near-right',
						`tdc-np-panel--status-${statusModifier}`,
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'>
					<div className='tdc-np-panel__grid' aria-hidden='true' />
					<div className='tdc-np-panel__rim' aria-hidden='true' />
					<div className='tdc-np-panel__floor-glow' aria-hidden='true' />
					<div className='tdc-np-wing tdc-np-wing--status'>
						<span className='tdc-np-wing__label'>Status</span>
						<span className='tdc-np-wing__value tdc-np-wing__value--status'>
							<span className='tdc-np-status-dot' aria-hidden='true' />
							<span className='tdc-np-status-text'>{statusLabel}</span>
						</span>
					</div>
				</div>

				<div className='tdc-np-panel tdc-np-panel--edge tdc-np-panel--far-right' aria-hidden='true'>
					<div className='tdc-np-panel__grid' />
					<div className='tdc-np-panel__rim' />
					<div className='tdc-np-panel__floor-glow' />
				</div>
			</div>
		</div>
	);
};

export default NeonPrismCard;

import React from 'react';
import AuroraNexusBackdrop from './AuroraNexusBackdrop';
import AuroraNexusToken from './AuroraNexusToken';

export interface AuroraNexusCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
}

const ClockIcon: React.FC = () => (
	<svg className='tdc-an-status__icon' viewBox='0 0 24 24' aria-hidden='true'>
		<circle cx='12' cy='12' r='9' fill='none' stroke='currentColor' strokeWidth='1.6' />
		<path
			d='M12 7v5.2l3.2 2'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.6'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);

function statusSublabel(modifier: string): string {
	switch (modifier) {
		case 'serving':
			return 'Please Proceed Now';
		case 'registered':
			return 'Awaiting Your Call';
		case 'completed':
			return 'Service Complete';
		case 'cancelled':
			return 'Token Cancelled';
		case 'postponed':
			return 'Call Postponed';
		case 'no-show':
			return 'Missed Call';
		case 'waiting':
		default:
			return 'Now Serving Soon';
	}
}

function headerLine(queueName?: string, subtitle?: string): string | null {
	const parts = [queueName?.trim(), subtitle?.trim()].filter(Boolean);
	return parts.length ? parts.join(' ') : null;
}

const AuroraNexusCard: React.FC<AuroraNexusCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
}) => {
	const headerText = headerLine(queueName, subtitle);

	return (
		<div className='tdc-an-layout'>
			<AuroraNexusBackdrop />

			<header className='tdc-an-header'>
				<span className='tdc-an-header__line' aria-hidden='true' />
				<span className='tdc-an-header__dot' aria-hidden='true' />
				{headerText ? (
					<span className='tdc-an-header__text'>{headerText}</span>
				) : (
					<span className='tdc-an-header__text tdc-an-header__text--empty' aria-hidden='true' />
				)}
				<span className='tdc-an-header__dot' aria-hidden='true' />
				<span className='tdc-an-header__line' aria-hidden='true' />
			</header>

			<div className='tdc-an-main'>
				<div className='tdc-an-hero' aria-label={`Token ${displayToken}`}>
					<AuroraNexusToken value={displayToken} />
				</div>

				<div className='tdc-an-separator' aria-hidden='true'>
					<span className='tdc-an-separator__line' />
					<span className='tdc-an-separator__spark' />
					<span className='tdc-an-separator__line' />
				</div>

				<div
					className={[
						'tdc-an-status',
						`tdc-an-status--${statusModifier}`,
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'>
					<ClockIcon />
					<span className='tdc-an-status__label'>{statusLabel}</span>
					<span className='tdc-an-status__sub'>{statusSublabel(statusModifier)}</span>
				</div>
			</div>
		</div>
	);
};

export default AuroraNexusCard;

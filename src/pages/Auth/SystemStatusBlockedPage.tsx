import React from 'react';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';
import QueIconLogo from '../../assets/que-icon-logo.svg';
import './activationOnboarding.scss';

interface Props {
	title: string;
	message: string;
	deviceId?: string | null;
	deactivationDate?: string | null;
	onRetry?: () => void;
}

function formatDateTime(iso: string | null | undefined): string | null {
	if (!iso) return null;
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

const SystemStatusBlockedPage: React.FC<Props> = ({
	title,
	message,
	deviceId,
	deactivationDate,
	onRetry,
}) => {
	const { darkModeStatus } = useDarkMode();
	const formattedDeactivation = formatDateTime(deactivationDate);

	return (
		<div
			className={classNames('activation-onboarding', {
				'activation-onboarding--dark': darkModeStatus,
			})}>
			<div className='activation-onboarding__card'>
				<div className='activation-onboarding__header'>
					<div>
						<h1 className='activation-onboarding__title'>{title}</h1>
						<p className='activation-onboarding__subtitle'>{message}</p>
					</div>
					<img
						src={QueIconLogo}
						alt='Queue Management'
						className='activation-onboarding__logo'
						width={88}
						height={72}
					/>
				</div>

				{deviceId && (
					<div className='activation-onboarding__product-box'>
						<span className='activation-onboarding__label'>Device ID</span>
						<div className='activation-onboarding__product-id activation-onboarding__product-id--readonly'>
							{deviceId}
						</div>
					</div>
				)}

				{formattedDeactivation && (
					<p className='activation-onboarding__hint mb-0'>
						Deactivated on: <strong>{formattedDeactivation}</strong>
					</p>
				)}

				{onRetry && (
					<button type='button' className='activation-onboarding__btn mt-4' onClick={onRetry}>
						Retry
					</button>
				)}
			</div>
		</div>
	);
};

export default SystemStatusBlockedPage;

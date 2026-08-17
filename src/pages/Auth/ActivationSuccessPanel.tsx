import React from 'react';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';
import QueIconLogo from '../../assets/que-icon-logo.svg';
import './activationOnboarding.scss';

export interface ActivationSuccessDetails {
	no_of_sensor_license?: number | null;
	no_of_serving_point_license?: number | null;
	customer_id?: string | null;
	system_unique_id?: string | null;
	is_demo?: boolean | null;
	demo_expiry?: string | null;
	message?: string | null;
}

interface Props {
	details: ActivationSuccessDetails;
	onContinue: () => void;
	usedMock?: boolean;
}

function formatDemoExpiry(value?: string | null): string {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

const ActivationSuccessPanel: React.FC<Props> = ({ details, onContinue, usedMock }) => {
	const { darkModeStatus } = useDarkMode();
	const isDemo = Boolean(details.is_demo);

	return (
		<div
			className={classNames('activation-onboarding', {
				'activation-onboarding--dark': darkModeStatus,
			})}>
			<div className='activation-onboarding__card'>
				<div className='activation-onboarding__header'>
					<div>
						<h1 className='activation-onboarding__title'>Activation complete</h1>
						<p className='activation-onboarding__subtitle'>
							Your license has been applied to this device.
						</p>
					</div>
					<img
						src={QueIconLogo}
						alt='Queue Management'
						className='activation-onboarding__logo'
						width={88}
						height={72}
					/>
				</div>

				<p className='activation-onboarding__success-title'>System activated successfully!</p>
				<p className='activation-onboarding__success-body'>
					Your device is licensed and ready. Review the activation details below.
				</p>

				<ul className='activation-onboarding__details'>
					<li>
						<span>Serving point license</span>
						<span>{details.no_of_serving_point_license ?? '—'}</span>
					</li>
					<li>
						<span>Customer</span>
						<span>{details.customer_id ?? '—'}</span>
					</li>
					<li>
						<span>Device ID</span>
						<span>{details.system_unique_id ?? '—'}</span>
					</li>
					<li>
						<span>Demo</span>
						<span>{isDemo ? 'Yes' : 'No'}</span>
					</li>
					{isDemo && (
						<li>
							<span>Demo expiry</span>
							<span>{formatDemoExpiry(details.demo_expiry)}</span>
						</li>
					)}
				</ul>

				<button type='button' className='activation-onboarding__btn' onClick={onContinue}>
					Continue
				</button>

				<div className='activation-onboarding__footer'>
					<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
						<path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' />
					</svg>
					Authorized hardware activation
				</div>
			</div>
			{usedMock && (
				<div className='activation-onboarding__mock-badge'>Mock mode — APIs not connected</div>
			)}
		</div>
	);
};

export default ActivationSuccessPanel;

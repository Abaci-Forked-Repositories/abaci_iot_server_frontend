import React from 'react';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';
import QueIconLogo from '../../assets/que-icon-logo.svg';
import './activationOnboarding.scss';

interface Props {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

const ConfigErrorPage: React.FC<Props> = ({
	title = 'Configuration error',
	message = 'The system could not load activation status. Check that the backend is reachable, then try again.',
	onRetry,
}) => {
	const { darkModeStatus } = useDarkMode();

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
				{onRetry && (
					<button type='button' className='activation-onboarding__btn' onClick={onRetry}>
						Retry
					</button>
				)}
			</div>
		</div>
	);
};

export default ConfigErrorPage;

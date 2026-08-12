import React, { useState } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import useDarkMode from '../../hooks/useDarkMode';
import {
	createFirstAdminUser,
} from '../../api/administration/activation.api';
import {
	ADMIN_PASSWORD_POLICY_MESSAGE,
	isValidAdminFirstUserPassword,
} from '../../helpers/adminFirstUserPasswordPolicy';
import validateEmail from '../../helpers/emailValidator';
import QueIconLogo from '../../assets/que-icon-logo.svg';
import './activationOnboarding.scss';

interface Props {
	usedMock?: boolean;
	onCreated: () => Promise<void> | void;
}

function getErrorMessage(error: unknown): string {
	const err = error as {
		response?: { data?: Record<string, unknown>; message?: string };
		message?: string;
	};
	const data = err?.response?.data;
	if (data) {
		for (const key of ['username', 'email', 'password', 'detail', 'message']) {
			const val = data[key];
			if (typeof val === 'string') return val;
			if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
		}
	}
	return err?.message || 'Could not create administrator. Please try again.';
}

const SuperAdminPage: React.FC<Props> = ({ usedMock = false, onCreated }) => {
	const { darkModeStatus } = useDarkMode();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState<string | null>(null);

	const validate = (): boolean => {
		const next: Record<string, string> = {};
		const emailErr = validateEmail(email);
		if (!email.trim()) next.email = 'Required';
		else if (emailErr) next.email = emailErr;
		if (!firstName.trim()) next.firstName = 'Required';
		if (!lastName.trim()) next.lastName = 'Required';
		if (!password) next.password = 'Required';
		else if (!isValidAdminFirstUserPassword(password)) next.password = ADMIN_PASSWORD_POLICY_MESSAGE;
		if (!confirmPassword) next.confirmPassword = 'Required';
		else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		if (!validate()) return;

		setLoading(true);
		try {
			await createFirstAdminUser({
				username: email.trim(),
				password,
				first_name: firstName.trim(),
				last_name: lastName.trim(),
			});

			try {
				localStorage.setItem('showGuidedTour', 'true');
			} catch {
				/* ignore */
			}

			await onCreated();
			navigate('/login', { replace: true });
		} catch (error) {
			setFormError(getErrorMessage(error));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={classNames('activation-onboarding', {
				'activation-onboarding--dark': darkModeStatus,
			})}>
			<div className='activation-onboarding__card'>
				<div className='activation-onboarding__header'>
					<div>
						<h1 className='activation-onboarding__title'>Create your admin account</h1>
						<p className='activation-onboarding__subtitle'>
							This first account gets full administrator access.
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

				<div className='activation-onboarding__notice'>
					<strong>Important:</strong> On-prem systems may not support forgot-password for the
					admin account. Store this password safely.
				</div>

				<form onSubmit={handleSubmit} noValidate>
					<div className='activation-onboarding__field'>
						<label className='activation-onboarding__label' htmlFor='admin-email'>
							Email address
						</label>
						<input
							id='admin-email'
							type='email'
							className={classNames('activation-onboarding__input', {
								'is-invalid': Boolean(errors.email),
							})}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='admin@example.com'
							autoComplete='username'
							disabled={loading}
						/>
						{errors.email && <p className='activation-onboarding__error'>{errors.email}</p>}
					</div>

					<div className='activation-onboarding__row'>
						<div className='activation-onboarding__field'>
							<label className='activation-onboarding__label' htmlFor='admin-first'>
								First name
							</label>
							<input
								id='admin-first'
								type='text'
								className={classNames('activation-onboarding__input', {
									'is-invalid': Boolean(errors.firstName),
								})}
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder='First name'
								disabled={loading}
							/>
							{errors.firstName && (
								<p className='activation-onboarding__error'>{errors.firstName}</p>
							)}
						</div>
						<div className='activation-onboarding__field'>
							<label className='activation-onboarding__label' htmlFor='admin-last'>
								Last name
							</label>
							<input
								id='admin-last'
								type='text'
								className={classNames('activation-onboarding__input', {
									'is-invalid': Boolean(errors.lastName),
								})}
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder='Last name'
								disabled={loading}
							/>
							{errors.lastName && (
								<p className='activation-onboarding__error'>{errors.lastName}</p>
							)}
						</div>
					</div>

					<div className='activation-onboarding__field'>
						<label className='activation-onboarding__label' htmlFor='admin-password'>
							Password
						</label>
						<div className='activation-onboarding__password-wrap'>
							<input
								id='admin-password'
								type={showPassword ? 'text' : 'password'}
								className={classNames('activation-onboarding__input', {
									'is-invalid': Boolean(errors.password),
								})}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder='Password'
								autoComplete='new-password'
								disabled={loading}
							/>
							<button
								type='button'
								className='activation-onboarding__eye'
								onClick={() => setShowPassword((v) => !v)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}>
								{showPassword ? 'Hide' : 'Show'}
							</button>
						</div>
						{errors.password && (
							<p className='activation-onboarding__error'>{errors.password}</p>
						)}
					</div>

					<div className='activation-onboarding__field'>
						<label className='activation-onboarding__label' htmlFor='admin-confirm'>
							Confirm password
						</label>
						<div className='activation-onboarding__password-wrap'>
							<input
								id='admin-confirm'
								type={showConfirm ? 'text' : 'password'}
								className={classNames('activation-onboarding__input', {
									'is-invalid': Boolean(errors.confirmPassword),
								})}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder='Confirm password'
								autoComplete='new-password'
								disabled={loading}
							/>
							<button
								type='button'
								className='activation-onboarding__eye'
								onClick={() => setShowConfirm((v) => !v)}
								aria-label={showConfirm ? 'Hide password' : 'Show password'}>
								{showConfirm ? 'Hide' : 'Show'}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className='activation-onboarding__error'>{errors.confirmPassword}</p>
						)}
					</div>

					{formError && <p className='activation-onboarding__error'>{formError}</p>}

					<button type='submit' className='activation-onboarding__btn' disabled={loading}>
						{loading ? 'Creating…' : 'Create Administrator'}
					</button>
				</form>

				<div className='activation-onboarding__footer'>
					<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
						<path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' />
					</svg>
					Secure system initialization
				</div>
			</div>
			{usedMock && (
				<div className='activation-onboarding__mock-badge'>Mock mode — APIs not connected</div>
			)}
		</div>
	);
};

export default SuperAdminPage;

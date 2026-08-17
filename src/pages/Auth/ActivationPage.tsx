import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useDarkMode from '../../hooks/useDarkMode';
import { activateLicense, type ActivateLicenseResponse } from '../../api/administration/activation.api';
import QueIconLogo from '../../assets/que-icon-logo.svg';
import './activationOnboarding.scss';

interface Props {
	productId: string | null;
	isDeactivated?: boolean;
	usedMock?: boolean;
	/** Called after activate API succeeds — parent holds success UI until Continue. */
	onActivationSuccess: (result: ActivateLicenseResponse) => void;
}

function getErrorMessage(error: unknown): string {
	const err = error as {
		response?: { data?: { message?: string; detail?: string; activation_token?: string[] } };
		message?: string;
	};
	const data = err?.response?.data;
	if (data?.activation_token?.[0]) return data.activation_token[0];
	if (data?.message) return data.message;
	if (data?.detail) return typeof data.detail === 'string' ? data.detail : 'Activation failed';
	return err?.message || 'Activation failed. Please try again.';
}

const ActivationPage: React.FC<Props> = ({
	productId,
	isDeactivated = false,
	usedMock = false,
	onActivationSuccess,
}) => {
	const { darkModeStatus } = useDarkMode();
	const [editableProductId, setEditableProductId] = useState(productId ?? '');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(false);
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// Prefill from status API; keep editable if the user changes it.
	useEffect(() => {
		setEditableProductId(productId ?? '');
	}, [productId]);

	const handleActivate = async () => {
		const trimmed = token.trim();
		if (!trimmed) {
			setFieldError('Activation code is required');
			return;
		}

		setLoading(true);
		setFieldError(null);

		try {
			const { data } = await activateLicense(trimmed, productIdValue);
			if (data.success === false) {
				setFieldError(data.message || 'Activation failed');
				return;
			}
			onActivationSuccess(data);
		} catch (error) {
			setFieldError(getErrorMessage(error));
		} finally {
			setLoading(false);
		}
	};

	const productIdValue = editableProductId.trim();

	return (
		<div
			className={classNames('activation-onboarding', {
				'activation-onboarding--dark': darkModeStatus,
			})}>
			<div className='activation-onboarding__card'>
				<div className='activation-onboarding__header'>
					<div>
						<h1 className='activation-onboarding__title'>
							{isDeactivated ? 'Reactivate your device' : 'Activate your device'}
						</h1>
						<p className='activation-onboarding__subtitle'>
							{isDeactivated
								? 'Paste a new activation token to restore this device.'
								: 'Paste your activation token to unlock the device.'}
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

				<div className='activation-onboarding__product-box'>
					<label className='activation-onboarding__label' htmlFor='product-id'>
						Device ID
					</label>
					<div className='activation-onboarding__product-row'>
						<input
							id='product-id'
							type='text'
							className='activation-onboarding__product-id'
							value={editableProductId}
							onChange={(e) => setEditableProductId(e.target.value)}
							placeholder='Enter device ID'
							disabled={loading}
							autoComplete='off'
						/>
						<CopyToClipboard
							text={productIdValue}
							onCopy={() => {
								setCopied(true);
								window.setTimeout(() => setCopied(false), 1500);
							}}>
							<button
								type='button'
								className='activation-onboarding__copy-btn'
								disabled={!productIdValue}>
								{copied ? 'Copied' : 'Copy'}
							</button>
						</CopyToClipboard>
					</div>
					<p className='activation-onboarding__hint'>
						Share this Device ID with your administrator to receive an activation token.
					</p>
				</div>

				<div className='activation-onboarding__field'>
					<label className='activation-onboarding__label' htmlFor='activation-token'>
						Activation code
					</label>
					<textarea
						id='activation-token'
						className={classNames('activation-onboarding__textarea', {
							'is-invalid': Boolean(fieldError),
						})}
						value={token}
						onChange={(e) => {
							setToken(e.target.value);
							if (fieldError) setFieldError(null);
						}}
						placeholder='Paste activation token here'
						disabled={loading}
						autoComplete='off'
					/>
					{fieldError && <p className='activation-onboarding__error'>{fieldError}</p>}
				</div>

				<button
					type='button'
					className='activation-onboarding__btn'
					onClick={handleActivate}
					disabled={loading}>
					{loading ? 'Activating…' : 'Activate System'}
				</button>

				<div className='activation-onboarding__footer'>
					<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
						<path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z' />
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

export default ActivationPage;

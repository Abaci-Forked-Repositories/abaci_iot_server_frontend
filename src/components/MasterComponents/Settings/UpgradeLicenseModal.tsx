import React, { FC, useEffect, useRef, useState } from 'react';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import FormGroup from '../../bootstrap/forms/FormGroup';
import Textarea from '../../bootstrap/forms/Textarea';
import Alert from '../../bootstrap/Alert';
import Spinner from '../../bootstrap/Spinner';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	previewActivationToken,
	PreviewActivationTokenResponse,
	upgradeLicense,
} from '../../../api/administration/licenseDetails.api';

type UpgradeStep = 1 | 2 | 3;

const STEPS: { id: UpgradeStep; label: string }[] = [
	{ id: 1, label: 'Paste Key' },
	{ id: 2, label: 'Validate' },
	{ id: 3, label: 'Apply' },
];

interface UpgradeLicenseModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	deviceId: string;
	onUpgraded?: () => void;
}

const UpgradeLicenseModal: FC<UpgradeLicenseModalProps> = ({
	isOpen,
	setIsOpen,
	deviceId,
	onUpgraded,
}) => {
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const [step, setStep] = useState<UpgradeStep>(1);
	const [token, setToken] = useState('');
	const [validating, setValidating] = useState(false);
	const [applying, setApplying] = useState(false);
	const [preview, setPreview] = useState<PreviewActivationTokenResponse | null>(null);
	const applyInFlightRef = useRef(false);
	const closeAfterApplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!isOpen) {
			setStep(1);
			setToken('');
			setValidating(false);
			setApplying(false);
			setPreview(null);
			applyInFlightRef.current = false;
			if (closeAfterApplyTimeoutRef.current) {
				clearTimeout(closeAfterApplyTimeoutRef.current);
				closeAfterApplyTimeoutRef.current = null;
			}
		}
	}, [isOpen]);

	useEffect(() => {
		return () => {
			if (closeAfterApplyTimeoutRef.current) {
				clearTimeout(closeAfterApplyTimeoutRef.current);
			}
		};
	}, []);

	const handleClose = () => {
		if (validating || applying || step === 3) return;
		setIsOpen(false);
	};

	const handleValidate = async () => {
		const activation_token = token.trim();
		if (!activation_token || !deviceId || validating) return;

		setValidating(true);
		try {
			const data = await previewActivationToken({
				device_id: deviceId,
				activation_token,
			});
			setPreview(data);
			setStep(2);
			if (data.message) {
				showSuccessNotification(data.message);
			} else {
				showSuccessNotification('Activation token validated.');
			}
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setValidating(false);
		}
	};

	const handleApply = async () => {
		const activation_token = token.trim();
		if (
			!activation_token ||
			!deviceId ||
			applying ||
			applyInFlightRef.current ||
			!previewValid
		) {
			return;
		}

		applyInFlightRef.current = true;
		setApplying(true);
		try {
			await upgradeLicense({
				device_id: deviceId,
				activation_token,
			});
			// Move to Apply step so the progress animation can play, then close.
			setStep(3);
			setApplying(false);
			applyInFlightRef.current = false;
			closeAfterApplyTimeoutRef.current = setTimeout(() => {
				showSuccessNotification('License upgraded successfully');
				setIsOpen(false);
				onUpgraded?.();
			}, 1100);
		} catch (err) {
			showErrorNotification(err);
			applyInFlightRef.current = false;
			setApplying(false);
		}
	};

	const previewValid = preview?.valid !== false && preview?.success !== false;

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered titleId='upgrade-license-title' isAnimation={false}>
			<ModalHeader setIsOpen={handleClose}>
				<ModalTitle id='upgrade-license-title'>Upgrade License</ModalTitle>
			</ModalHeader>

			<ModalBody className='px-4'>
				<div className='mb-4 px-1'>
					<div className='position-relative pt-1 pb-2'>
						{/* Track line behind the step circles */}
						<div
							className='position-absolute bg-light-subtle border'
							aria-hidden
							style={{
								left: '16.666%',
								right: '16.666%',
								top: '1.35rem',
								height: '3px',
								borderRadius: '999px',
								zIndex: 0,
							}}
						/>
						{/* Progress fill */}
						<div
							className='position-absolute bg-primary'
							aria-hidden
							style={{
								left: '16.666%',
								top: '1.35rem',
								height: '3px',
								width: `${((step - 1) / (STEPS.length - 1)) * 66.666}%`,
								borderRadius: '999px',
								zIndex: 1,
								transition: 'width 0.25s ease',
							}}
						/>
						<div className='d-flex justify-content-between position-relative' style={{ zIndex: 2 }}>
							{STEPS.map((s) => {
								const allDone = step === 3;
								const active = !allDone && step === s.id;
								const completed = allDone || step > s.id;
								const alignClass =
									s.id === 1
										? 'align-items-start text-start'
										: s.id === STEPS.length
											? 'align-items-end text-end'
											: 'align-items-center text-center';

								return (
									<div
										key={s.id}
										className={`d-flex flex-column ${alignClass}`}
										style={{ width: '33.333%' }}>
										<span
											className={`d-inline-flex align-items-center justify-content-center rounded-circle border fw-semibold ${
												active || completed
													? 'bg-primary border-primary text-white'
													: 'bg-white border-secondary-subtle text-muted'
											}`}
											style={{
												width: '2.5rem',
												height: '2.5rem',
												fontSize: '0.95rem',
												boxShadow: active
													? '0 0 0 4px rgba(34, 73, 158, 0.18)'
													: undefined,
											}}>
											{completed ? '✓' : s.id}
										</span>
										<span
											className={`mt-2 fw-semibold ${
												active || allDone
													? 'text-primary'
													: completed
														? 'text-body'
														: 'text-muted'
											}`}
											style={{ fontSize: '0.95rem' }}>
											{s.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{step === 1 && (
					<>
						<div className='rounded-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 p-3 mb-4'>
							<span className='fw-semibold text-primary'>Device ID:</span>{' '}
							<span className='fw-bold text-break'>{deviceId}</span>
						</div>

						<FormGroup id='activation_token' label='Activation Token'>
							<Textarea
								id='activation_token'
								value={token}
								rows={7}
								placeholder='Paste your activation token here...'
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setToken(e.target.value)
								}
								autoComplete='off'
								disabled={validating}
								style={{ resize: 'vertical', minHeight: '11rem' }}
							/>
						</FormGroup>
					</>
				)}

				{step === 2 && (
					<Alert color={previewValid ? 'success' : 'warning'} isLight className='mb-0'>
						{/* Single child: .alert is display:flex and would place sibling divs side-by-side */}
						<div className='w-100'>
							<div className='fw-semibold mb-3'>
								{preview?.message
									? String(preview.message)
									: previewValid
										? 'Token validated'
										: 'Validation result'}
							</div>
							<div className='d-flex flex-column gap-2 small'>
								{preview?.customer_id != null && preview.customer_id !== '' && (
									<div className='d-flex flex-wrap justify-content-between gap-2'>
										<span className='text-muted'>Customer ID</span>
										<span className='fw-semibold text-break'>
											{String(preview.customer_id)}
										</span>
									</div>
								)}
								{preview?.no_of_serving_point_license != null && (
									<div className='d-flex flex-wrap justify-content-between gap-2'>
										<span className='text-muted'>Serving point license</span>
										<span className='fw-semibold'>
											{String(preview.no_of_serving_point_license)}
										</span>
									</div>
								)}
								{preview?.current_no_of_serving_point_license != null && (
									<div className='d-flex flex-wrap justify-content-between gap-2'>
										<span className='text-muted'>Current serving point license</span>
										<span className='fw-semibold'>
											{String(preview.current_no_of_serving_point_license)}
										</span>
									</div>
								)}
								{preview?.is_demo != null && (
									<div className='d-flex flex-wrap justify-content-between gap-2'>
										<span className='text-muted'>Demo license</span>
										<span className='fw-semibold'>
											{preview.is_demo ? 'Yes' : 'No'}
										</span>
									</div>
								)}
								{preview?.demo_expiry != null && preview.demo_expiry !== '' && (
									<div className='d-flex flex-wrap justify-content-between gap-2'>
										<span className='text-muted'>Demo expiry</span>
										<span className='fw-semibold'>
											{String(preview.demo_expiry)}
										</span>
									</div>
								)}
								{preview?.license_expires_at != null &&
									preview.license_expires_at !== '' && (
										<div className='d-flex flex-wrap justify-content-between gap-2'>
											<span className='text-muted'>Expires</span>
											<span className='fw-semibold'>
												{String(preview.license_expires_at)}
											</span>
										</div>
									)}
								{preview?.license_downgrade === true && (
									<div className='mt-1 text-warning fw-semibold'>
										This token would downgrade the current license.
									</div>
								)}
							</div>
						</div>
					</Alert>
				)}

				{step === 3 && (
					<Alert color='success' isLight className='mb-0'>
						<div className='w-100'>
							<div className='fw-semibold mb-1'>License upgraded successfully</div>
							<div className='small text-muted'>Closing this dialog…</div>
						</div>
					</Alert>
				)}
			</ModalBody>

			<ModalFooter className='px-4'>
				{step === 1 && (
					<>
						<Button
							color='link'
							className='text-primary'
							isDisable={validating}
							onClick={handleClose}>
							Cancel
						</Button>
						<Button
							color='primary'
							isDisable={!token.trim() || !deviceId || validating}
							onClick={() => {
								void handleValidate();
							}}>
							{validating ? (
								<>
									<Spinner isSmall inButton />
									Validating…
								</>
							) : (
								'Validate'
							)}
						</Button>
					</>
				)}
				{step === 2 && (
					<>
						<Button
							color='link'
							className='text-primary'
							isDisable={applying}
							onClick={() => setStep(1)}>
							Back
						</Button>
						<Button
							color='primary'
							isDisable={!previewValid || applying}
							onClick={() => {
								void handleApply();
							}}>
							{applying ? (
								<>
									<Spinner isSmall inButton />
									Applying…
								</>
							) : (
								'Apply'
							)}
						</Button>
					</>
				)}
			</ModalFooter>
		</Modal>
	);
};

export default UpgradeLicenseModal;

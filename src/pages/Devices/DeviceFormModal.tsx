import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import type { Device } from '../../api/devices/devices';

export interface DeviceFormData {
	model: string;
	identifier: string;
	serial_number: string;
	description: string;
	wifi_ip_address: string;
	wifi_mask: string;
	wifi_gateway: string;
	wifi_ssid: string;
	wifi_password: string;
	firmware_version: string;
}

interface DeviceFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	device: Device | null;
	onSave: (data: DeviceFormData & { id?: number }) => void | Promise<void>;
	saving?: boolean;
	/** True while GET /api/devices/{id}/ is in flight */
	loading?: boolean;
}

const emptyForm: DeviceFormData = {
	model: '',
	identifier: '',
	serial_number: '',
	description: '',
	wifi_ip_address: '',
	wifi_mask: '',
	wifi_gateway: '',
	wifi_ssid: '',
	wifi_password: '',
	firmware_version: '',
};

const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	device,
	onSave,
	saving = false,
	loading = false,
}) => {
	const isEdit = mode === 'edit';
	const busy = saving || loading;
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<DeviceFormData>({
		defaultValues: emptyForm,
	});

	useEffect(() => {
		if (!isOpen) return;
		setShowPassword(false);
		if (isEdit && device) {
			reset({
				model: device.model || '',
				identifier: device.identifier || '',
				serial_number: device.serial_number || '',
				description: device.description || '',
				wifi_ip_address: device.wifi_ip_address || '',
				wifi_mask: device.wifi_mask || '',
				wifi_gateway: device.wifi_gateway || '',
				wifi_ssid: device.wifi_ssid || '',
				wifi_password: device.wifi_password || '',
				firmware_version: device.firmware_version || '',
			});
		} else if (!isEdit) {
			reset(emptyForm);
		}
	}, [isOpen, isEdit, device, reset]);

	const onSubmit = async (data: DeviceFormData) => {
		if (busy) return;
		if (isEdit && device) {
			await onSave({ ...data, id: device.id });
		} else {
			await onSave(data);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered fade isStaticBackdrop={busy}>
			<ModalHeader setIsOpen={busy ? undefined : setIsOpen}>
				<ModalTitle id='device-form-modal'>
					{isEdit ? 'Edit Device' : 'Add Device'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				{loading && (
					<div className='text-muted small mb-3'>Refreshing device details…</div>
				)}
				<form id='device-form' onSubmit={handleSubmit(onSubmit)}>
					<div className='row g-4'>
						<div className='col-12 col-md-6'>
							<label className='form-label'>Model</label>
							<input className='form-control' disabled={busy} {...register('model')} />
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Identifier</label>
							<input
								className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
								disabled={busy}
								{...register('identifier')}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Serial Number</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('serial_number')}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Firmware Version</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('firmware_version')}
							/>
						</div>

						<div className='col-12'>
							<label className='form-label'>Description</label>
							<textarea
								className='form-control'
								rows={3}
								disabled={busy}
								{...register('description')}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>WiFi SSID</label>
							<input className='form-control' disabled={busy} {...register('wifi_ssid')} />
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>WiFi Password</label>
							<div style={{ position: 'relative' }}>
								<input
									type={showPassword ? 'text' : 'password'}
									className='form-control'
									autoComplete='new-password'
									disabled={busy}
									style={{ paddingRight: '2.75rem' }}
									{...register('wifi_password')}
								/>
								<span
									role='button'
									tabIndex={0}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
									onClick={() => !busy && setShowPassword((v) => !v)}
									onKeyDown={(e) => {
										if (busy) return;
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											setShowPassword((v) => !v);
										}
									}}
									style={{
										position: 'absolute',
										top: '50%',
										right: 12,
										transform: 'translateY(-50%)',
										cursor: busy ? 'default' : 'pointer',
										lineHeight: 1,
										color: '#6c757d',
										zIndex: 2,
										opacity: busy ? 0.5 : 1,
									}}>
									{showPassword ? (
										<VisibilityOffIcon fontSize='small' />
									) : (
										<VisibilityIcon fontSize='small' />
									)}
								</span>
							</div>
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi IP Address</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('wifi_ip_address')}
							/>
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi Mask</label>
							<input className='form-control' disabled={busy} {...register('wifi_mask')} />
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi Gateway</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('wifi_gateway')}
							/>
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<Button
					color='secondary'
					onClick={() => setIsOpen(false)}
					className='me-2'
					isDisable={busy}>
					Cancel
				</Button>
				<Button
					color='primary'
					type='submit'
					form='device-form'
					isDisable={busy}>
					{saving ? 'Saving…' : loading ? 'Loading…' : isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default DeviceFormModal;

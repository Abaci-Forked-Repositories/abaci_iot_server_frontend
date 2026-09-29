import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import type { Device } from '../../api/devices/devices';

export interface DeviceFormData {
	name: string;
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
}

const emptyForm: DeviceFormData = {
	name: '',
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
}) => {
	const isEdit = mode === 'edit';

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<DeviceFormData>({
		defaultValues: emptyForm,
	});

	useEffect(() => {
		if (isOpen) {
			if (isEdit && device) {
				reset({
					name: device.name || '',
					description: device.description || '',
					wifi_ip_address: device.wifi_ip_address || '',
					wifi_mask: device.wifi_mask || '',
					wifi_gateway: device.wifi_gateway || '',
					wifi_ssid: device.wifi_ssid || '',
					wifi_password: device.wifi_password || '',
					firmware_version: device.firmware_version || '',
				});
			} else {
				reset(emptyForm);
			}
		}
	}, [isOpen, isEdit, device, reset]);

	const onSubmit = async (data: DeviceFormData) => {
		if (isEdit && device) {
			await onSave({ ...data, id: device.id });
		} else {
			await onSave(data);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered fade>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='device-form-modal'>
					{isEdit ? 'Edit Device' : 'Add Device'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<form id='device-form' onSubmit={handleSubmit(onSubmit)}>
					<div className='row g-4'>
						<div className='col-12 col-md-6'>
							<label className='form-label'>
								Name <span className='text-danger'>*</span>
							</label>
							<input
								className={`form-control ${errors.name ? 'is-invalid' : ''}`}
								{...register('name', { required: 'Name is required' })}
							/>
							{errors.name && (
								<div className='invalid-feedback'>{errors.name.message}</div>
							)}
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Firmware Version</label>
							<input className='form-control' {...register('firmware_version')} />
						</div>

						<div className='col-12'>
							<label className='form-label'>Description</label>
							<textarea
								className='form-control'
								rows={3}
								{...register('description')}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>WiFi SSID</label>
							<input className='form-control' {...register('wifi_ssid')} />
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>WiFi Password</label>
							<input
								type='password'
								className='form-control'
								autoComplete='new-password'
								{...register('wifi_password')}
							/>
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi IP Address</label>
							<input className='form-control' {...register('wifi_ip_address')} />
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi Mask</label>
							<input className='form-control' {...register('wifi_mask')} />
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi Gateway</label>
							<input className='form-control' {...register('wifi_gateway')} />
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<Button
					color='secondary'
					onClick={() => setIsOpen(false)}
					className='me-2'
					isDisable={saving}>
					Cancel
				</Button>
				<Button color='primary' onClick={handleSubmit(onSubmit)} isDisable={saving}>
					{saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default DeviceFormModal;

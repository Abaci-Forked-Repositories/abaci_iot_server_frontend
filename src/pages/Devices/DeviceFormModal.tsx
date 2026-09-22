import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';

export interface DeviceFormData {
	name: string;
	site: string;
	description: string;
	last_online: string;
	last_offline: string;
	created_at: string;
	status: string;
}

interface DeviceFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	device: DeviceFormData & { id?: number } | null;
	onSave: (data: DeviceFormData & { id?: number }) => void;
}

const emptyForm: DeviceFormData = {
	name: '',
	site: '',
	description: '',
	last_online: '',
	last_offline: '',
	created_at: new Date().toISOString().slice(0, 16),
	status: 'Online',
};

/** Convert "YYYY-MM-DD HH:mm" ↔ "YYYY-MM-DDTHH:mm" for datetime-local inputs */
const toInputDateTime = (value: string) =>
	value ? value.replace(' ', 'T').slice(0, 16) : '';
const fromInputDateTime = (value: string) =>
	value ? value.replace('T', ' ') : '';

const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	device,
	onSave,
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
					name: device.name,
					site: device.site,
					description: device.description,
					last_online: toInputDateTime(device.last_online),
					last_offline: toInputDateTime(device.last_offline),
					created_at: toInputDateTime(device.created_at),
					status: device.status,
				});
			} else {
				reset(emptyForm);
			}
		}
	}, [isOpen, isEdit, device, reset]);

	const onSubmit = (data: DeviceFormData) => {
		const formatted = {
			...data,
			last_online: fromInputDateTime(data.last_online),
			last_offline: fromInputDateTime(data.last_offline),
			created_at: fromInputDateTime(data.created_at),
		};
		if (isEdit && device) {
			onSave({ ...formatted, id: device.id });
		} else {
			onSave(formatted);
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
						{/* Name */}
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

						{/* Site */}
						<div className='col-12 col-md-6'>
							<label className='form-label'>
								Site <span className='text-danger'>*</span>
							</label>
							<input
								className={`form-control ${errors.site ? 'is-invalid' : ''}`}
								{...register('site', { required: 'Site is required' })}
							/>
							{errors.site && (
								<div className='invalid-feedback'>{errors.site.message}</div>
							)}
						</div>

						{/* Description */}
						<div className='col-12'>
							<label className='form-label'>Description</label>
							<textarea
								className='form-control'
								rows={3}
								{...register('description')}
							/>
						</div>

						{/* Last Online */}
						<div className='col-12 col-md-6'>
							<label className='form-label'>Last Online</label>
							<input
								type='datetime-local'
								className='form-control'
								{...register('last_online')}
							/>
						</div>

						{/* Last Offline */}
						<div className='col-12 col-md-6'>
							<label className='form-label'>Last Offline</label>
							<input
								type='datetime-local'
								className='form-control'
								{...register('last_offline')}
							/>
						</div>

						{/* Created At */}
						<div className='col-12 col-md-6'>
							<label className='form-label'>Created At</label>
							<input
								type='datetime-local'
								className='form-control'
								{...register('created_at')}
							/>
						</div>

						{/* Status */}
						<div className='col-12 col-md-6'>
							<label className='form-label'>Status</label>
							<select className='form-select' {...register('status')}>
								<option value='Online'>Online</option>
								<option value='Offline'>Offline</option>
							</select>
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<Button
					color='secondary'
					onClick={() => setIsOpen(false)}
					className='me-2'>
					Cancel
				</Button>
				<Button color='primary' onClick={handleSubmit(onSubmit)}>
					{isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default DeviceFormModal;

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import { DUMMY_USERS, type DummyUser } from '../Devices/usersDummyData';

export interface SiteFormData {
	name: string;
	description: string;
	admin_id: number | null;
}

interface SiteFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	site: (SiteFormData & { id?: number }) | null;
	onSave: (data: SiteFormData & { id?: number }) => void;
	users?: DummyUser[];
}

const emptyForm: SiteFormData = {
	name: '',
	description: '',
	admin_id: null,
};

const SiteFormModal: React.FC<SiteFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	site,
	onSave,
	users = DUMMY_USERS,
}) => {
	const isEdit = mode === 'edit';

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SiteFormData>({
		defaultValues: emptyForm,
	});

	useEffect(() => {
		if (isOpen) {
			if (isEdit && site) {
				reset({
					name: site.name,
					description: site.description,
					admin_id: site.admin_id,
				});
			} else {
				reset(emptyForm);
			}
		}
	}, [isOpen, isEdit, site, reset]);

	const onSubmit = (data: SiteFormData) => {
		const adminId =
			data.admin_id === null || data.admin_id === ('' as any)
				? null
				: Number(data.admin_id);
		const payload: SiteFormData & { id?: number } = {
			name: data.name,
			description: data.description,
			admin_id: Number.isNaN(adminId as number) ? null : adminId,
		};
		if (isEdit && site) {
			onSave({ ...payload, id: site.id });
		} else {
			onSave(payload);
		}
	};

	const selectableUsers = users.filter((u) => u.status === 'Active');

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered fade>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='site-form-modal'>
					{isEdit ? 'Edit Site' : 'Add Site'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<form id='site-form' onSubmit={handleSubmit(onSubmit)}>
					<div className='row g-4'>
						<div className='col-12'>
							<label className='form-label'>
								Site Name <span className='text-danger'>*</span>
							</label>
							<input
								className={`form-control ${errors.name ? 'is-invalid' : ''}`}
								{...register('name', { required: 'Site name is required' })}
							/>
							{errors.name && (
								<div className='invalid-feedback'>{errors.name.message}</div>
							)}
						</div>

						<div className='col-12'>
							<label className='form-label'>Description</label>
							<textarea
								className='form-control'
								rows={3}
								{...register('description')}
							/>
						</div>

						<div className='col-12'>
							<label className='form-label'>
								Site Admin <span className='text-danger'>*</span>
							</label>
							<select
								className={`form-select ${errors.admin_id ? 'is-invalid' : ''}`}
								{...register('admin_id', {
									required: 'Site admin is required',
									validate: (v) =>
										v !== null && String(v) !== ''
											? true
											: 'Site admin is required',
								})}>
								<option value='' disabled>
									Select a user…
								</option>
								{selectableUsers.map((user) => (
									<option key={user.id} value={user.id}>
										{user.name} ({user.type})
									</option>
								))}
							</select>
							{errors.admin_id && (
								<div className='invalid-feedback d-block'>
									{errors.admin_id.message}
								</div>
							)}
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

export default SiteFormModal;

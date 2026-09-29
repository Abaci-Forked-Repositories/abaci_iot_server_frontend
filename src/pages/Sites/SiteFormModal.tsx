import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import type { Site } from '../../api/sites/sites';

export type SiteFormData = {
	name: string;
	description: string;
};

interface SiteFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	site: Site | null;
	onSave: (data: SiteFormData & { id?: number }) => void | Promise<void>;
	saving?: boolean;
}

const emptyForm: SiteFormData = {
	name: '',
	description: '',
};

const SiteFormModal: React.FC<SiteFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	site,
	onSave,
	saving = false,
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
		if (!isOpen) return;
		if (isEdit && site) {
			reset({
				name: site.name || '',
				description: site.description || '',
			});
		} else {
			reset(emptyForm);
		}
	}, [isOpen, isEdit, site, reset]);

	const onSubmit = async (data: SiteFormData) => {
		const payload: SiteFormData & { id?: number } = {
			name: data.name.trim(),
			description: data.description.trim(),
		};
		if (isEdit && site) {
			await onSave({ ...payload, id: site.id });
		} else {
			await onSave(payload);
		}
	};

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
							<label className='form-label'>
								Description <span className='text-danger'>*</span>
							</label>
							<textarea
								className={`form-control ${errors.description ? 'is-invalid' : ''}`}
								rows={3}
								{...register('description', {
									required: 'Description is required',
								})}
							/>
							{errors.description && (
								<div className='invalid-feedback'>
									{errors.description.message}
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

export default SiteFormModal;

import React from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import ReactSelectWithState from '../../CustomComponent/Select/ReactSelect';

export interface ServingPointFormValues {
	name: string;
	queue_ids: number[];
	description: string;
	is_active: boolean;
	assigned_users: number[];
}

interface ServingPointModalProps {
	isOpen: boolean;
	setIsOpen: (status: boolean) => void;
	mode?: 'add' | 'edit';
	form: ServingPointFormValues;
	setForm: React.Dispatch<React.SetStateAction<ServingPointFormValues>>;
	queueOptions: Array<{ value: number; label: string }>;
	selectedQueueOptions: Array<{ value: number; label: string }>;
	userOptions: Array<{ value: number; label: string }>;
	selectedUserOptions: Array<{ value: number; label: string }>;
	isSubmitting?: boolean;
	onSubmit: () => void;
	onCancel: () => void;
}

const ServingPointModal: React.FC<ServingPointModalProps> = ({
	isOpen,
	setIsOpen,
	mode = 'add',
	form,
	setForm,
	queueOptions,
	selectedQueueOptions,
	userOptions,
	selectedUserOptions,
	isSubmitting = false,
	onSubmit,
	onCancel,
}) => {
	const isEdit = mode === 'edit';

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered size='lg' isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='serving-point-modal-title'>
					{isEdit ? 'Edit Serving Point' : 'Add Serving Point'}
				</ModalTitle>
			</ModalHeader>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					onSubmit();
				}}>
				<ModalBody>
					<div className='row g-3'>
						<div className='col-12'>
							<label className='form-label fw-semibold' htmlFor='sp-name'>
								Name
							</label>
							<input
								id='sp-name'
								className='form-control'
								value={form.name}
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								placeholder='Enter serving point name'
								required
							/>
						</div>
						<div className='col-md-6'>
							<label className='form-label fw-semibold'>Queues</label>
							<ReactSelectWithState
								options={queueOptions}
								value={selectedQueueOptions}
								setValue={(selected: Array<{ value: number; label: string }> | null) =>
									setForm((prev) => ({
										...prev,
										queue_ids: (selected || []).map((option) => option.value),
									}))
								}
								isMulti
								placeholder='Select one or more queues'
							/>
						</div>
						<div className='col-md-6 d-flex align-items-end'>
							<div className='form-check form-switch mb-2'>
								<input
									className='form-check-input'
									type='checkbox'
									id='sp-active'
									checked={form.is_active}
									onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
								/>
								<label className='form-check-label fw-semibold' htmlFor='sp-active'>
									Active
								</label>
							</div>
						</div>
						<div className='col-12'>
							<label className='form-label fw-semibold'>Assigned Users</label>
							<ReactSelectWithState
								options={userOptions}
								value={selectedUserOptions}
								setValue={(selected: Array<{ value: number; label: string }> | null) =>
									setForm((prev) => ({
										...prev,
										assigned_users: (selected || []).map((option) => option.value),
									}))
								}
								isMulti
								placeholder='Select users'
							/>
						</div>
						<div className='col-12'>
							<label className='form-label fw-semibold' htmlFor='sp-description'>
								Description
							</label>
							<textarea
								id='sp-description'
								className='form-control'
								rows={3}
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								placeholder='Short description'
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color='light' isLight onClick={onCancel}>
						Cancel
					</Button>
					<Button color='primary' type='submit' isDisable={isSubmitting}>
						{isSubmitting ? (
							<>
								<Spinner isSmall inButton />
								{isEdit ? 'Updating...' : 'Creating...'}
							</>
						) : isEdit ? (
							'Update Serving Point'
						) : (
							'Create Serving Point'
						)}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
};

export default ServingPointModal;

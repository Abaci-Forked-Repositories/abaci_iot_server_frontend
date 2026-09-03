import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../../bootstrap/Modal';
import Spinner from '../../../bootstrap/Spinner';
import Icon from '../../../icon/Icon';
import useToasterNotification from '../../../../hooks/useToasterNotification';
import {
	type PatchTokenUserPayload,
	type TokenUser,
	tokensApi,
} from '../../../../services/queueManagementApi';

type EditDraft = {
	name: string;
	email: string;
	phone: string;
	age: string;
	place: string;
	remarks: string;
};

const emptyDraft = (): EditDraft => ({
	name: '',
	email: '',
	phone: '',
	age: '',
	place: '',
	remarks: '',
});

const tokenUserToDraft = (tokenUser: TokenUser): EditDraft => ({
	name: tokenUser.name ?? '',
	email: tokenUser.email ?? '',
	phone: tokenUser.phone ?? '',
	age: tokenUser.age != null && tokenUser.age !== '' ? String(tokenUser.age) : '',
	place: tokenUser.place ?? '',
	remarks: tokenUser.remarks ?? '',
});

const fieldLabelClass = 'form-label text-muted small text-uppercase fw-semibold mb-2';

export interface EditTokenUserModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	userId: number;
	tokenUser: TokenUser | null;
	onSaved: (updated: TokenUser) => void;
}

const EditTokenUserModal: React.FC<EditTokenUserModalProps> = ({
	isOpen,
	setIsOpen,
	userId,
	tokenUser,
	onSaved,
}) => {
	const [editDraft, setEditDraft] = useState<EditDraft>(emptyDraft);
	const [saving, setSaving] = useState(false);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	useEffect(() => {
		if (!isOpen || !tokenUser) return;
		setEditDraft(tokenUserToDraft(tokenUser));
	}, [isOpen, tokenUser]);

	const closeModal = useCallback(() => {
		if (saving) return;
		setIsOpen(false);
	}, [saving, setIsOpen]);

	const handleSave = useCallback(async () => {
		const name = editDraft.name.trim();
		if (!name) {
			showErrorNotification('Name is required.');
			return;
		}
		const ageStr = editDraft.age.trim();
		if (ageStr !== '') {
			const n = Number(ageStr);
			if (!Number.isFinite(n)) {
				showErrorNotification('Age must be a valid number.');
				return;
			}
		}
		const payload: PatchTokenUserPayload = {
			name,
			email: editDraft.email.trim() || null,
			phone: editDraft.phone.trim() || null,
			place: editDraft.place.trim() || null,
			remarks: editDraft.remarks.trim() || null,
		};
		if (ageStr !== '') {
			payload.age = Number(ageStr);
		} else {
			payload.age = null;
		}
		setSaving(true);
		try {
			const updated = await tokensApi.patchUser(userId, payload);
			onSaved(updated);
			setIsOpen(false);
			showSuccessNotification('Token user updated.');
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSaving(false);
		}
	}, [
		editDraft,
		onSaved,
		setIsOpen,
		showErrorNotification,
		showSuccessNotification,
		userId,
	]);

	return (
		<Modal
			isCentered
			isOpen={isOpen}
			setIsOpen={(open) => {
				if (!open) closeModal();
			}}
			size='lg'
			isAnimation={false}
			titleId='token-user-edit-modal-title'>
			<ModalHeader setIsOpen={(open) => !open && closeModal()}>
				<ModalTitle id='token-user-edit-modal-title'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon='Edit' color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>Edit Token User</div>
							<div className='text-muted small fw-normal mt-1'>
								Update customer contact details and notes
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					void handleSave();
				}}>
				<ModalBody className='pt-2 pb-3'>
					{tokenUser?.name ? (
						<div className='d-flex align-items-center gap-3 p-3 rounded-4 mb-3 border border-secondary border-opacity-25 bg-body-secondary'>
							<span
								className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
								style={{ width: 44, height: 44 }}>
								<Icon icon='Person' color='primary' />
							</span>
							<div className='min-w-0'>
								<div className='text-muted small text-uppercase fw-semibold mb-1'>Editing</div>
								<div className='fw-bold text-body lh-sm text-truncate'>{tokenUser.name}</div>
							</div>
						</div>
					) : null}
					<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3'>
						<div className='row g-3'>
							<div className='col-12'>
								<label htmlFor='token-user-edit-name' className={fieldLabelClass}>
									Name *
								</label>
								<input
									id='token-user-edit-name'
									type='text'
									className='form-control rounded-3'
									placeholder='Enter customer name'
									value={editDraft.name}
									disabled={saving}
									onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
									autoComplete='name'
									required
								/>
							</div>
							<div className='col-md-6'>
								<label htmlFor='token-user-edit-email' className={fieldLabelClass}>
									Email
								</label>
								<input
									id='token-user-edit-email'
									type='email'
									className='form-control rounded-3'
									placeholder='Optional'
									value={editDraft.email}
									disabled={saving}
									onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
									autoComplete='email'
								/>
							</div>
							<div className='col-md-6'>
								<label htmlFor='token-user-edit-phone' className={fieldLabelClass}>
									Phone
								</label>
								<input
									id='token-user-edit-phone'
									type='tel'
									className='form-control rounded-3'
									placeholder='Optional'
									value={editDraft.phone}
									disabled={saving}
									onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
									autoComplete='tel'
								/>
							</div>
							<div className='col-md-6'>
								<label htmlFor='token-user-edit-age' className={fieldLabelClass}>
									Age
								</label>
								<input
									id='token-user-edit-age'
									type='text'
									inputMode='numeric'
									className='form-control rounded-3'
									placeholder='Optional'
									value={editDraft.age}
									disabled={saving}
									onChange={(e) => setEditDraft((d) => ({ ...d, age: e.target.value }))}
								/>
							</div>
							<div className='col-md-6'>
								<label htmlFor='token-user-edit-place' className={fieldLabelClass}>
									Place
								</label>
								<input
									id='token-user-edit-place'
									type='text'
									className='form-control rounded-3'
									placeholder='Optional'
									value={editDraft.place}
									disabled={saving}
									onChange={(e) => setEditDraft((d) => ({ ...d, place: e.target.value }))}
								/>
							</div>
							<div className='col-12'>
								<label htmlFor='token-user-edit-remarks' className={fieldLabelClass}>
									Remarks
								</label>
								<textarea
									id='token-user-edit-remarks'
									className='form-control rounded-3'
									rows={3}
									placeholder='Optional notes'
									value={editDraft.remarks}
									disabled={saving}
									onChange={(e) => setEditDraft((d) => ({ ...d, remarks: e.target.value }))}
								/>
							</div>
						</div>
					</div>
				</ModalBody>
				<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
					<Button color='secondary' isLight type='button' onClick={closeModal} isDisable={saving}>
						Cancel
					</Button>
					<Button color='primary' type='submit' icon='Save' isDisable={saving}>
						{saving ? (
							<>
								<Spinner isSmall inButton />
								Saving…
							</>
						) : (
							'Save'
						)}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
};

export default EditTokenUserModal;

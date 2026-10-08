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
import type { ApiUser } from '../../api/users/users';

export type UserFormData = {
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	password: string;
	/** Superuser | Staff | User */
	role: 'Superuser' | 'Staff' | 'User';
	is_active: boolean;
};

interface UserFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	user: ApiUser | null;
	onSave: (data: UserFormData & { id?: number }) => void | Promise<void>;
	saving?: boolean;
	/** True while GET /api/users/{id}/ is in flight */
	loading?: boolean;
}

const emptyForm: UserFormData = {
	username: '',
	email: '',
	first_name: '',
	last_name: '',
	password: '',
	role: 'User',
	is_active: true,
};

const roleFromUser = (user: ApiUser): UserFormData['role'] => {
	if (user.is_superuser) return 'Superuser';
	if (user.is_staff) return 'Staff';
	return 'User';
};

const UserFormModal: React.FC<UserFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	user,
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
	} = useForm<UserFormData>({
		defaultValues: emptyForm,
	});

	useEffect(() => {
		if (!isOpen) return;
		setShowPassword(false);
		if (isEdit && user) {
			reset({
				username: user.username || '',
				email: user.email || '',
				first_name: user.first_name || '',
				last_name: user.last_name || '',
				password: '',
				role: roleFromUser(user),
				is_active: Boolean(user.is_active),
			});
		} else if (!isEdit) {
			reset(emptyForm);
		}
	}, [isOpen, isEdit, user, reset]);

	const onSubmit = async (data: UserFormData) => {
		if (busy) return;
		if (isEdit && user) {
			await onSave({ ...data, id: user.id });
		} else {
			await onSave(data);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			size='lg'
			isCentered
			fade
			isStaticBackdrop={busy}>
			<ModalHeader setIsOpen={busy ? undefined : setIsOpen}>
				<ModalTitle id='user-form-modal'>
					{isEdit ? 'Edit User' : 'Add User'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				{loading ? (
					<div className='text-center text-muted py-4'>Loading user…</div>
				) : (
					<form id='user-form' onSubmit={handleSubmit(onSubmit)}>
						<div className='row g-4'>
							<div className='col-12 col-md-6'>
								<label className='form-label'>
									Username <span className='text-danger'>*</span>
								</label>
								<input
									className={`form-control ${errors.username ? 'is-invalid' : ''}`}
									{...register('username', { required: 'Username is required' })}
								/>
								{errors.username && (
									<div className='invalid-feedback'>{errors.username.message}</div>
								)}
							</div>

							<div className='col-12 col-md-6'>
								<label className='form-label'>
									Email <span className='text-danger'>*</span>
								</label>
								<input
									type='email'
									className={`form-control ${errors.email ? 'is-invalid' : ''}`}
									{...register('email', { required: 'Email is required' })}
								/>
								{errors.email && (
									<div className='invalid-feedback'>{errors.email.message}</div>
								)}
							</div>

							<div className='col-12 col-md-6'>
								<label className='form-label'>First Name</label>
								<input className='form-control' {...register('first_name')} />
							</div>

							<div className='col-12 col-md-6'>
								<label className='form-label'>Last Name</label>
								<input className='form-control' {...register('last_name')} />
							</div>

							<div className='col-12 col-md-6'>
								<label className='form-label'>
									Password
									{!isEdit && <span className='text-danger'> *</span>}
								</label>
								<div style={{ position: 'relative' }}>
									<input
										type={showPassword ? 'text' : 'password'}
										autoComplete='new-password'
										className={`form-control ${errors.password ? 'is-invalid' : ''}`}
										placeholder={isEdit ? 'Leave blank to keep current' : ''}
										style={{ paddingRight: '2.75rem' }}
										{...register('password', {
											required: isEdit ? false : 'Password is required',
											minLength: isEdit
												? undefined
												: { value: 6, message: 'At least 6 characters' },
										})}
									/>
									<span
										role='button'
										tabIndex={0}
										aria-label={showPassword ? 'Hide password' : 'Show password'}
										onClick={() => setShowPassword((v) => !v)}
										onKeyDown={(e) => {
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
											cursor: 'pointer',
											lineHeight: 1,
											color: '#6c757d',
											zIndex: 2,
										}}>
										{showPassword ? (
											<VisibilityOffIcon fontSize='small' />
										) : (
											<VisibilityIcon fontSize='small' />
										)}
									</span>
								</div>
								{errors.password && (
									<div className='invalid-feedback d-block'>
										{errors.password.message}
									</div>
								)}
							</div>

							<div className='col-12 col-md-6'>
								<label className='form-label'>Role</label>
								<select className='form-select' {...register('role')}>
									<option value='User'>User</option>
									<option value='Staff'>Staff</option>
									<option value='Superuser'>Superuser</option>
								</select>
							</div>

							<div className='col-12'>
								<div className='form-check'>
									<input
										id='user-is-active'
										type='checkbox'
										className='form-check-input'
										{...register('is_active')}
									/>
									<label className='form-check-label' htmlFor='user-is-active'>
										Active
									</label>
								</div>
							</div>
						</div>
					</form>
				)}
			</ModalBody>
			<ModalFooter>
				<Button
					color='secondary'
					onClick={() => setIsOpen(false)}
					className='me-2'
					isDisable={busy}>
					Cancel
				</Button>
				<Button color='primary' type='submit' form='user-form' isDisable={busy}>
					{saving ? 'Saving…' : loading ? 'Loading…' : isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default UserFormModal;

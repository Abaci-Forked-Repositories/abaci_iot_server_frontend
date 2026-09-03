import React, { FC, useEffect, useRef, useState } from 'react';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import CustomSpinner from '../../CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import Fields, { resolveRoleOption, type UserRoleSelectOption } from './Fields';

export interface UserFormModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	tableRef: React.RefObject<{ onQueryChange: () => void } | null>;
	mode: 'add' | 'edit';
	userId?: number | null;
}

type AddUserFormValues = {
	first_name: string;
	last_name: string;
	email: string;
	role: UserRoleSelectOption | null;
	password: string;
	password2: string;
};

type EditUserFormValues = {
	first_name: string;
	last_name: string;
	email: string;
	role: UserRoleSelectOption | null;
};

const emptyAddValues: AddUserFormValues = {
	first_name: '',
	last_name: '',
	email: '',
	role: null,
	password: '',
	password2: '',
};

const UserFormModal: FC<UserFormModalProps> = ({
	isOpen,
	setIsOpen,
	tableRef,
	mode,
	userId = null,
}) => {
	const isEdit = mode === 'edit';
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;

	const {
		register,
		handleSubmit,
		getValues,
		control,
		reset,
		formState: { errors },
		trigger,
	} = useForm<AddUserFormValues | EditUserFormValues>({
		defaultValues: emptyAddValues,
	});

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [roleOptions, setRoleOptions] = useState<UserRoleSelectOption[]>([]);
	const [roleOptionsLoading, setRoleOptionsLoading] = useState(false);
	const [editingUserName, setEditingUserName] = useState('');
	const loadedUserIdRef = useRef<number | null>(null);

	const handleClose = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		if (!isOpen) {
			loadedUserIdRef.current = null;
			setEditingUserName('');
			return;
		}

		if (!isEdit) {
			reset(emptyAddValues);
		}

		setRoleOptionsLoading(true);
		authAxios
			.get('api/users/roles/')
			.then((res) => {
				const results: any[] = res.data?.results ?? res.data ?? [];
				setRoleOptions(
					Array.isArray(results)
						? results.map((r) => ({ label: r.name, value: r.id }))
						: [],
				);
			})
			.catch((err) => showErrorRef.current(err))
			.finally(() => setRoleOptionsLoading(false));
	}, [isOpen, isEdit, reset]);

	useEffect(() => {
		if (!isOpen || !isEdit || !userId) {
			loadedUserIdRef.current = null;
			return;
		}
		if (loadedUserIdRef.current === userId) return;

		let cancelled = false;
		setIsLoading(true);
		authAxios
			.get(`api/users/${userId}/`)
			.then((res) => {
				if (cancelled) return;
				const data = res.data;
				reset({
					first_name: data.first_name ?? '',
					last_name: data.last_name ?? '',
					email: data.email ?? '',
					role: resolveRoleOption(data.role),
				});
				const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
				setEditingUserName(fullName || data.email || `User #${userId}`);
				loadedUserIdRef.current = userId;
			})
			.catch((err) => {
				if (!cancelled) showErrorRef.current(err);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, isEdit, userId, reset]);

	const onSubmit = (data: AddUserFormValues | EditUserFormValues) => {
		if (isEdit && userId) {
			const payload: Record<string, string | number> = {
				first_name: data.first_name.trim(),
				last_name: data.last_name.trim(),
				email: data.email.trim(),
				role_id: data.role!.value,
			};

			setWaitingForAxios(true);
			authAxios
				.put(`api/users/${userId}/`, payload)
				.then((res) => {
					setWaitingForAxios(false);
					tableRef?.current?.onQueryChange?.();
					showSuccessNotification(res.data?.message || 'User updated successfully.');
					handleClose();
				})
				.catch((err) => {
					setWaitingForAxios(false);
					showErrorNotification(err);
				});
			return;
		}

		const addData = data as AddUserFormValues;
		const payload = {
			email: addData.email.trim(),
			first_name: addData.first_name.trim(),
			last_name: addData.last_name.trim(),
			role_id: addData.role?.value ?? undefined,
			password: addData.password,
			password2: addData.password2,
		};

		setWaitingForAxios(true);
		authAxios
			.post('/api/users/', payload)
			.then((res) => {
				setWaitingForAxios(false);
				tableRef?.current?.onQueryChange?.();
				showSuccessNotification(res.data?.message || 'User created successfully.');
				reset(emptyAddValues);
				handleClose();
			})
			.catch((err) => {
				setWaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	const formDisabled = waitingForAxios || (isEdit && isLoading);

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={(open) => {
				if (!open) handleClose();
			}}
			size='lg'
			isCentered
			isAnimation={false}>
			<ModalHeader
				setIsOpen={(open) => {
					if (!open) handleClose();
				}}>
				<ModalTitle id='user-form-modal'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon={isEdit ? 'Edit' : 'PersonAdd'} color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>{isEdit ? 'Edit User' : 'Add User'}</div>
							<div className='text-muted small fw-normal mt-1'>
								{isEdit
									? 'Update account details and role assignment'
									: 'Create a new user account with role and credentials'}
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<ModalBody className='pt-2 pb-3'>
					{isEdit && isLoading ? (
						<div className='d-flex flex-column align-items-center justify-content-center py-5 gap-2 text-muted'>
							<CustomSpinner />
							<span>Loading user…</span>
						</div>
					) : (
						<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3'>
							{isEdit && editingUserName ? (
								<div className='d-flex align-items-center gap-3 p-3 rounded-4 border border-secondary border-opacity-25 bg-body mb-3'>
									<span
										className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
										style={{ width: 44, height: 44 }}>
										<Icon icon='Person' color='primary' />
									</span>
									<div className='min-w-0'>
										<div className='text-muted small text-uppercase fw-semibold mb-1'>
											Editing
										</div>
										<div className='fw-bold fs-5 text-body lh-sm text-truncate'>
											{editingUserName}
										</div>
									</div>
								</div>
							) : null}
							<Fields
								register={register}
								errors={errors}
								getValues={getValues}
								control={control}
								trigger={trigger}
								edit={isEdit}
								roleOptions={roleOptions}
								roleOptionsLoading={roleOptionsLoading}
								disabled={formDisabled}
							/>
						</div>
					)}
				</ModalBody>
				<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
					<Button
						color='secondary'
						isLight
						type='button'
						isDisable={waitingForAxios}
						onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color='primary'
						type='submit'
						icon={isEdit ? 'Save' : 'PersonAdd'}
						isDisable={formDisabled || (isEdit && isLoading)}>
						{waitingForAxios ? (
							<>
								<Spinner isSmall inButton />
								{isEdit ? 'Saving…' : 'Creating…'}
							</>
						) : isEdit ? (
							'Save changes'
						) : (
							'Create user'
						)}
					</Button>
				</ModalFooter>
			</Form>
		</Modal>
	);
};

export default UserFormModal;

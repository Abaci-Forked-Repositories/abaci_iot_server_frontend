import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import type { Subscription } from '../../api/subscriptions/subscriptions';

export type SubscriptionFormData = {
	user: number | '';
	start_date: string;
	end_date: string;
};

export type SubscriptionUserOption = {
	id: number;
	label: string;
};

interface SubscriptionFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	subscription: Subscription | null;
	onSave: (data: SubscriptionFormData & { id?: number }) => void | Promise<void>;
	users?: SubscriptionUserOption[];
	saving?: boolean;
	/** True while GET /api/subscriptions/{id}/ is in flight */
	loading?: boolean;
}

const emptyForm: SubscriptionFormData = {
	user: '',
	start_date: '',
	end_date: '',
};

/** API date → date input value (YYYY-MM-DD) */
const toInputDate = (value: string | null | undefined) => {
	if (!value) return '';
	// Already YYYY-MM-DD
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value.slice(0, 10);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** date input → YYYY-MM-DD or null */
const fromInputDate = (value: string) => {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	return trimmed.slice(0, 10);
};

/** Local calendar date as YYYY-MM-DD */
const todayDateString = () => {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	subscription,
	onSave,
	users = [],
	saving = false,
	loading = false,
}) => {
	const isEdit = mode === 'edit';
	const busy = saving || loading;
	const today = todayDateString();

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<SubscriptionFormData>({
		defaultValues: emptyForm,
	});

	const startDateValue = watch('start_date');

	useEffect(() => {
		if (!isOpen) return;
		if (isEdit && subscription) {
			reset({
				user: subscription.user ?? '',
				start_date: toInputDate(subscription.start_date),
				end_date: toInputDate(subscription.end_date),
			});
		} else if (!isEdit) {
			reset(emptyForm);
		}
	}, [isOpen, isEdit, subscription, reset]);

	const onSubmit = async (data: SubscriptionFormData) => {
		if (busy) return;
		const payload: SubscriptionFormData & { id?: number } = {
			user: data.user === '' ? '' : Number(data.user),
			start_date: fromInputDate(data.start_date) ?? '',
			end_date: fromInputDate(data.end_date) ?? '',
		};
		if (isEdit && subscription) {
			await onSave({ ...payload, id: subscription.id });
		} else {
			await onSave(payload);
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
				<ModalTitle id='subscription-form-modal'>
					{isEdit ? 'Edit Subscription' : 'Add Subscription'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				{loading && (
					<div className='text-muted small mb-3'>Refreshing subscription details…</div>
				)}
				<form id='subscription-form' onSubmit={handleSubmit(onSubmit)}>
					<div className='row g-4'>
						<div className='col-12'>
							<label className='form-label'>
								User <span className='text-danger'>*</span>
							</label>
							<select
								className={`form-select ${errors.user ? 'is-invalid' : ''}`}
								disabled={busy}
								{...register('user', {
									required: 'User is required',
									validate: (v) => v !== '' || 'User is required',
								})}>
								<option value=''>Select user</option>
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{u.label}
									</option>
								))}
							</select>
							{errors.user && (
								<div className='invalid-feedback'>{errors.user.message}</div>
							)}
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Start Date</label>
							<input
								type='date'
								min={today}
								disabled={busy}
								className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
								{...register('start_date', {
									validate: (value) => {
										if (!value) return true;
										return (
											value >= today ||
											'Start date must be today or a future date'
										);
									},
								})}
							/>
							{errors.start_date && (
								<div className='invalid-feedback'>{errors.start_date.message}</div>
							)}
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>End Date</label>
							<input
								type='date'
								min={startDateValue || today}
								disabled={busy}
								className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
								{...register('end_date', {
									validate: (value) => {
										if (!value) return true;
										if (startDateValue && value < startDateValue) {
											return 'End date must be on or after start date';
										}
										return true;
									},
								})}
							/>
							{errors.end_date && (
								<div className='invalid-feedback'>{errors.end_date.message}</div>
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
					isDisable={busy}>
					Cancel
				</Button>
				<Button
					color='primary'
					type='submit'
					form='subscription-form'
					isDisable={busy}>
					{saving ? 'Saving…' : loading ? 'Loading…' : isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default SubscriptionFormModal;

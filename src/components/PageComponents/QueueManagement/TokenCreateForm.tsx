import React, { type FormEvent, useEffect, useState } from 'react';
import type { CreateTokenPayload, Queue, QueueSchedule, ServingPoint } from '../../../services/queueManagementApi';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';

export interface TokenCreateFormProps {
	tokenForm: CreateTokenPayload;
	setTokenForm: React.Dispatch<React.SetStateAction<CreateTokenPayload>>;
	queues: Queue[];
	/** Schedules for the currently selected queue (used to pick `schedule_id`). */
	schedules: QueueSchedule[];
	selectedQueueId: number;
	onQueueChange: (queueId: number) => void;
	/** When set, the schedule is fixed (e.g. schedule detail page) and the schedule dropdown is hidden. */
	fixedScheduleId?: number;
	/** Serving points on the queue — shown as a reference list when creating a token. */
	servingPoints?: ServingPoint[];
	showServingPoints?: boolean;
	onCancel?: () => void;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	isSubmitting: boolean;
	/** Primary action label (default: Create Token). */
	submitLabel?: string;
	/** Show token number field (create mode on schedule detail). */
	showTokenNumber?: boolean;
	/** Loading state while fetching next token number. */
	tokenNumberLoading?: boolean;
	/** When true, omit Cancel/Submit — parent renders a ModalFooter instead. */
	hideActions?: boolean;
	/** Skip the inner `<form>` when a parent modal already wraps submit. */
	embedInParentForm?: boolean;
	/** Shown when the parent form validates customer name. */
	nameError?: string;
}

const fieldLabelClass = 'form-label text-muted small text-uppercase fw-semibold mb-2';

const TokenCreateForm: React.FC<TokenCreateFormProps> = ({
	tokenForm,
	setTokenForm,
	queues,
	schedules,
	selectedQueueId,
	onQueueChange,
	fixedScheduleId,
	servingPoints,
	showServingPoints = true,
	onCancel,
	onSubmit,
	isSubmitting,
	submitLabel = 'Create Token',
	showTokenNumber = false,
	tokenNumberLoading = false,
	hideActions = false,
	embedInParentForm = false,
	nameError: nameErrorProp,
}) => {
	const [nameError, setNameError] = useState<string | undefined>();
	const shownNameError = nameErrorProp ?? nameError;

	useEffect(() => {
		if (tokenForm.name.trim()) {
			setNameError(undefined);
		}
	}, [tokenForm.name]);

	const scheduleOptions =
		fixedScheduleId != null
			? schedules.filter((s) => s.id === fixedScheduleId)
			: schedules.filter((s) => s.queue === selectedQueueId);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!tokenForm.name.trim()) {
			setNameError('*This field is required');
			return;
		}
		setNameError(undefined);
		onSubmit(event);
	};

	const isCreate = submitLabel.toLowerCase().includes('create');

	const fields = (
		<>
			<div className='row g-3'>
				{showTokenNumber && (
					<div className='col-md-6'>
						<label className={fieldLabelClass} htmlFor='token-number'>
							Token Number
						</label>
						<div className='position-relative'>
							<input
								id='token-number'
								className={`form-control rounded-3${
									tokenForm.token_number != null && Number(tokenForm.token_number) >= 1000
										? ' is-invalid'
										: ''
								}`}
								type='number'
								min='1'
								max='999'
								placeholder={tokenNumberLoading ? 'Loading…' : 'Token number'}
								disabled={tokenNumberLoading || isSubmitting}
								value={tokenForm.token_number ?? ''}
								onChange={(e) =>
									setTokenForm((p) => ({
										...p,
										token_number: e.target.value === '' ? undefined : Number(e.target.value),
									}))
								}
							/>
							{tokenNumberLoading && (
								<span className='position-absolute top-50 end-0 translate-middle-y me-3 text-muted'>
									<span className='spinner-border spinner-border-sm' />
								</span>
							)}
							{tokenForm.token_number != null && Number(tokenForm.token_number) >= 1000 && (
								<div className='invalid-feedback d-block'>
									Token number must be less than 1000.
								</div>
							)}
						</div>
					</div>
				)}
				{fixedScheduleId == null && (
					<div className='col-md-6'>
						<label className={fieldLabelClass} htmlFor='token-queue'>
							Queue
						</label>
						<select
							id='token-queue'
							className='form-select rounded-3'
							required
							disabled={isSubmitting}
							value={selectedQueueId || ''}
							onChange={(e) => {
								const q = Number(e.target.value);
								onQueueChange(q);
							}}>
							<option value=''>Select queue</option>
							{queues.map((queue) => (
								<option value={queue.id} key={queue.id}>
									{queue.name}
								</option>
							))}
						</select>
					</div>
				)}
				{fixedScheduleId == null && (
					<div className='col-md-6'>
						<label className={fieldLabelClass} htmlFor='token-schedule'>
							Schedule
						</label>
						<select
							id='token-schedule'
							className='form-select rounded-3'
							required
							disabled={isSubmitting}
							value={tokenForm.schedule_id || ''}
							onChange={(e) =>
								setTokenForm((p) => ({ ...p, schedule_id: Number(e.target.value) }))
							}>
							<option value=''>Select schedule</option>
							{scheduleOptions.map((s) => (
								<option value={s.id} key={s.id}>
									{s.description?.trim() ||
										`${s.queue_name ?? 'Queue'} · ${s.from_datetime?.slice(0, 16) ?? s.id}`}
								</option>
							))}
						</select>
						{selectedQueueId > 0 && !scheduleOptions.length && (
							<div className='form-text text-warning'>
								No schedules for this queue. Create a schedule on the queue detail page first.
							</div>
						)}
					</div>
				)}
				<div className={showTokenNumber || fixedScheduleId == null ? 'col-md-6' : 'col-12'}>
					<label className={fieldLabelClass} htmlFor='token-customer-name'>
						Customer Name *
					</label>
					<input
						id='token-customer-name'
						className={`form-control rounded-3${shownNameError ? ' is-invalid' : ''}`}
						placeholder='Enter customer name'
						disabled={isSubmitting}
						value={tokenForm.name}
						onChange={(e) => {
							const value = e.target.value;
							setTokenForm((p) => ({ ...p, name: value }));
							if ((shownNameError || nameError) && value.trim()) {
								setNameError(undefined);
							}
						}}
					/>
					{shownNameError && <div className='invalid-feedback d-block'>{shownNameError}</div>}
				</div>
				<div className='col-md-6'>
					<label className={fieldLabelClass} htmlFor='token-email'>
						Email
					</label>
					<input
						id='token-email'
						className='form-control rounded-3'
						type='email'
						placeholder='Optional'
						disabled={isSubmitting}
						value={tokenForm.email ?? ''}
						onChange={(e) => setTokenForm((p) => ({ ...p, email: e.target.value }))}
					/>
				</div>
				<div className='col-md-6'>
					<label className={fieldLabelClass} htmlFor='token-phone'>
						Phone
					</label>
					<input
						id='token-phone'
						className='form-control rounded-3'
						placeholder='Optional'
						disabled={isSubmitting}
						value={tokenForm.phone ?? ''}
						onChange={(e) => setTokenForm((p) => ({ ...p, phone: e.target.value }))}
					/>
				</div>
				<div className='col-md-6'>
					<label className={fieldLabelClass} htmlFor='token-age'>
						Age
					</label>
					<input
						id='token-age'
						className='form-control rounded-3'
						type='number'
						min='0'
						placeholder='Optional'
						disabled={isSubmitting}
						value={tokenForm.age ?? ''}
						onChange={(e) =>
							setTokenForm((p) => ({
								...p,
								age: e.target.value === '' ? undefined : Number(e.target.value),
							}))
						}
					/>
				</div>
				<div className='col-md-6'>
					<label className={fieldLabelClass} htmlFor='token-place'>
						Place
					</label>
					<input
						id='token-place'
						className='form-control rounded-3'
						placeholder='Optional'
						disabled={isSubmitting}
						value={tokenForm.place ?? ''}
						onChange={(e) => setTokenForm((p) => ({ ...p, place: e.target.value }))}
					/>
				</div>
				<div className='col-12'>
					<label className={fieldLabelClass} htmlFor='token-remarks'>
						Remarks
					</label>
					<textarea
						id='token-remarks'
						className='form-control rounded-3'
						rows={3}
						placeholder='Optional notes'
						disabled={isSubmitting}
						value={tokenForm.remarks ?? ''}
						onChange={(e) => setTokenForm((p) => ({ ...p, remarks: e.target.value }))}
					/>
				</div>
				{showServingPoints && servingPoints && servingPoints.length > 0 && (
					<div className='col-12'>
						<label className={fieldLabelClass}>Serving points on this queue</label>
						<ul className='list-group list-group-flush border rounded-3 small mb-0'>
							{servingPoints.map((sp) => (
								<li
									key={sp.id}
									className='list-group-item d-flex justify-content-between align-items-center py-2'>
									<span>{sp.name}</span>
									<span className='text-muted'>
										{sp.is_available === false ? 'Busy' : 'Available'}
									</span>
								</li>
							))}
						</ul>
						<div className='form-text'>
							Manage serving points from the Serving Points page or queue detail.
						</div>
					</div>
				)}
			</div>
			{!hideActions && (
				<div className='d-flex justify-content-end align-items-center gap-2 mt-4 pt-3 border-top border-secondary border-opacity-25'>
					{onCancel && (
						<Button
							color='secondary'
							isLight
							type='button'
							isDisable={isSubmitting}
							onClick={() => {
								setNameError(undefined);
								onCancel();
							}}>
							Cancel
						</Button>
					)}
					<Button
						color='primary'
						type='submit'
						icon={isCreate ? 'Add' : 'Save'}
						isDisable={isSubmitting}>
						{isSubmitting ? (
							<>
								<Spinner isSmall inButton />
								{isCreate ? 'Creating…' : 'Saving…'}
							</>
						) : (
							submitLabel
						)}
					</Button>
				</div>
			)}
		</>
	);

	if (embedInParentForm) {
		return <div>{fields}</div>;
	}

	return <form onSubmit={handleSubmit}>{fields}</form>;
};

export default TokenCreateForm;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import ReactSelectWithState from '../../CustomComponent/Select/ReactSelect';
import ModernMultiSelect from '../../CustomComponent/Select/ModernMultiSelect';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type CreateServingPointPayload,
	type Queue,
	type ServingPoint,
	type User,
	queuesApi,
	usersApi,
} from '../../../services/queueManagementApi';
import {
	servingPointAssignedUserIds,
	servingPointQueueIds,
} from '../../MasterComponents/QueueManagement/queueManagementUtils';

function servingPointUserLabel(user: User): string {
	const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
	return name || user.email || user.username || `User ${user.id}`;
}

export interface ServingPointFormValues {
	name: string;
	queue_ids: number[];
	description: string;
	is_active: boolean;
	assigned_users: number[];
}

export const emptyServingPointForm = (defaultQueueId?: number | null): ServingPointFormValues => ({
	name: '',
	queue_ids:
		defaultQueueId != null && !Number.isNaN(defaultQueueId) && defaultQueueId > 0
			? [defaultQueueId]
			: [],
	description: '',
	is_active: true,
	assigned_users: [],
});

export const servingPointToFormValues = (point: ServingPoint): ServingPointFormValues => ({
	name: point.name || '',
	queue_ids: servingPointQueueIds(point),
	description: point.description || '',
	is_active: Boolean(point.is_active ?? true),
	assigned_users: servingPointAssignedUserIds(point),
});

export interface ServingPointModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode?: 'add' | 'edit';
	/** When editing, pass the row to pre-fill the form. */
	servingPoint?: ServingPoint | null;
	/** Pre-select queue on add (e.g. `?queueId=` on list page). */
	defaultQueueId?: number | null;
	onSuccess?: (point: ServingPoint, mode: 'add' | 'edit') => void;
}

const fieldLabelClass = 'form-label text-muted small text-uppercase fw-semibold mb-2';

const ServingPointModal: React.FC<ServingPointModalProps> = ({
	isOpen,
	setIsOpen,
	mode = 'add',
	servingPoint = null,
	defaultQueueId = null,
	onSuccess,
}) => {
	const isEdit = mode === 'edit';
	const editId = isEdit ? servingPoint?.id : null;

	const [form, setForm] = useState<ServingPointFormValues>(() => emptyServingPointForm(defaultQueueId));
	const [nameError, setNameError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [optionsLoading, setOptionsLoading] = useState(false);
	const [queues, setQueues] = useState<Queue[]>([]);
	const [users, setUsers] = useState<User[]>([]);

	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const loadOptions = useCallback(async () => {
		setOptionsLoading(true);
		try {
			const [queuesRes, usersRes] = await Promise.all([
				queuesApi.list(),
				usersApi.list(),
			]);
			setQueues(queuesRes.results || []);
			setUsers(usersRes.results || []);
		} catch (err) {
			errorNotifierRef.current(err);
		} finally {
			setOptionsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		setNameError('');
		void loadOptions();
		if (isEdit && servingPoint) {
			setForm(servingPointToFormValues(servingPoint));
		} else {
			setForm(emptyServingPointForm(defaultQueueId));
		}
	}, [isOpen, isEdit, servingPoint, defaultQueueId, loadOptions]);

	useEffect(() => {
		if (!isOpen || users.length === 0) return;
		const allowedIds = new Set(users.map((u) => u.id));
		setForm((prev) => ({
			...prev,
			assigned_users: prev.assigned_users.filter((id) => allowedIds.has(id)),
		}));
	}, [isOpen, users]);

	const queueOptions = useMemo(
		() => queues.map((q) => ({ value: q.id, label: q.name })),
		[queues],
	);

	const userOptions = useMemo(
		() =>
			users.map((user) => ({
				value: user.id,
				label: servingPointUserLabel(user),
			})),
		[users],
	);

	const selectedQueueOptions = useMemo(
		() => queueOptions.filter((o) => form.queue_ids.includes(o.value)),
		[form.queue_ids, queueOptions],
	);

	const selectedUserOptions = useMemo(
		() => userOptions.filter((o) => form.assigned_users.includes(o.value)),
		[form.assigned_users, userOptions],
	);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const handleSubmit = async () => {
		if (!form.name.trim()) {
			setNameError('Serving point name is required.');
			return;
		}
		setNameError('');
		if (isEdit && !editId) {
			showErrorNotification('Serving point could not be identified for update.');
			return;
		}

		setIsSubmitting(true);
		try {
			if (isEdit && editId) {
				const updated = await queuesApi.updateServingPoint(editId, {
					name: form.name.trim(),
					queue: form.queue_ids,
					description: form.description.trim() || undefined,
					is_active: form.is_active,
					assigned_users: form.assigned_users,
				});
				showSuccessNotification('Serving point updated successfully.');
				onSuccess?.(updated, 'edit');
			} else {
				const payload: CreateServingPointPayload = {
					name: form.name.trim(),
					queue: form.queue_ids,
					description: form.description.trim() || undefined,
					is_active: form.is_active,
					assigned_users: form.assigned_users,
				};
				const created = await queuesApi.createServingPoint(payload);
				showSuccessNotification('Serving point created successfully.');
				onSuccess?.(created, 'add');
			}
			handleClose();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const formDisabled = isSubmitting || optionsLoading;

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered size='lg' isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='serving-point-modal-title'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon={isEdit ? 'Edit' : 'Add'} color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>
								{isEdit ? 'Edit Serving Point' : 'Add Serving Point'}
							</div>
							<div className='text-muted small fw-normal mt-1'>
								{isEdit
									? 'Update name, queues, users, and listing for this counter'
									: 'Set up a new counter and link it to your queues'}
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void handleSubmit();
				}}>
				<ModalBody className='pt-2 pb-4'>
					{optionsLoading && queues.length === 0 ? (
						<div className='d-flex flex-column align-items-center justify-content-center py-5 gap-2 text-muted'>
							<Spinner color='primary' />
							<span>Loading form options…</span>
						</div>
					) : (
						<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3 p-md-4'>
							<div className='row g-4'>
								<div className='col-12'>
									<label className={fieldLabelClass} htmlFor='sp-name'>
										Name *
									</label>
									<input
										id='sp-name'
										className={`form-control form-control-lg rounded-3${nameError ? ' is-invalid' : ''}`}
										value={form.name}
										onChange={(e) => {
											setForm((prev) => ({ ...prev, name: e.target.value }));
											if (nameError) setNameError('');
										}}
										placeholder='Enter serving point name'
										disabled={formDisabled}
										aria-invalid={Boolean(nameError)}
										aria-describedby={nameError ? 'sp-name-error' : undefined}
									/>
									{nameError ? (
										<div id='sp-name-error' className='invalid-feedback d-block'>
											{nameError}
										</div>
									) : null}
								</div>

								<div className='col-12'>
									<label className={fieldLabelClass}>Queues</label>
									<ModernMultiSelect
										options={queueOptions}
										value={selectedQueueOptions}
										onChange={(selected) =>
											setForm((prev) => ({
												...prev,
												queue_ids: selected.map((option) => option.value as number),
											}))
										}
										placeholder='Select one or more queues'
										isDisabled={formDisabled}
									/>
								</div>

								<div className='col-12'>
									<label className={fieldLabelClass} htmlFor='sp-active'>
										Active
									</label>
									<div
										className={[
											'd-flex align-items-center justify-content-between gap-3 p-3 rounded-3 border transition-all',
											form.is_active
												? 'border-success bg-success bg-opacity-10'
												: 'border-secondary border-opacity-25 bg-body',
										].join(' ')}>
										<div className='d-flex align-items-center gap-3 min-w-0'>
											<span
												className={[
													'd-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0',
													form.is_active
														? 'bg-success bg-opacity-15'
														: 'bg-body-secondary',
												].join(' ')}
												style={{ width: 36, height: 36 }}>
												<Icon
													icon={form.is_active ? 'CheckCircle' : 'Block'}
													color={form.is_active ? 'success' : 'secondary'}
													size='sm'
												/>
											</span>
											<div className='min-w-0'>
												<div
													className={`fw-semibold small ${form.is_active ? 'text-success' : 'text-body'}`}>
													{form.is_active ? 'Listed as active' : 'Listed as inactive'}
												</div>
												<div className='text-muted small'>
													{form.is_active
														? 'This counter is available in selection lists'
														: 'This counter is hidden from selection lists'}
												</div>
											</div>
										</div>
										<div className='form-check form-switch m-0 flex-shrink-0'>
											<input
												className='form-check-input'
												type='checkbox'
												role='switch'
												id='sp-active'
												checked={form.is_active}
												disabled={formDisabled}
												onChange={(e) =>
													setForm((prev) => ({ ...prev, is_active: e.target.checked }))
												}
											/>
										</div>
									</div>
								</div>

								<div className='col-12'>
									<label className={fieldLabelClass}>Assigned Users</label>
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
									<label className={fieldLabelClass} htmlFor='sp-description'>
										Description
									</label>
									<textarea
										id='sp-description'
										className='form-control rounded-3'
										rows={3}
										value={form.description}
										disabled={formDisabled}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, description: e.target.value }))
										}
										placeholder='Short description'
									/>
								</div>
							</div>
						</div>
					)}
				</ModalBody>
				<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
					<Button
						color='secondary'
						isLight
						type='button'
						isDisable={isSubmitting}
						onClick={handleClose}>
						Cancel
					</Button>
					<Button
						color='primary'
						type='submit'
						icon={isEdit ? 'Save' : 'Add'}
						isDisable={isSubmitting || optionsLoading}>
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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import ModernMultiSelect from '../../CustomComponent/Select/ModernMultiSelect';
import useToasterNotification from '../../../hooks/useToasterNotification';
import type {
	CreateQueuePayload,
	Queue,
	ServingPoint,
	UpdateQueuePayload,
} from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';
import { isServingPointListedForSelection } from '../../MasterComponents/QueueManagement/queueManagementUtils';

interface QueueFormModalProps {
	isOpen: boolean;
	setIsOpen: (status: boolean) => void;
	mode?: 'add' | 'edit';
	/** When `mode` is `edit`, the modal loads the queue with `queuesApi.get(editQueueId)` before showing the form. */
	editQueueId?: number | null;
	onSaved?: () => void | Promise<void>;
}

interface QueueFormState {
	name: string;
	description: string;
	limit: string;
	grace_period_minutes: string;
	allow_postpone: boolean;
	is_reporting_enabled: boolean;
	token_prefix: string;
	serving_point_ids: number[];
	next_queue_ids: number[];
}

const defaultFormState = (): QueueFormState => ({
	name: '',
	description: '',
	limit: '50',
	grace_period_minutes: '15',
	allow_postpone: true,
	is_reporting_enabled: false,
	token_prefix: '',
	serving_point_ids: [],
	next_queue_ids: [],
});

const extractNextQueueIds = (nextQueues?: Queue[] | number[]): number[] => {
	if (!nextQueues?.length) return [];
	if (typeof nextQueues[0] === 'number') return nextQueues as number[];
	return (nextQueues as Queue[]).map((queue) => queue.id);
};

const queueToFormState = (q: Queue): QueueFormState => ({
	name: q.name || '',
	description: q.description || '',
	limit: String(q.limit ?? 50),
	grace_period_minutes: String(q.grace_period_minutes ?? 15),
	allow_postpone: q.allow_postpone ?? true,
	is_reporting_enabled: q.is_reporting_enabled ?? false,
	token_prefix: q.token_prefix || '',
	serving_point_ids: (q.serving_points || []).map((point) => point.id),
	next_queue_ids: extractNextQueueIds(q.next_queues),
});

const sameIdList = (a: number[], b: number[]) =>
	a.length === b.length && a.every((id, index) => id === b[index]);

/** Build a PATCH body with only fields that differ from the loaded queue. */
const buildChangedQueuePayload = (
	form: QueueFormState,
	original: Queue,
	graceMinutes: number,
): UpdateQueuePayload => {
	const baseline = queueToFormState(original);
	const changes: UpdateQueuePayload = {};

	const nextName = form.name.trim();
	if (nextName !== baseline.name.trim()) changes.name = nextName;

	const nextDescription = form.description.trim();
	if (nextDescription !== baseline.description.trim()) {
		changes.description = nextDescription || undefined;
	}

	const nextLimit = Number(form.limit || 0) || 0;
	if (nextLimit !== (Number(baseline.limit || 0) || 0)) changes.limit = nextLimit;

	if (graceMinutes !== (Number(baseline.grace_period_minutes || 0) || 0)) {
		changes.grace_period_minutes = graceMinutes;
	}

	if (form.allow_postpone !== baseline.allow_postpone) {
		changes.allow_postpone = form.allow_postpone;
	}

	if (form.is_reporting_enabled !== baseline.is_reporting_enabled) {
		changes.is_reporting_enabled = form.is_reporting_enabled;
	}

	const nextTokenPrefix = form.token_prefix.trim();
	if (nextTokenPrefix !== baseline.token_prefix.trim()) {
		changes.token_prefix = nextTokenPrefix || undefined;
	}

	if (!sameIdList(form.next_queue_ids, baseline.next_queue_ids)) {
		changes.next_queues = form.next_queue_ids;
	}

	return changes;
};

const fieldLabelClass = 'form-label text-muted small text-uppercase fw-semibold mb-2';

interface ToggleSettingCardProps {
	id: string;
	label: string;
	checked: boolean;
	disabled: boolean;
	onChange: (checked: boolean) => void;
	enabledTitle: string;
	disabledTitle: string;
	enabledHint: string;
	disabledHint: string;
	iconOn: string;
	iconOff: string;
	activeBorderClass: string;
	activeIconWrapClass: string;
	activeTextClass: string;
	iconColorOn: 'primary' | 'success' | 'info';
}

const ToggleSettingCard: React.FC<ToggleSettingCardProps> = ({
	id,
	label,
	checked,
	disabled,
	onChange,
	enabledTitle,
	disabledTitle,
	enabledHint,
	disabledHint,
	iconOn,
	iconOff,
	activeBorderClass,
	activeIconWrapClass,
	activeTextClass,
	iconColorOn,
}) => (
	<div className='h-100 d-flex flex-column'>
		<label className={fieldLabelClass} htmlFor={id}>
			{label}
		</label>
		<div
			className={[
				'flex-grow-1 d-flex align-items-center justify-content-between gap-2 p-2 p-md-3 rounded-3 border transition-all',
				checked ? activeBorderClass : 'border-secondary border-opacity-25 bg-body',
			].join(' ')}>
			<div className='d-flex align-items-center gap-2 min-w-0'>
				<span
					className={[
						'd-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0',
						checked ? activeIconWrapClass : 'bg-body-secondary',
					].join(' ')}
					style={{ width: 32, height: 32 }}>
					<Icon
						icon={checked ? iconOn : iconOff}
						color={checked ? iconColorOn : 'secondary'}
						size='sm'
					/>
				</span>
				<div className='min-w-0'>
					<div className={`fw-semibold small ${checked ? activeTextClass : 'text-body'}`}>
						{checked ? enabledTitle : disabledTitle}
					</div>
					<div className='text-muted small lh-sm'>{checked ? enabledHint : disabledHint}</div>
				</div>
			</div>
			<div className='form-check form-switch m-0 flex-shrink-0'>
				<input
					className='form-check-input'
					type='checkbox'
					role='switch'
					id={id}
					checked={checked}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked)}
				/>
			</div>
		</div>
	</div>
);

const QueueFormModal: React.FC<QueueFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode = 'add',
	editQueueId = null,
	onSaved,
}) => {
	const isEditMode = mode === 'edit' && editQueueId != null && !Number.isNaN(editQueueId);
	const [submitting, setSubmitting] = useState(false);
	const [loadingEditQueue, setLoadingEditQueue] = useState(false);
	const [loadedEditQueue, setLoadedEditQueue] = useState<Queue | null>(null);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [loadingServingPoints, setLoadingServingPoints] = useState(false);
	const [allQueues, setAllQueues] = useState<Queue[]>([]);
	const [loadingQueues, setLoadingQueues] = useState(false);
	const [form, setForm] = useState<QueueFormState>(defaultFormState);
	const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});
	const { showErrorNotification, showSuccessNotification, showNotification } = useToasterNotification();

	const setIsOpenRef = useRef(setIsOpen);
	const showErrorNotificationRef = useRef(showErrorNotification);
	setIsOpenRef.current = setIsOpen;
	showErrorNotificationRef.current = showErrorNotification;

	const canSubmitEdit = isEditMode && loadedEditQueue != null && !loadingEditQueue;
	const isUpdateSubmit = isEditMode && loadedEditQueue != null;

	useEffect(() => {
		let cancelled = false;

		if (!isOpen) {
			setLoadedEditQueue(null);
			setLoadingEditQueue(false);
			setFieldErrors({});
			return;
		}

		if (!isEditMode) {
			setLoadedEditQueue(null);
			setLoadingEditQueue(false);
			setForm(defaultFormState());
			setFieldErrors({});
			return;
		}

		setLoadingEditQueue(true);
		setLoadedEditQueue(null);
		setFieldErrors({});

		void queuesApi
			.get(editQueueId as number)
			.then((q) => {
				if (cancelled) return;
				setLoadedEditQueue(q);
				setForm(queueToFormState(q));
			})
			.catch((err) => {
				if (!cancelled) {
					showErrorNotificationRef.current(err);
					setIsOpenRef.current(false);
				}
			})
			.finally(() => {
				if (!cancelled) setLoadingEditQueue(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, isEditMode, editQueueId]);

	useEffect(() => {
		let cancelled = false;

		if (!isOpen || isEditMode) {
			setServingPoints([]);
			setLoadingServingPoints(false);
			return;
		}

		setLoadingServingPoints(true);
		void queuesApi.servingPoints()
			.then((res) => {
				if (!cancelled) setServingPoints(res.results || []);
			})
			.catch((err) => {
				if (!cancelled) showErrorNotificationRef.current(err);
			})
			.finally(() => {
				if (!cancelled) setLoadingServingPoints(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, isEditMode]);

	useEffect(() => {
		let cancelled = false;

		if (!isOpen) {
			setAllQueues([]);
			setLoadingQueues(false);
			return;
		}

		setLoadingQueues(true);
		void queuesApi
			.list()
			.then((res) => {
				if (!cancelled) setAllQueues(res.results || []);
			})
			.catch((err) => {
				if (!cancelled) showErrorNotificationRef.current(err);
			})
			.finally(() => {
				if (!cancelled) setLoadingQueues(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen]);

	const servingPointOptions = useMemo(
		() =>
			servingPoints
				.filter(isServingPointListedForSelection)
				.map((point) => ({
					value: point.id,
					label: point.name,
				})),
		[servingPoints],
	);

	const selectedServingPointOptions = useMemo(
		() => servingPointOptions.filter((option) => form.serving_point_ids.includes(option.value)),
		[form.serving_point_ids, servingPointOptions],
	);

	const queueOptions = useMemo(() => {
		const excludeId = isEditMode && editQueueId != null ? editQueueId : null;
		return allQueues
			.filter((queue) => excludeId == null || queue.id !== excludeId)
			.map((queue) => ({
				value: queue.id,
				label: queue.name,
			}));
	}, [allQueues, isEditMode, editQueueId]);

	const selectedNextQueueOptions = useMemo(
		() => queueOptions.filter((option) => form.next_queue_ids.includes(option.value)),
		[form.next_queue_ids, queueOptions],
	);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const nextFieldErrors: { name?: string } = {};
		if (!form.name.trim()) {
			nextFieldErrors.name = '*This field is required';
		}
		setFieldErrors(nextFieldErrors);
		if (Object.keys(nextFieldErrors).length > 0) {
			return;
		}

		const graceRaw = form.grace_period_minutes.trim();
		if (graceRaw === '') {
			showNotification('Error', 'Grace period (minutes) is required.', 'danger');
			return;
		}
		const graceMinutes = Number(graceRaw);
		if (!Number.isInteger(graceMinutes) || graceMinutes < 0) {
			showNotification('Error', 'Grace period must be a whole number of 0 or greater.', 'danger');
			return;
		}

		const updatePayload = isUpdateSubmit
			? buildChangedQueuePayload(form, loadedEditQueue!, graceMinutes)
			: null;
		if (isUpdateSubmit && updatePayload && Object.keys(updatePayload).length === 0) {
			showNotification('Info', 'No changes to save.', 'info');
			return;
		}

		setSubmitting(true);
		try {
			if (isUpdateSubmit && updatePayload) {
				await queuesApi.update(loadedEditQueue!.id, updatePayload);
				showSuccessNotification('Queue updated successfully.');
			} else {
				const payload: CreateQueuePayload = {
					name: form.name.trim(),
					description: form.description.trim() || undefined,
					limit: Number(form.limit || 0) || 0,
					grace_period_minutes: graceMinutes,
					allow_postpone: form.allow_postpone,
					is_reporting_enabled: form.is_reporting_enabled,
					token_prefix: form.token_prefix.trim() || undefined,
					serving_points: form.serving_point_ids,
					next_queues: form.next_queue_ids,
				};
				await queuesApi.create(payload);
				showSuccessNotification('Queue created successfully.');
			}
			setIsOpen(false);
			await onSaved?.();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSubmitting(false);
		}
	};

	const formReady = !isEditMode || !loadingEditQueue;
	const formDisabled = !formReady || submitting;

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered size='lg' isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='queue-form-modal'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon={isEditMode ? 'Edit' : 'Add'} color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>{isEditMode ? 'Edit Queue' : 'Add Queue'}</div>
							<div className='text-muted small fw-normal mt-1'>
								{isEditMode
									? 'Update queue settings, limits, and follow-up routing'
									: 'Create a waiting line and configure token behaviour'}
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<form onSubmit={handleSubmit}>
				<ModalBody className='pt-2 pb-3'>
					{isEditMode && loadingEditQueue ? (
						<div className='d-flex flex-column align-items-center justify-content-center py-5 gap-2 text-muted'>
							<Spinner color='primary' />
							<span>Loading queue…</span>
						</div>
					) : (
						<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3'>
							{isEditMode && loadedEditQueue?.name ? (
								<div className='d-flex align-items-center gap-3 p-3 rounded-4 border border-secondary border-opacity-25 bg-body mb-3'>
									<span
										className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
										style={{ width: 44, height: 44 }}>
										<Icon icon='Queue' color='primary' />
									</span>
									<div className='min-w-0'>
										<div className='text-muted small text-uppercase fw-semibold mb-1'>
											Editing
										</div>
										<div className='fw-bold fs-5 text-body lh-sm text-truncate'>
											{loadedEditQueue.name}
										</div>
									</div>
								</div>
							) : null}

							<div className='row g-3'>
								<div className='col-12'>
									<label className={fieldLabelClass} htmlFor='queue-name'>
										Queue Name *
									</label>
									<input
										id='queue-name'
										className={`form-control rounded-3${fieldErrors.name ? ' is-invalid' : ''}`}
										value={form.name}
										onChange={(e) => {
											const value = e.target.value;
											setForm((prev) => ({ ...prev, name: value }));
											if (fieldErrors.name && value.trim()) {
												setFieldErrors((prev) => ({ ...prev, name: undefined }));
											}
										}}
										placeholder='Enter queue name'
										disabled={formDisabled}
									/>
									{fieldErrors.name ? (
										<div className='invalid-feedback d-block'>{fieldErrors.name}</div>
									) : null}
								</div>

								<div className='col-12'>
									<label className={fieldLabelClass} htmlFor='queue-description'>
										Description
									</label>
									<textarea
										id='queue-description'
										className='form-control rounded-3'
										rows={2}
										value={form.description}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, description: e.target.value }))
										}
										placeholder='Short description'
										disabled={formDisabled}
									/>
								</div>

								<div className='col-md-6'>
									<label
										className={`${fieldLabelClass} d-flex align-items-center gap-1`}
										htmlFor='queue-token-prefix'>
										Token Prefix
										<Tooltip
											arrow
											placement='top'
											title='A short text prepended to every token number generated for this queue (e.g. "A" produces tokens A001, A002, …). Leave blank to use plain numbers.'>
											<InfoOutlinedIcon
												style={{ fontSize: 16, color: '#6c757d', cursor: 'default' }}
											/>
										</Tooltip>
									</label>
									<input
										id='queue-token-prefix'
										className='form-control rounded-3'
										value={form.token_prefix}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, token_prefix: e.target.value }))
										}
										placeholder='e.g. A'
										maxLength={10}
										disabled={formDisabled}
									/>
								</div>

								<div className='col-md-6'>
									<label className={fieldLabelClass} htmlFor='queue-limit'>
										Token Limit
									</label>
									<input
										id='queue-limit'
										type='number'
										min={1}
										className='form-control rounded-3'
										value={form.limit}
										onChange={(e) => setForm((prev) => ({ ...prev, limit: e.target.value }))}
										disabled={formDisabled}
									/>
								</div>

								<div className='col-12'>
									<label className={fieldLabelClass} htmlFor='queue-grace-period-minutes'>
										Grace period (minutes)
									</label>
									<input
										id='queue-grace-period-minutes'
										type='number'
										min={0}
										step={1}
										className='form-control rounded-3'
										value={form.grace_period_minutes}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, grace_period_minutes: e.target.value }))
										}
										placeholder='e.g. 15'
										disabled={formDisabled}
									/>
								</div>

								<div className='col-md-6'>
									<ToggleSettingCard
										id='queue-allow-postpone'
										label='Allow Postpone'
										checked={form.allow_postpone}
										disabled={formDisabled}
										onChange={(checked) =>
											setForm((prev) => ({ ...prev, allow_postpone: checked }))
										}
										enabledTitle='Allowed'
										disabledTitle='Disabled'
										enabledHint='Customers can postpone tokens'
										disabledHint='Postpone not allowed'
										iconOn='Update'
										iconOff='Block'
										activeBorderClass='border-primary bg-primary bg-opacity-10'
										activeIconWrapClass='bg-primary bg-opacity-15'
										activeTextClass='text-primary'
										iconColorOn='primary'
									/>
								</div>

								<div className='col-md-6'>
									<ToggleSettingCard
										id='queue-is-reporting-enabled'
										label='Reporting Enabled'
										checked={form.is_reporting_enabled}
										disabled={formDisabled}
										onChange={(checked) =>
											setForm((prev) => ({ ...prev, is_reporting_enabled: checked }))
										}
										enabledTitle='Enabled'
										disabledTitle='Disabled'
										enabledHint='Included in reports'
										disabledHint='Excluded from reports'
										iconOn='Assessment'
										iconOff='Block'
										activeBorderClass='border-info bg-info bg-opacity-10'
										activeIconWrapClass='bg-info bg-opacity-15'
										activeTextClass='text-info'
										iconColorOn='info'
									/>
								</div>

								<div className='col-12'>
									<label className={fieldLabelClass}>Next queue</label>
									{loadingQueues ? (
										<div className='text-muted small py-2'>Loading queues…</div>
									) : (
										<ModernMultiSelect
											options={queueOptions}
											value={selectedNextQueueOptions}
											onChange={(selected) =>
												setForm((prev) => ({
													...prev,
													next_queue_ids: selected.map((option) => option.value as number),
												}))
											}
											placeholder='Select next queues'
											isDisabled={formDisabled}
										/>
									)}
								</div>

								{!isEditMode && (
									<div className='col-12'>
										<label className={fieldLabelClass}>Serving Points</label>
										{loadingServingPoints ? (
											<div className='text-muted small py-2'>Loading serving points…</div>
										) : (
											<ModernMultiSelect
												options={servingPointOptions}
												value={selectedServingPointOptions}
												onChange={(selected) =>
													setForm((prev) => ({
														...prev,
														serving_point_ids: selected.map(
															(option) => option.value as number,
														),
													}))
												}
												placeholder='Select serving points'
												isDisabled={formDisabled}
											/>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</ModalBody>
				<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
					<Button color='secondary' isLight type='button' onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						color='primary'
						type='submit'
						icon={isUpdateSubmit ? 'Save' : 'Add'}
						isDisable={submitting || (isEditMode && !canSubmitEdit)}>
						{submitting ? (
							<>
								<Spinner isSmall inButton />
								{isUpdateSubmit ? 'Updating...' : 'Creating...'}
							</>
						) : isUpdateSubmit ? (
							'Update Queue'
						) : (
							'Create Queue'
						)}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
};

export default QueueFormModal;

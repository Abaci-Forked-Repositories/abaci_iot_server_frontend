import React, { useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import ReactSelectWithState from '../../CustomComponent/Select/ReactSelect';
import useToasterNotification from '../../../hooks/useToasterNotification';
import type { CreateQueuePayload, Queue, ServingPoint } from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';

interface QueueFormModalProps {
	isOpen: boolean;
	setIsOpen: (status: boolean) => void;
	mode?: 'add' | 'edit';
	initialQueue?: Queue | null;
	servingPoints: ServingPoint[];
	onSaved?: () => void | Promise<void>;
}

interface QueueFormState {
	name: string;
	description: string;
	limit: string;
	grace_period_minutes: string;
	allow_postpone: boolean;
	is_reporting_enabled: boolean;
	serving_point_ids: number[];
}

const QueueFormModal: React.FC<QueueFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode = 'add',
	initialQueue = null,
	servingPoints,
	onSaved,
}) => {
	const isEdit = mode === 'edit' && Boolean(initialQueue?.id);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState<QueueFormState>({
		name: '',
		description: '',
		limit: '50',
		grace_period_minutes: '15',
		allow_postpone: true,
		is_reporting_enabled: false,
		serving_point_ids: [],
	});
	const { showErrorNotification, showSuccessNotification, showNotification } = useToasterNotification();

	useEffect(() => {
		if (!isOpen) return;
		setForm({
			name: initialQueue?.name || '',
			description: initialQueue?.description || '',
			limit: String(initialQueue?.limit ?? 50),
			grace_period_minutes: String(initialQueue?.grace_period_minutes ?? 15),
			allow_postpone: initialQueue?.allow_postpone ?? true,
			is_reporting_enabled: initialQueue?.is_reporting_enabled ?? false,
			serving_point_ids: (initialQueue?.serving_points || []).map((point) => point.id),
		});
	}, [initialQueue, isOpen]);

	const servingPointOptions = useMemo(
		() =>
			servingPoints.map((point) => ({
				value: point.id,
				label: point.name,
			})),
		[servingPoints],
	);

	const selectedServingPointOptions = useMemo(
		() => servingPointOptions.filter((option) => form.serving_point_ids.includes(option.value)),
		[form.serving_point_ids, servingPointOptions],
	);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.name.trim()) {
			showNotification('Error', 'Queue name is required.', 'danger');
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

		const payload: CreateQueuePayload = {
			name: form.name.trim(),
			description: form.description.trim() || undefined,
			limit: Number(form.limit || 0) || 0,
			grace_period_minutes: graceMinutes,
			allow_postpone: form.allow_postpone,
			is_reporting_enabled: form.is_reporting_enabled,
			serving_points: form.serving_point_ids,
		};

		setSubmitting(true);
		try {
			if (isEdit && initialQueue?.id) {
				await queuesApi.update(initialQueue.id, payload);
				showSuccessNotification('Queue updated successfully.');
			} else {
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

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered size='lg' isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='queue-form-modal'>{isEdit ? 'Edit Queue' : 'Add Queue'}</ModalTitle>
			</ModalHeader>
			<form onSubmit={handleSubmit}>
				<ModalBody>
					<div className='row g-3'>
						<div className='col-12'>
							<label className='form-label fw-semibold' htmlFor='queue-name'>
								Queue Name
							</label>
							<input
								id='queue-name'
								className='form-control'
								value={form.name}
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								placeholder='Enter queue name'
								required
							/>
						</div>
						<div className='col-12'>
							<label className='form-label fw-semibold' htmlFor='queue-description'>
								Description
							</label>
							<textarea
								id='queue-description'
								className='form-control'
								rows={3}
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								placeholder='Short description'
							/>
						</div>
						<div className='col-md-6'>
							<label className='form-label fw-semibold' htmlFor='queue-limit'>
								Token Limit
							</label>
							<input
								id='queue-limit'
								type='number'
								min={1}
								className='form-control'
								value={form.limit}
								onChange={(e) => setForm((prev) => ({ ...prev, limit: e.target.value }))}
							/>
						</div>
						<div className='col-md-6'>
							<label className='form-label fw-semibold' htmlFor='queue-grace-period-minutes'>
								Grace period (minutes)
							</label>
							<input
								id='queue-grace-period-minutes'
								type='number'
								min={0}
								step={1}
								className='form-control'
								value={form.grace_period_minutes}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, grace_period_minutes: e.target.value }))
								}
								placeholder='e.g. 15'
							/>
						</div>
						<div className='col-md-6 d-flex align-items-end'>
							<div className='form-check form-switch mb-2'>
								<input
									className='form-check-input'
									type='checkbox'
									id='queue-allow-postpone'
									checked={form.allow_postpone}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, allow_postpone: e.target.checked }))
									}
								/>
								<label className='form-check-label fw-semibold' htmlFor='queue-allow-postpone'>
									Allow Postpone
								</label>
							</div>
						</div>
						<div className='col-md-6 d-flex align-items-end'>
							<div className='form-check form-switch mb-2'>
								<input
									className='form-check-input'
									type='checkbox'
									id='queue-is-reporting-enabled'
									checked={form.is_reporting_enabled}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, is_reporting_enabled: e.target.checked }))
									}
								/>
								<label className='form-check-label fw-semibold' htmlFor='queue-is-reporting-enabled'>
									Reporting Enabled
								</label>
							</div>
						</div>
						<div className='col-12'>
							<label className='form-label fw-semibold'>Serving Points</label>
							<ReactSelectWithState
								options={servingPointOptions}
								value={selectedServingPointOptions}
								setValue={(selected: Array<{ value: number; label: string }> | null) =>
									setForm((prev) => ({
										...prev,
										serving_point_ids: (selected || []).map((option) => option.value),
									}))
								}
								isMulti
								placeholder='Select serving points'
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color='light' isLight onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button color='primary' type='submit' isDisable={submitting}>
						{submitting ? (
							<>
								<Spinner isSmall inButton />
								{isEdit ? 'Updating...' : 'Creating...'}
							</>
						) : isEdit ? (
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

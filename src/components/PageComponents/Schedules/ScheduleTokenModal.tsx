import React, { type FormEvent, useEffect, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import TokenCreateForm from '../QueueManagement/TokenCreateForm';
import StatusBadge from '../../BadgeWithIcon.jsx';
import Icon from '../../icon/Icon';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import type { CreateTokenPayload, Queue, QueueSchedule, Token } from '../../../services/queueManagementApi';
import { tokensApi } from '../../../services/queueManagementApi';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { initialTokenForm } from '../../MasterComponents/QueueManagement/queueManagementConstants';
import { getTokenDisplay } from '../../MasterComponents/QueueManagement/queueManagementUtils';

export interface ScheduleTokenModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'create' | 'edit';
	scheduleId: number;
	queueId: number;
	queues: Queue[];
	schedules: QueueSchedule[];
	editingToken: Token | null;
	onSaved: () => void | Promise<void>;
}

const tokenToForm = (token: Token, scheduleId: number): CreateTokenPayload => {
	const u = token.token_user;
	const ageRaw = u?.age;
	let age: number | undefined;
	if (ageRaw != null && ageRaw !== '') {
		const n = Number(ageRaw);
		age = Number.isNaN(n) ? undefined : n;
	}

	const scheduleFromToken =
		typeof token.schedule === 'number' && !Number.isNaN(token.schedule) ? token.schedule : scheduleId;

	const remarksFromUser = (u?.remarks ?? '').trim();
	const remarksFromTokenNotes = (token.notes ?? '').trim();
	const remarks = remarksFromUser || remarksFromTokenNotes;

	return {
		schedule_id: scheduleFromToken,
		name: (u?.name ?? '').trim(),
		email: (u?.email ?? '').trim(),
		phone: (u?.phone ?? '').trim(),
		age,
		place: (u?.place ?? '').trim(),
		remarks,
	};
};

const ScheduleTokenModal: React.FC<ScheduleTokenModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	scheduleId,
	queueId,
	queues,
	schedules,
	editingToken,
	onSaved,
}) => {
	const [tokenForm, setTokenForm] = useState<CreateTokenPayload>(initialTokenForm);
	const [saving, setSaving] = useState(false);
	const [tokenNumberLoading, setTokenNumberLoading] = useState(false);
	const [nameError, setNameError] = useState<string | undefined>();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	useEffect(() => {
		if (!isOpen) return;
		setNameError(undefined);
		if (mode === 'edit' && editingToken) {
			setTokenForm(tokenToForm(editingToken, scheduleId));
			return;
		}
		// Create mode: reset form then fetch next token number
		setTokenForm({ ...initialTokenForm, schedule_id: scheduleId });
		setTokenNumberLoading(true);
		tokensApi
			.getNextTokenNumber(scheduleId)
			.then((res) => {
				setTokenForm((prev) => ({ ...prev, token_number: res.next_token_number }));
			})
			.catch(() => {
				// silently ignore — user can type manually
			})
			.finally(() => {
				setTokenNumberLoading(false);
			});
	}, [isOpen, mode, editingToken, scheduleId]);

	useEffect(() => {
		if (tokenForm.name.trim()) {
			setNameError(undefined);
		}
	}, [tokenForm.name]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!tokenForm.name.trim()) {
			setNameError('*This field is required');
			return;
		}
		setNameError(undefined);
		if (
			mode === 'create' &&
			tokenForm.token_number != null &&
			Number(tokenForm.token_number) >= 1000
		) {
			return;
		}
		if (mode === 'create') {
			setSaving(true);
			try {
				await tokensApi.create({
					schedule_id: scheduleId,
					name: tokenForm.name.trim(),
					email: tokenForm.email?.trim() || undefined,
					phone: tokenForm.phone?.trim() || undefined,
					age:
						tokenForm.age != null && !Number.isNaN(Number(tokenForm.age))
							? Number(tokenForm.age)
							: undefined,
					place: tokenForm.place?.trim() || undefined,
					remarks: tokenForm.remarks?.trim() || undefined,
					token_number:
						tokenForm.token_number != null && tokenForm.token_number !== ''
							? Number(tokenForm.token_number)
							: undefined,
				});
				showSuccessNotification('Token created successfully.');
				setIsOpen(false);
				await onSaved();
			} catch (err) {
				showErrorNotification(err);
			} finally {
				setSaving(false);
			}
			return;
		}

		if (!editingToken?.id) return;
		setSaving(true);
		try {
			const userId = editingToken.token_user?.id;
			const ageNum =
				tokenForm.age != null && !Number.isNaN(Number(tokenForm.age)) ? Number(tokenForm.age) : null;
			await tokensApi.patch(editingToken.id, {
				token_user: {
					...(userId != null ? { id: userId } : {}),
					name: tokenForm.name.trim(),
					email: tokenForm.email?.trim() ?? '',
					phone: tokenForm.phone?.trim() ?? '',
					age: ageNum,
					place: tokenForm.place?.trim() ?? '',
					remarks: tokenForm.remarks?.trim() ?? '',
				},
			});
			showSuccessNotification('Token updated successfully.');
			setIsOpen(false);
			await onSaved();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSaving(false);
		}
	};

	const title = mode === 'create' ? 'Create Token' : 'Edit Token';
	const submitLabel = mode === 'create' ? 'Create Token' : 'Save changes';

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered size='lg' isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='schedule-token-modal'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon={mode === 'create' ? 'ConfirmationNumber' : 'Edit'} color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>{title}</div>
							<div className='text-muted small fw-normal mt-1'>
								{mode === 'create'
									? 'Issue a token and capture customer details for this schedule'
									: 'Update customer details for this token'}
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<form onSubmit={handleSubmit}>
				<ModalBody className='pt-2 pb-3'>
					<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3'>
						{mode === 'edit' && editingToken && (
							<div className='d-flex align-items-center gap-3 p-3 rounded-4 mb-3 border border-secondary border-opacity-25 bg-body'>
								<span
									className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
									style={{ width: 44, height: 44 }}>
									<Icon icon='ConfirmationNumber' color='primary' />
								</span>
								<div className='min-w-0 flex-grow-1'>
									<div className='text-muted small text-uppercase fw-semibold mb-1'>Token</div>
									<div className='fw-bold fs-5 text-body lh-sm text-truncate'>
										{getTokenDisplay(editingToken)}
									</div>
								</div>
								<StatusBadge status={editingToken.status} />
							</div>
						)}
						<TokenCreateForm
							key={`${isOpen}-${mode}-${editingToken?.id ?? 'new'}-${scheduleId}`}
							embedInParentForm
							hideActions
							nameError={nameError}
							tokenForm={tokenForm}
							setTokenForm={setTokenForm}
							queues={queues}
							schedules={schedules}
							selectedQueueId={queueId}
							onQueueChange={() => {}}
							fixedScheduleId={scheduleId}
							servingPoints={[]}
							showServingPoints={false}
							onCancel={() => setIsOpen(false)}
							onSubmit={handleSubmit}
							isSubmitting={saving}
							submitLabel={submitLabel}
							showTokenNumber={mode === 'create'}
							tokenNumberLoading={tokenNumberLoading}
						/>
					</div>
				</ModalBody>
				<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
					<Button
						color='secondary'
						isLight
						type='button'
						isDisable={saving}
						onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						color='primary'
						type='submit'
						icon={mode === 'create' ? 'Add' : 'Save'}
						isDisable={saving}>
						{saving ? (
							<>
								<Spinner isSmall inButton />
								{mode === 'create' ? 'Creating…' : 'Saving…'}
							</>
						) : (
							submitLabel
						)}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
};

export default ScheduleTokenModal;

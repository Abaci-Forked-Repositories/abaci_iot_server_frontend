import React, { useCallback, useEffect, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import StatusBadge from '../../BadgeWithIcon.jsx';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { type ServingPoint, queuesApi } from '../../../services/queueManagementApi';
import {
	getNextAllowedServingPointStatuses,
	SP_STATUS_COLORS,
	SP_STATUS_LABELS,
} from '../../MasterComponents/QueueManagement/queueManagementUtils';

export interface ServingPointStatusModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	servingPoint: ServingPoint | null;
	/** Optional note below the serving point name (e.g. window detail context). */
	helperText?: string;
	/** When set, overrides default transition rules from `getNextAllowedServingPointStatuses`. */
	allowedStatuses?: string[];
	onSuccess?: (point: ServingPoint) => void;
}

const STATUS_OPTION_META: Record<
	string,
	{
		icon: string;
		color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
		selectedCard: string;
		selectedRadio: string;
		selectedIconWrap: string;
		selectedText: string;
	}
> = {
	scheduled: {
		icon: 'Schedule',
		color: 'primary',
		selectedCard: 'border-primary bg-primary bg-opacity-10',
		selectedRadio: 'bg-primary border-primary',
		selectedIconWrap: 'bg-primary bg-opacity-15',
		selectedText: 'text-primary',
	},
	running: {
		icon: 'PlayCircle',
		color: 'primary',
		selectedCard: 'border-primary bg-primary bg-opacity-10',
		selectedRadio: 'bg-primary border-primary',
		selectedIconWrap: 'bg-primary bg-opacity-15',
		selectedText: 'text-primary',
	},
	on_hold: {
		icon: 'PauseCircle',
		color: 'warning',
		selectedCard: 'border-warning bg-warning bg-opacity-10',
		selectedRadio: 'bg-warning border-warning',
		selectedIconWrap: 'bg-warning bg-opacity-15',
		selectedText: 'text-warning',
	},
	completed: {
		icon: 'TaskAlt',
		color: 'info',
		selectedCard: 'border-info bg-info bg-opacity-10',
		selectedRadio: 'bg-info border-info',
		selectedIconWrap: 'bg-info bg-opacity-15',
		selectedText: 'text-info',
	},
	cancelled: {
		icon: 'Cancel',
		color: 'danger',
		selectedCard: 'border-danger bg-danger bg-opacity-10',
		selectedRadio: 'bg-danger border-danger',
		selectedIconWrap: 'bg-danger bg-opacity-15',
		selectedText: 'text-danger',
	},
	un_assigned: {
		icon: 'PersonOff',
		color: 'secondary',
		selectedCard: 'border-secondary bg-secondary bg-opacity-10',
		selectedRadio: 'bg-secondary border-secondary',
		selectedIconWrap: 'bg-secondary bg-opacity-15',
		selectedText: 'text-secondary',
	},
};

const resolveAllowedStatuses = (
	servingPoint: ServingPoint | null,
	allowedStatuses?: string[],
): string[] => {
	if (!servingPoint) return [];
	if (allowedStatuses) return allowedStatuses;
	return getNextAllowedServingPointStatuses(servingPoint.status);
};

const ServingPointStatusModal: React.FC<ServingPointStatusModalProps> = ({
	isOpen,
	setIsOpen,
	servingPoint,
	helperText,
	allowedStatuses,
	onSuccess,
}) => {
	const [statusFormValue, setStatusFormValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	useEffect(() => {
		if (!isOpen || !servingPoint) return;
		const allowed = resolveAllowedStatuses(servingPoint, allowedStatuses);
		setStatusFormValue(allowed[0] ?? '');
	}, [allowedStatuses, isOpen, servingPoint]);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!servingPoint) return;
		const allowed = resolveAllowedStatuses(servingPoint, allowedStatuses);
		if (!statusFormValue || !allowed.includes(statusFormValue)) {
			showErrorNotification('Selected status transition is not allowed.');
			return;
		}
		setIsSubmitting(true);
		try {
			const updated = await queuesApi.updateServingPoint(servingPoint.id, {
				status: statusFormValue,
			});
			showSuccessNotification('Serving point status updated successfully.');
			onSuccess?.(updated);
			handleClose();
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const allowedOptions = resolveAllowedStatuses(servingPoint, allowedStatuses);
	const selectedMeta = STATUS_OPTION_META[statusFormValue] ?? {
		icon: 'TrackChanges',
		color: (SP_STATUS_COLORS[statusFormValue] ?? 'primary') as
			| 'primary'
			| 'success'
			| 'warning'
			| 'danger'
			| 'info'
			| 'secondary',
		selectedCard: 'border-primary bg-primary bg-opacity-10',
		selectedRadio: 'bg-primary border-primary',
		selectedIconWrap: 'bg-primary bg-opacity-15',
		selectedText: 'text-primary',
	};

	return (
		<Modal
			isOpen={isOpen && servingPoint != null}
			setIsOpen={(open) => {
				if (!open) handleClose();
			}}
			isCentered
			size='lg'
			isAnimation={false}>
			<ModalHeader setIsOpen={(open) => { if (!open) handleClose(); }}>
				<ModalTitle id='serving-point-status-modal'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon='TrackChanges' color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>Update serving point status</div>
							<div className='text-muted small fw-normal mt-1'>
								Choose the next operational state for this serving point
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			{servingPoint && allowedOptions.length > 0 && (
				<form onSubmit={(e) => void handleSubmit(e)}>
					<ModalBody className='pt-2 pb-4'>
						<div className='d-flex align-items-center gap-3 p-3 p-md-4 rounded-4 mb-4 border border-secondary border-opacity-25 bg-body-secondary'>
							<span
								className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
								style={{ width: 48, height: 48 }}>
								<Icon icon='Monitor' color='primary' />
							</span>
							<div className='min-w-0 flex-grow-1'>
								<div className='text-muted small text-uppercase fw-semibold mb-1'>
									Serving point
								</div>
								<div className='fw-bold fs-5 text-body lh-sm text-truncate'>
									{servingPoint.name}
								</div>
								{helperText ? (
									<div className='text-muted small mt-2 lh-base'>{helperText}</div>
								) : null}
							</div>
						</div>

						<div className='d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4 px-1'>
							<div className='d-flex flex-column gap-2'>
								<span className='text-muted small text-uppercase fw-semibold'>
									Current status
								</span>
								<StatusBadge
									status={servingPoint.status}
									isAvailable={servingPoint.is_available}
								/>
							</div>
							<span
								className='d-inline-flex align-items-center justify-content-center rounded-circle bg-body-secondary border border-secondary border-opacity-25 flex-shrink-0'
								style={{ width: 36, height: 36 }}>
								<Icon icon='ArrowForward' color='secondary' size='sm' />
							</span>
							<div className='d-flex flex-column gap-2'>
								<span className='text-muted small text-uppercase fw-semibold'>
									New status
								</span>
								{statusFormValue ? (
									<StatusBadge status={statusFormValue} />
								) : (
									<span className='text-muted small'>Select below</span>
								)}
							</div>
						</div>

						<div className='mb-1'>
							<div className='text-muted small text-uppercase fw-semibold mb-3 px-1'>
								Select new status
							</div>
							<div className='d-flex flex-column gap-2'>
								{allowedOptions.map((value) => {
									const meta = STATUS_OPTION_META[value] ?? {
										icon: 'Circle',
										color: (SP_STATUS_COLORS[value] ?? 'primary') as
											| 'primary'
											| 'success'
											| 'warning'
											| 'danger'
											| 'info'
											| 'secondary',
										selectedCard: 'border-primary bg-primary bg-opacity-10',
										selectedRadio: 'bg-primary border-primary',
										selectedIconWrap: 'bg-primary bg-opacity-15',
										selectedText: 'text-primary',
									};
									const label = SP_STATUS_LABELS[value] ?? value.replace(/_/g, ' ');
									const isSelected = statusFormValue === value;
									return (
										<button
											key={value}
											type='button'
											disabled={isSubmitting}
											onClick={() => setStatusFormValue(value)}
											className={[
												'd-flex align-items-center gap-3 p-3 rounded-3 border text-start w-100 transition-all',
												isSelected
													? meta.selectedCard
													: 'border-secondary border-opacity-25 bg-transparent',
											].join(' ')}
											style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
											<span
												className={[
													'd-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 border',
													isSelected
														? meta.selectedRadio
														: 'bg-body border-secondary border-opacity-50',
												].join(' ')}
												style={{ width: 22, height: 22 }}>
												{isSelected && (
													<Icon icon='Check' size='sm' color='light' />
												)}
											</span>
											<span
												className={[
													'd-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0',
													isSelected ? meta.selectedIconWrap : 'bg-body-secondary',
												].join(' ')}
												style={{ width: 40, height: 40 }}>
												<Icon icon={meta.icon} color={meta.color} />
											</span>
											<div className='flex-grow-1 min-w-0'>
												<div
													className={`fw-semibold ${isSelected ? meta.selectedText : 'text-body'}`}>
													{label}
												</div>
												<div className='text-muted small'>
													Set counter to {label.toLowerCase()}
												</div>
											</div>
											{isSelected && (
												<Icon
													icon='ArrowForward'
													color={meta.color}
													size='sm'
													className='flex-shrink-0'
												/>
											)}
										</button>
									);
								})}
							</div>
						</div>
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
							color={SP_STATUS_COLORS[statusFormValue] ?? 'primary'}
							type='submit'
							icon={selectedMeta.icon}
							isDisable={isSubmitting || !statusFormValue}>
							{isSubmitting ? (
								<>
									<Spinner isSmall inButton />
									Updating…
								</>
							) : (
								`Confirm ${SP_STATUS_LABELS[statusFormValue] ?? statusFormValue}`
							)}
						</Button>
					</ModalFooter>
				</form>
			)}
		</Modal>
	);
};

export default ServingPointStatusModal;

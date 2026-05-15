import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import type { ServingPoint } from '../../../services/queueManagementApi';
import { queuesApi, schedulesApi } from '../../../services/queueManagementApi';
import useToasterNotification from '../../../hooks/useToasterNotification';

export interface ScheduleAddServingPointsModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	scheduleId: number;
	queueId: number;
	currentServingPointIds: number[];
	onSaved: () => void | Promise<void>;
}

const ScheduleAddServingPointsModal: React.FC<ScheduleAddServingPointsModalProps> = ({
	isOpen,
	setIsOpen,
	scheduleId,
	queueId,
	currentServingPointIds,
	onSaved,
}) => {
	const [allServingPoints, setAllServingPoints] = useState<ServingPoint[]>([]);
	const [loadingList, setLoadingList] = useState(false);
	const [listLoaded, setListLoaded] = useState(false);
	const [search, setSearch] = useState('');
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [saving, setSaving] = useState(false);

	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;

	const currentSet = useMemo(() => new Set(currentServingPointIds), [currentServingPointIds]);

	const availableServingPoints = useMemo(() => {
		const term = search.trim().toLowerCase();
		return allServingPoints.filter((p) => {
			if (currentSet.has(p.id)) return false;
			if (!term) return true;
			return p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term);
		});
	}, [allServingPoints, currentSet, search]);

	const loadServingPointsForQueue = useCallback(async () => {
		if (!queueId || Number.isNaN(queueId)) return;
		setLoadingList(true);
		try {
			const pageSize = 200;
			let page = 1;
			let hasNext = true;
			const merged: ServingPoint[] = [];
			while (hasNext) {
				const res = await queuesApi.servingPoints({
					queue: queueId,
					ordering: 'name',
					page_size: pageSize,
					page,
				});
				merged.push(...(res.results || []));
				hasNext = Boolean(res.next);
				page += 1;
			}
			setAllServingPoints(merged);
			setListLoaded(true);
		} catch (err) {
			showErrorRef.current(err);
			setAllServingPoints([]);
		} finally {
			setLoadingList(false);
		}
	}, [queueId]);

	useEffect(() => {
		if (!isOpen) {
			setSearch('');
			setSelectedIds([]);
			return;
		}
		setListLoaded(false);
		setAllServingPoints([]);
		void loadServingPointsForQueue();
	}, [isOpen, loadServingPointsForQueue]);

	const toggleSelection = useCallback((id: number) => {
		setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	}, []);

	const handleSave = async () => {
		if (!scheduleId || Number.isNaN(scheduleId)) return;
		if (!selectedIds.length) {
			setIsOpen(false);
			return;
		}
		setSaving(true);
		try {
			const merged = Array.from(new Set([...currentServingPointIds, ...selectedIds]));
			await schedulesApi.setAvailableServingPoints(scheduleId, { serving_point_ids: merged });
			showSuccessNotification('Serving points added to this schedule.');
			setIsOpen(false);
			setSelectedIds([]);
			setSearch('');
			await onSaved?.();
		} catch (err) {
			showErrorRef.current(err);
		} finally {
			setSaving(false);
		}
	};

	const close = () => {
		if (saving) return;
		setIsOpen(false);
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={(open) => !open && close()} size='lg' isCentered isAnimation={false}>
			<ModalHeader setIsOpen={(open) => !open && close()}>
				<ModalTitle id='schedule-add-serving-points-title'>Add serving points</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<p className='text-muted small mb-3'>
					Select counters from this queue to attach to the schedule. Your selection is merged with counters
					already on this schedule and saved in one update.
				</p>
				<div className='position-relative mb-3'>
					<span
						className='position-absolute top-50 translate-middle-y text-muted ps-3'
						style={{ zIndex: 1, pointerEvents: 'none' }}>
						<Icon icon='Search' />
					</span>
					<input
						type='search'
						className='form-control ps-5'
						placeholder='Search by name or description'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						autoComplete='off'
						disabled={loadingList}
					/>
				</div>
				{selectedIds.length > 0 && (
					<div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
						<span className='text-muted small'>Selected</span>
						<span className='badge bg-primary rounded-pill'>{selectedIds.length}</span>
					</div>
				)}
				{availableServingPoints.length === 0 ? (
					loadingList || !listLoaded ? (
						<div className='d-flex flex-column align-items-center justify-content-center py-5 gap-2 text-muted'>
							<Spinner color='primary' />
							<span>Loading serving points…</span>
						</div>
					) : (
						<div className='text-center text-muted py-5 px-3 border rounded-3 bg-light'>
							<Icon icon='Monitor' size='3x' className='mb-3 opacity-50' />
							<div className='fw-semibold text-body'>No matches</div>
							<div className='small mt-1'>
								All serving points for this queue may already be on this schedule, or nothing matches
								your search.
							</div>
						</div>
					)
				) : (
					<div className='d-flex flex-column gap-2' style={{ maxHeight: 360, overflowY: 'auto' }}>
						{availableServingPoints.map((point) => {
							const selected = selectedIds.includes(point.id);
							return (
								<button
									key={point.id}
									type='button'
									className={`w-100 text-start border rounded-3 p-3 d-flex align-items-center gap-3 ${
										selected ?
											'border-primary shadow-sm bg-primary bg-opacity-10'
										:	'border-light bg-white'
									}`}
									style={{ cursor: 'pointer' }}
									onClick={() => toggleSelection(point.id)}>
									<div
										className={`d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0 ${
											selected ? 'bg-primary text-white' : 'bg-light text-muted'
										}`}
										style={{ width: 44, height: 44 }}>
										<Icon icon='Monitor' size='lg' />
									</div>
									<div className='flex-grow-1 min-w-0'>
										<div className='fw-semibold text-truncate'>{point.name}</div>
										{point.description ?
											<div className='small text-muted text-truncate'>{point.description}</div>
										:	null}
									</div>
									<div className='flex-shrink-0' aria-hidden>
										{selected ?
											<Icon icon='CheckCircle' color='success' size='2x' />
										:	<span className='d-inline-block rounded-circle border border-2 border-light-subtle p-2' />}
									</div>
								</button>
							);
						})}
					</div>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color='light' isOutline onClick={close} isDisable={saving}>
					Cancel
				</Button>
				<Button color='primary' onClick={() => void handleSave()} isDisable={saving || selectedIds.length === 0}>
					{saving ?
						<>
							<Spinner isSmall inButton />
							Saving…
						</>
					:	`Add to schedule (${selectedIds.length})`}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ScheduleAddServingPointsModal;

import React, { useCallback, useEffect, useState } from 'react';
import Card, { CardActions, CardBody, CardHeader } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import SearchComponent from '../../SearchComponent';
import DropDownFilter from '../../CustomComponent/DropDown/DropDownFilter';
import type { Queue, ServingPoint } from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';
import useToasterNotification from '../../../hooks/useToasterNotification';
import type { QueueGroupFilterValue } from './queueManagementConstants';
import { getErrorMessage } from './queueManagementUtils';
import QueueFormModal from '../../PageComponents/QueueManagement/QueueFormModal';
import QueuesTabContent from './QueuesTabContent';

const QueueManagementWorkspace: React.FC = () => {
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [queueSearch, setQueueSearch] = useState('');
	const [queueDisplayMode, setQueueDisplayMode] = useState<'queues' | 'groups'>('queues');
	const [queueRefreshKey, setQueueRefreshKey] = useState(0);
	const [queueGroupFilter, setQueueGroupFilter] = useState<QueueGroupFilterValue>('all');
	const [showQueueModal, setShowQueueModal] = useState(false);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	const clearMessages = () => {
		setError('');
		setSuccess('');
	};

	const handleQueueGroupFilterChange = useCallback((next: QueueGroupFilterValue) => {
		setQueueGroupFilter(next);
		setQueueRefreshKey((v) => v + 1);
	}, []);

	useEffect(() => {
		if (!error) return;
		showErrorNotification(error);
		setError('');
	}, [error, showErrorNotification]);

	useEffect(() => {
		if (!success) return;
		showSuccessNotification(success);
		setSuccess('');
	}, [showSuccessNotification, success]);

	useEffect(() => {
		let cancelled = false;
		const loadServingPoints = async () => {
			try {
				const res = await queuesApi.servingPoints({
					ordering: 'name',
					page: 1,
					page_size: 500,
				});
				if (!cancelled) {
					setServingPoints(res.results || []);
				}
			} catch {
				/* optional for create-queue modal */
			}
		};
		void loadServingPoints();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (queueDisplayMode === 'groups') {
			setQueueRefreshKey((v) => v + 1);
		}
	}, [queueDisplayMode]);

	const runAction = async (key: string, action: () => Promise<unknown>, message: string) => {
		setActionLoading(key);
		clearMessages();

		try {
			await action();
			setSuccess(message);
			setQueueRefreshKey((v) => v + 1);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setActionLoading(null);
		}
	};

	const handleToggleQueue = (queue: Queue) => {
		runAction(
			`queue-${queue.id}`,
			() => (queue.is_active ? queuesApi.deactivate(queue.id) : queuesApi.activate(queue.id)),
			`Queue ${queue.is_active ? 'deactivated' : 'activated'} successfully.`,
		);
	};

	const runQueueHeaderSearch = () => {
		setQueueRefreshKey((v) => v + 1);
	};

	return (
		<Card stretch>
			<CardHeader>
				<div className='d-flex align-items-center gap-3'>
					<div className='media-files-title-text d-flex align-items-center gap-2 '>
						<Icon icon='Queue' color='primary' size='2x' />
						<span>Queue Management</span>
					</div>
				</div>
				<CardActions>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<DropDownFilter
							options={[
								{ label: 'Queues', value: 'queues' as const },
								{ label: 'Queue Groups', value: 'groups' as const },
							]}
							onChange={(option: { value: 'queues' | 'groups' }) => {
								setQueueDisplayMode(option.value);
								setQueueRefreshKey((v) => v + 1);
							}}
							selectedOption={
								queueDisplayMode === 'queues'
									? { label: 'Queues', value: 'queues' as const }
									: { label: 'Queue Groups', value: 'groups' as const }
							}
							color='primary'
							labelField='label'
							direction='down'
							icon='FilterAlt'
							buttonClassName='app-control-btn'
						/>
						<SearchComponent
							handleChange={setQueueSearch}
							value={queueSearch}
							placeholder={
								queueDisplayMode === 'groups' ? 'Search queue groups' : 'Search queues'
							}
							className='app-search-modern me-0'
							inputClassName='app-search-modern__input'
							iconColor='primary'
							iconSize='2x'
							withDefaultMargin={false}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									runQueueHeaderSearch();
								}
							}}
							onBlur={runQueueHeaderSearch}
						/>
						<Button color='primary' icon='Add' onClick={() => setShowQueueModal(true)}>
							Add Queue
						</Button>
					</div>
				</CardActions>
			</CardHeader>
			<CardBody>
				<QueuesTabContent
					searchTerm={queueSearch}
					displayMode={queueDisplayMode}
					selectedGroupFilter={queueGroupFilter}
					onGroupFilterChange={handleQueueGroupFilterChange}
					onQueueGroupCardSelect={(groupId) => {
						setQueueDisplayMode('queues');
						handleQueueGroupFilterChange(groupId);
					}}
					refreshKey={queueRefreshKey}
					onToggleQueue={handleToggleQueue}
					isQueueActionLoading={(id) => actionLoading === `queue-${id}`}
				/>
			</CardBody>
			<QueueFormModal
				isOpen={showQueueModal}
				setIsOpen={setShowQueueModal}
				mode='add'
				servingPoints={servingPoints}
				onSaved={() => setQueueRefreshKey((v) => v + 1)}
			/>
		</Card>
	);
};

export default QueueManagementWorkspace;

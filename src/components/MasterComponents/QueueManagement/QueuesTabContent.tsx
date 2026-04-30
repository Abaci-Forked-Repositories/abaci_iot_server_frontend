import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Queue, QueueGroup } from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';
import Spinner from '../../bootstrap/Spinner';
import { Col, Row } from 'reactstrap';
import QueueCardTile from './QueueCardTile';
import type { QueueGroupFilterValue } from './queueManagementConstants';
import QueueGroupTabContent from './QueueGroupTabContent';
import { getErrorMessage } from './queueManagementUtils';

export interface QueuesTabContentProps {
	searchTerm: string;
	displayMode: 'queues' | 'groups';
	selectedGroupFilter: QueueGroupFilterValue;
	onGroupFilterChange: (value: QueueGroupFilterValue) => void;
	onQueueGroupCardSelect: (groupId: number) => void;
	refreshKey?: number;
	onToggleQueue: (queue: Queue) => void;
	isQueueActionLoading: (queueId: number) => boolean;
}

const QueuesTabContent: React.FC<QueuesTabContentProps> = ({
	searchTerm,
	displayMode,
	selectedGroupFilter,
	onGroupFilterChange,
	onQueueGroupCardSelect,
	refreshKey,
	onToggleQueue,
	isQueueActionLoading,
}) => {
	const navigate = useNavigate();
	const [queues, setQueues] = useState<Queue[]>([]);
	const [groups, setGroups] = useState<QueueGroup[]>([]);
	const [queuePage, setQueuePage] = useState(1);
	const [groupPage, setGroupPage] = useState(1);
	const [hasMoreQueues, setHasMoreQueues] = useState(true);
	const [hasMoreGroups, setHasMoreGroups] = useState(true);
	const [isLoadingMoreQueues, setIsLoadingMoreQueues] = useState(false);
	const [isLoadingMoreGroups, setIsLoadingMoreGroups] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [error, setError] = useState('');

	const loadGroups = useCallback(
		async (reset = true) => {
			const requestedPage = reset ? 1 : groupPage;
			try {
				if (!reset) setIsLoadingMoreGroups(true);
				const response = await queuesApi.groups({
					search: searchTerm || undefined,
					ordering: 'name',
					page: requestedPage,
					page_size: 12,
				});
				const incomingRows = response.results || [];
				setGroups((prev) => (reset ? incomingRows : [...prev, ...incomingRows]));
				setHasMoreGroups(Boolean(response.next));
				setGroupPage(reset ? 2 : requestedPage + 1);
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				if (!reset) setIsLoadingMoreGroups(false);
			}
		},
		[groupPage, searchTerm],
	);

	const loadQueues = useCallback(
		async (reset = true) => {
			const requestedPage = reset ? 1 : queuePage;
			try {
				if (!reset) setIsLoadingMoreQueues(true);
				if (selectedGroupFilter === 'ungrouped' && reset) {
					const response = await queuesApi.list({
						search: searchTerm || undefined,
						ordering: 'name',
						page: 1,
						page_size: 200,
					});
					const incomingRows = (response.results || []).filter((q) => q.group == null);
					setQueues(incomingRows);
					setHasMoreQueues(false);
					setQueuePage(2);
					return;
				}
				const response = await queuesApi.list({
					search: searchTerm || undefined,
					ordering: 'name',
					page: requestedPage,
					page_size: 12,
					group: typeof selectedGroupFilter === 'number' ? selectedGroupFilter : undefined,
				});
				const incomingRows = response.results || [];
				setQueues((prev) => (reset ? incomingRows : [...prev, ...incomingRows]));
				setHasMoreQueues(Boolean(response.next));
				setQueuePage(reset ? 2 : requestedPage + 1);
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				if (!reset) setIsLoadingMoreQueues(false);
			}
		},
		[queuePage, searchTerm, selectedGroupFilter],
	);

	useEffect(() => {
		let isMounted = true;
		const run = async () => {
			setInitialLoading(true);
			setError('');
			if (displayMode === 'groups') {
				await loadGroups(true);
			} else {
				await Promise.all([loadQueues(true), loadGroups(true)]);
			}
			if (isMounted) setInitialLoading(false);
		};
		void run();
		return () => {
			isMounted = false;
		};
	}, [displayMode, searchTerm, selectedGroupFilter, refreshKey, loadGroups, loadQueues]);

	const queueCountsByGroup = useMemo(() => {
		const map = new Map<number, number>();
		for (const q of queues) {
			if (typeof q.group === 'number') {
				map.set(q.group, (map.get(q.group) || 0) + 1);
			}
		}
		return map;
	}, [queues]);

	const handleScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			if (isLoadingMoreQueues || !hasMoreQueues) {
				return;
			}
			const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
			const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
			if (isNearBottom) {
				void loadQueues(false);
			}
		},
		[hasMoreQueues, isLoadingMoreQueues, loadQueues],
	);
	const handleGroupScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			if (isLoadingMoreGroups || !hasMoreGroups) {
				return;
			}
			const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
			const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
			if (isNearBottom) {
				void loadGroups(false);
			}
		},
		[hasMoreGroups, isLoadingMoreGroups, loadGroups],
	);

	return (
		<div>
			{error && <div className='alert alert-danger mb-3'>{error}</div>}
			{initialLoading ? (
				<div className='text-center text-muted py-5'>Loading queues...</div>
			) : null}
			{displayMode === 'groups' ? (
				<div>
					<div className='queue-cards-scroll' onScroll={handleGroupScroll}>
						<QueueGroupTabContent
							groups={groups}
							queueCountsByGroup={queueCountsByGroup}
							selectedGroupFilter={selectedGroupFilter}
							onGroupSelect={onQueueGroupCardSelect}
						/>
						{isLoadingMoreGroups && (
							<div className='d-flex justify-content-center py-3'>
								<Spinner isSmall />
							</div>
						)}
					</div>
				</div>
			) : (
				<div>
					<div className='queue-cards-scroll' onScroll={handleScroll}>
				<Row className='g-3 mx-0'>
					{queues.map((queue) => (
						<Col xs={12} sm={6} lg={4} xl={3} className='px-2' key={queue.id}>
							<QueueCardTile
								queue={queue}
								groupName={groups.find((group) => group.id === queue.group)?.name || queue.group || '-'}
								selected={false}
								onSelect={(id) => navigate(`/queue-management/${id}`)}
								onToggleQueue={onToggleQueue}
								isActionLoading={isQueueActionLoading(queue.id)}
							/>
						</Col>
					))}
					{!queues.length && (
						<Col xs={12} className='text-center text-muted py-4'>
							No queues found for this filter.
						</Col>
					)}
				</Row>
				{isLoadingMoreQueues && (
					<div className='d-flex justify-content-center py-3'>
						<Spinner isSmall />
					</div>
				)}
			</div>
				</div>
			)}
		</div>
	);
};

export default QueuesTabContent;

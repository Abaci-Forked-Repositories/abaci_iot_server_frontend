import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Queue } from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';
import { Col, Row } from 'reactstrap';
import QueueManagementSkeleton from '../../CustomComponent/Skeleton/QueueManagementSkeleton';
import useToasterNotification from '../../../hooks/useToasterNotification';
import QueueCardTile from './QueueCardTile';
import type { QueueGroupFilterValue } from './queueManagementConstants';
import { getErrorMessage } from './queueManagementUtils';

const QUEUE_LIST_LIMIT = 12;

export interface QueuesTabContentProps {
	searchTerm: string;
	selectedGroupFilter: QueueGroupFilterValue;
	refreshKey?: number;
	onEditQueue: (queue: Queue) => void;
	onToggleQueue: (queue: Queue) => void;
	isQueueActionLoading: (queueId: number) => boolean;
}

const QueuesTabContent: React.FC<QueuesTabContentProps> = ({
	searchTerm,
	selectedGroupFilter,
	refreshKey,
	onEditQueue,
	onToggleQueue,
	isQueueActionLoading,
}) => {
	const navigate = useNavigate();
	const [queues, setQueues] = useState<Queue[]>([]);
	const queueOffsetRef = useRef(0);
	const [hasMoreQueues, setHasMoreQueues] = useState(true);
	const [isLoadingMoreQueues, setIsLoadingMoreQueues] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [error, setError] = useState('');
	const { showErrorNotification } = useToasterNotification();

	useEffect(() => {
		if (!error) return;
		showErrorNotification(error);
		setError('');
	}, [error, showErrorNotification]);

	const loadQueues = useCallback(
		async (reset = true) => {
			const offset = reset ? 0 : queueOffsetRef.current;
			try {
				if (!reset) setIsLoadingMoreQueues(true);
				const response = await queuesApi.list({
					search: searchTerm || undefined,
					limit: QUEUE_LIST_LIMIT,
					offset,
					group: typeof selectedGroupFilter === 'number' ? selectedGroupFilter : undefined,
				});
				const pageRows = response.results || [];
				const incomingRows =
					selectedGroupFilter === 'ungrouped'
						? pageRows.filter((q) => q.group == null)
						: pageRows;
				const nextOffset = offset + pageRows.length;
				setQueues((prev) => (reset ? incomingRows : [...prev, ...incomingRows]));
				queueOffsetRef.current = nextOffset;
				setHasMoreQueues(nextOffset < (response.count ?? nextOffset));
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				if (!reset) setIsLoadingMoreQueues(false);
			}
		},
		[searchTerm, selectedGroupFilter],
	);

	useEffect(() => {
		let isMounted = true;
		const run = async () => {
			queueOffsetRef.current = 0;
			setInitialLoading(true);
			setError('');
			await loadQueues(true);
			if (isMounted) setInitialLoading(false);
		};
		void run();
		return () => {
			isMounted = false;
		};
	}, [searchTerm, selectedGroupFilter, refreshKey, loadQueues]);

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

	if (initialLoading) {
		return <QueueManagementSkeleton count={8} />;
	}

	return (
		<div className='queue-cards-scroll' onScroll={handleScroll}>
			<Row className='g-3 mx-0'>
				{queues.map((queue) => (
					<Col xs={12} sm={6} lg={4} xl={3} className='px-2' key={queue.id}>
						<QueueCardTile
							queue={queue}
							groupName={queue.group_name || queue.group || '-'}
							selected={false}
							onSelect={(id) => navigate(`/queue-management/${id}`)}
							onEditQueue={onEditQueue}
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
				<div className='py-3'>
					<QueueManagementSkeleton count={4} />
				</div>
			)}
		</div>
	);
};

export default QueuesTabContent;

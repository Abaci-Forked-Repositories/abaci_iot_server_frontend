import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Badge from '../../bootstrap/Badge';
import Icon from '../../icon/Icon';
import type { QueueGroup } from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';
import QueueManagementSkeleton from '../../CustomComponent/Skeleton/QueueManagementSkeleton';
import useToasterNotification from '../../../hooks/useToasterNotification';
import type { QueueGroupFilterValue } from './queueManagementConstants';
import { getErrorMessage } from './queueManagementUtils';

const GROUP_LIST_LIMIT = 12;

export interface QueueGroupTabContentProps {
	searchTerm: string;
	selectedGroupFilter: QueueGroupFilterValue;
	refreshKey?: number;
	onGroupSelect: (groupId: number) => void;
}

const QueueGroupTabContent: React.FC<QueueGroupTabContentProps> = ({
	searchTerm,
	selectedGroupFilter,
	refreshKey,
	onGroupSelect,
}) => {
	const [groups, setGroups] = useState<QueueGroup[]>([]);
	const groupOffsetRef = useRef(0);
	const [hasMoreGroups, setHasMoreGroups] = useState(true);
	const [isLoadingMoreGroups, setIsLoadingMoreGroups] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [error, setError] = useState('');
	const { showErrorNotification } = useToasterNotification();

	useEffect(() => {
		if (!error) return;
		showErrorNotification(error);
		setError('');
	}, [error, showErrorNotification]);

	const loadGroups = useCallback(
		async (reset = true) => {
			const offset = reset ? 0 : groupOffsetRef.current;
			try {
				if (!reset) setIsLoadingMoreGroups(true);
				const response = await queuesApi.groups({
					search: searchTerm || undefined,
					limit: GROUP_LIST_LIMIT,
					offset,
				});
				const incomingRows = response.results || [];
				const nextOffset = offset + incomingRows.length;
				setGroups((prev) => (reset ? incomingRows : [...prev, ...incomingRows]));
				groupOffsetRef.current = nextOffset;
				setHasMoreGroups(nextOffset < (response.count ?? nextOffset));
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				if (!reset) setIsLoadingMoreGroups(false);
			}
		},
		[searchTerm],
	);

	useEffect(() => {
		let isMounted = true;
		const run = async () => {
			groupOffsetRef.current = 0;
			setInitialLoading(true);
			setError('');
			await loadGroups(true);
			if (isMounted) setInitialLoading(false);
		};
		void run();
		return () => {
			isMounted = false;
		};
	}, [searchTerm, refreshKey, loadGroups]);

	const handleScroll = useCallback(
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

	const sortedGroups = useMemo(
		() =>
			[...groups].sort((a, b) =>
				(a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
			),
		[groups],
	);

	if (initialLoading) {
		return <QueueManagementSkeleton count={8} />;
	}

	return (
		<div className='queue-cards-scroll' onScroll={handleScroll}>
			{!sortedGroups.length ? (
				<p className='text-muted mb-0'>No queue groups found.</p>
			) : (
				<Row className='g-3 mx-0'>
					{sortedGroups.map((group) => {
						const isActive = selectedGroupFilter === group.id;
						return (
							<Col xs={12} sm={6} lg={4} xl={3} className='px-2' key={group.id}>
								<div
									className={`queue-modern-card ${isActive ? 'queue-modern-card--selected' : ''}`}
									onClick={() => onGroupSelect(group.id)}
									role='button'>
									<div className='queue-modern-card__header'>
										<div className='queue-modern-card__header-main d-flex align-items-center gap-3'>
											<div className='queue-modern-card__icon-box'>
												<Icon icon='Groups' className='queue-modern-card__icon' />
											</div>
											<div className='queue-modern-card__title'>
												{group.name || `Group ${group.id}`}
											</div>
										</div>
										<Badge color='info' isLight>
											Group
										</Badge>
									</div>
									<div className='queue-modern-card__desc'>
										{group.description || 'Click to open queues in this group'}
									</div>
									<hr className='queue-modern-card__divider' />
									<div className='d-flex flex-wrap gap-2'>
										<div className='queue-modern-card__meta-pill'>
											<span className='queue-modern-card__meta-label'>Queues</span>
											<span className='queue-modern-card__meta-value'>0</span>
										</div>
									</div>
								</div>
							</Col>
						);
					})}
				</Row>
			)}
			{isLoadingMoreGroups && (
				<div className='py-3'>
					<QueueManagementSkeleton count={4} />
				</div>
			)}
		</div>
	);
};

export default QueueGroupTabContent;

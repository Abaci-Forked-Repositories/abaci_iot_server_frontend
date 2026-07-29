import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import type { QueueGroup } from '../../../services/queueManagementApi';
import { queuesApi } from '../../../services/queueManagementApi';
import QueueManagementSkeleton from '../../CustomComponent/Skeleton/QueueManagementSkeleton';
import useToasterNotification from '../../../hooks/useToasterNotification';
import type { QueueGroupFilterValue } from './queueManagementConstants';
import { getErrorMessage } from './queueManagementUtils';
import QueueGroupCardTile from './QueueGroupCardTile';
import noqueuelottie from '../../../assets/Lottie/noqueuelottie.json';
import Button from '../../bootstrap/Button';
import { Player } from '@lottiefiles/react-lottie-player';

const GROUP_LIST_LIMIT = 12;

export interface QueueGroupTabContentProps {
	searchTerm: string;
	selectedGroupFilter: QueueGroupFilterValue;
	refreshKey?: number;
	onGroupSelect: (group: QueueGroup) => void;
	onEditGroup: (group: QueueGroup) => void;
	onDeleteGroup: (group: QueueGroup) => void;
	isGroupDeleteLoading: (groupId: number) => boolean;
}

const QueueGroupTabContent: React.FC<QueueGroupTabContentProps> = ({
	searchTerm,
	selectedGroupFilter,
	refreshKey,
	onGroupSelect,
	onEditGroup,
	onDeleteGroup,
	isGroupDeleteLoading,
}) => {
	const [groups, setGroups] = useState<QueueGroup[]>([]);
	const groupOffsetRef = useRef(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const isFetchingMoreRef = useRef(false);
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
			if (!reset) {
				if (isFetchingMoreRef.current) return;
				isFetchingMoreRef.current = true;
				setIsLoadingMoreGroups(true);
			}
			try {
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
				if (!reset) {
					setIsLoadingMoreGroups(false);
					isFetchingMoreRef.current = false;
				}
			}
		},
		[searchTerm],
	);

	useEffect(() => {
		let isMounted = true;
		const run = async () => {
			groupOffsetRef.current = 0;
			isFetchingMoreRef.current = false;
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

	// When the first page fits the viewport (no overflow), scroll-to-load never fires —
	// keep fetching until content overflows or there are no more rows.
	useEffect(() => {
		if (initialLoading) return;
		if (!hasMoreGroups || isLoadingMoreGroups) return;
		const el = scrollRef.current;
		if (!el || groups.length === 0) return;

		const frame = window.requestAnimationFrame(() => {
			const { scrollHeight, clientHeight } = el;
			if (scrollHeight <= clientHeight + 1) {
				void loadGroups(false);
			}
		});
		return () => window.cancelAnimationFrame(frame);
	}, [groups, hasMoreGroups, isLoadingMoreGroups, initialLoading, loadGroups]);

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

	if (!sortedGroups.length) {
		return (
			<div className='queue-empty-state d-flex flex-column align-items-center justify-content-center'>
				<Player
					autoplay
					loop
					src={noqueuelottie}
					renderer='svg'
					style={{ width: 460, height: 260, maxWidth: '100%', marginBottom: '1px' }}
				/>
				<p className='text-muted mb-0'>No queue groups found.</p>
			</div>
		);
	}

	return (
		<div className='queue-cards-scroll' ref={scrollRef} onScroll={handleScroll}>
			<Row className='g-3 mx-0'>
				{sortedGroups.map((group) => (
					<Col xs={12} sm={6} lg={4} xl={3} className='px-2' key={group.id}>
						<QueueGroupCardTile
							group={group}
							queueCount={group.queue_count ?? 0}
							selected={selectedGroupFilter === group.id}
							onSelect={(g) => onGroupSelect(g)}
							onEditGroup={onEditGroup}
							onDeleteGroup={onDeleteGroup}
							isDeleteLoading={isGroupDeleteLoading(group.id)}
						/>
					</Col>
				))}
			</Row>
			{isLoadingMoreGroups && (
				<div className='py-3'>
					<QueueManagementSkeleton count={4} />
				</div>
			)}
			{hasMoreGroups && (
				<div className='d-flex justify-content-center py-3'>
					<Button
						color='primary'
						isLight
						isDisable={isLoadingMoreGroups}
						onClick={() => void loadGroups(false)}>
						{isLoadingMoreGroups ? 'Loading…' : 'Load more'}
					</Button>
				</div>
			)}
		</div>
	);
};

export default QueueGroupTabContent;

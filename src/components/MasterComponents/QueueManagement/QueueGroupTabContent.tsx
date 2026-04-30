import React, { useMemo } from 'react';
import { Col, Row } from 'reactstrap';
import Badge from '../../bootstrap/Badge';
import Icon from '../../icon/Icon';
import type { Queue, QueueGroup } from '../../../services/queueManagementApi';
import type { QueueGroupFilterValue } from './queueManagementConstants';

interface QueueGroupTabContentProps {
	groups: QueueGroup[];
	queues?: Queue[];
	queueCountsByGroup?: Map<number, number>;
	selectedGroupFilter: QueueGroupFilterValue;
	onGroupSelect: (groupId: number) => void;
}

const QueueGroupTabContent: React.FC<QueueGroupTabContentProps> = ({
	groups,
	queues,
	queueCountsByGroup,
	selectedGroupFilter,
	onGroupSelect,
}) => {
	const sortedGroups = useMemo(
		() =>
			[...groups].sort((a, b) =>
				(a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
			),
		[groups],
	);

	const countsByGroup = useMemo(() => {
		if (queueCountsByGroup) return queueCountsByGroup;
		const map = new Map<number, number>();
		for (const q of queues || []) {
			if (typeof q.group === 'number') {
				map.set(q.group, (map.get(q.group) || 0) + 1);
			}
		}
		return map;
	}, [queueCountsByGroup, queues]);

	if (!sortedGroups.length) {
		return <p className='text-muted mb-0'>No queue groups found.</p>;
	}

	return (
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
									<div className='queue-modern-card__title'>{group.name || `Group ${group.id}`}</div>
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
									<span className='queue-modern-card__meta-value'>{countsByGroup.get(group.id) || 0}</span>
								</div>
							</div>
						</div>
					</Col>
				);
			})}
		</Row>
	);
};

export default QueueGroupTabContent;


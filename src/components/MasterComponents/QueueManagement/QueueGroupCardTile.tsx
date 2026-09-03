import React from 'react';
import type { QueueGroup } from '../../../services/queueManagementApi';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '../../bootstrap/Dropdown';
import Icon from '../../icon/Icon';
import Button from '../../bootstrap/Button';
import Badge from '../../bootstrap/Badge';
import usePermissions from '../../../hooks/usePermissions';

interface QueueGroupCardTileProps {
	group: QueueGroup;
	queueCount: number;
	selected: boolean;
	onSelect: (group: QueueGroup) => void;
	onEditGroup: (group: QueueGroup) => void;
	onDeleteGroup: (group: QueueGroup) => void;
	isDeleteLoading: boolean;
}

const QueueGroupCardTile: React.FC<QueueGroupCardTileProps> = ({
	group,
	queueCount,
	selected,
	onSelect,
	onEditGroup,
	onDeleteGroup,
	isDeleteLoading,
}) => {
	const { can } = usePermissions();
	const canWrite = can('queue_management_write');

	return (
	<div
		className={`queue-modern-card ${selected ? 'queue-modern-card--selected' : ''}`}
		onClick={() => onSelect(group)}
		role='button'>
		<div className='queue-modern-card__body'>
			<div className='queue-modern-card__head'>
				<div className='queue-modern-card__identity'>
					<div className='queue-modern-card__icon-box' aria-hidden>
						<Icon icon='Groups' className='queue-modern-card__icon' />
					</div>
					<div className='queue-modern-card__title' title={group.name || undefined}>
						{group.name || `Group ${group.id}`}
					</div>
				</div>
				<div className='queue-modern-card__actions'>
					<Badge color='info' isLight className='rounded-pill px-2 py-1'>
						Group
					</Badge>
					{canWrite && (
					<div onClick={(e) => e.stopPropagation()} role='presentation'>
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button
									type='button'
									color='light'
									size='sm'
									className='queue-modern-card__menu-btn'
									aria-label='Group actions'>
									<Icon icon='MoreVert' />
								</Button>
							</DropdownToggle>
							<DropdownMenu isAlignmentEnd>
								<DropdownItem>
									<button
										type='button'
										className='btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 text-body'
										onClick={() => onEditGroup(group)}>
										<Icon icon='Edit' />
										<span>Edit group</span>
									</button>
								</DropdownItem>
								<DropdownItem>
									<button
										type='button'
										className='btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 text-danger'
										onClick={() => onDeleteGroup(group)}
										disabled={isDeleteLoading}>
										<Icon icon='Delete' />
										<span>{isDeleteLoading ? 'Deleting...' : 'Delete group'}</span>
									</button>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				)}
				</div>
			</div>
			<p className='queue-modern-card__desc'>
				{group.description || 'Click to open queues in this group'}
			</p>
		</div>
		<div className='queue-modern-card__footer queue-modern-card__footer--single'>
			<div className='queue-modern-card__meta-item'>
				<span className='queue-modern-card__meta-label'>Queues</span>
				<span className='queue-modern-card__meta-value'>{queueCount}</span>
			</div>
		</div>
	</div>
	);
};

export default QueueGroupCardTile;

import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface PageTurnQueueTableProps {
	rows: PageTurnServingRow[];
	activeQueueName?: string;
}

const PageTurnQueueTable: React.FC<PageTurnQueueTableProps> = ({
	rows,
	activeQueueName,
}) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-pt-table-wrap' role='region' aria-label='Serving points'>
			<table className='tdc-pt-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-pt-table__col-point'>
							<span className='tdc-pt-table__head-long'>Serving Point</span>
							<span className='tdc-pt-table__head-short' aria-hidden='true'>
								Point
							</span>
						</th>
						<th scope='col' className='tdc-pt-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-pt-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => {
						const isActive = Boolean(
							activeQueueName && row.queueName === activeQueueName,
						);
						return (
							<tr
								key={row.id}
								className={[
									'tdc-pt-table__row',
									isActive ? 'tdc-pt-table__row--active' : '',
								]
									.filter(Boolean)
									.join(' ')}>
								<td className='tdc-pt-table__cell tdc-pt-table__cell--point'>
									<span className='tdc-pt-table__point' title={row.servingPointName}>
										{row.servingPointName}
									</span>
								</td>
								<td className='tdc-pt-table__cell tdc-pt-table__cell--token'>
									<span className='tdc-pt-table__token'>{row.tokenDisplay}</span>
								</td>
								<td className='tdc-pt-table__cell tdc-pt-table__cell--status'>
									<span
										className={[
											'tdc-pt-table__status',
											`tdc-pt-table__status--${row.statusModifier}`,
										].join(' ')}>
										<span className='tdc-pt-table__status-dot' aria-hidden='true' />
										<span className='tdc-pt-table__status-label'>{row.statusLabel}</span>
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default PageTurnQueueTable;

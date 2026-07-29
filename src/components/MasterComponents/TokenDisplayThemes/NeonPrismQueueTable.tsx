import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface NeonPrismQueueTableProps {
	rows: PageTurnServingRow[];
}

const NeonPrismQueueTable: React.FC<NeonPrismQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-np-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-np-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-np-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-np-table__col-point'>
							<span className='tdc-np-table__head-long'>Counter</span>
							<span className='tdc-np-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-np-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-np-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className='tdc-np-table__row'>
							<td className='tdc-np-table__cell tdc-np-table__cell--queue'>
								<span className='tdc-np-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-np-table__cell tdc-np-table__cell--point'>
								<span className='tdc-np-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-np-table__cell tdc-np-table__cell--token'>
								<span className='tdc-np-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-np-table__cell tdc-np-table__cell--status'>
								<span
									className={[
										'tdc-np-table__status',
										`tdc-np-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-np-table__status-dot' aria-hidden='true' />
									<span className='tdc-np-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default NeonPrismQueueTable;

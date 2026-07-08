import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface HealthcareDashboardQueueTableProps {
	rows: PageTurnServingRow[];
}

const HealthcareDashboardQueueTable: React.FC<HealthcareDashboardQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-dh-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-dh-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-dh-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-dh-table__col-point'>
							<span className='tdc-dh-table__head-long'>Counter</span>
							<span className='tdc-dh-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-dh-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-dh-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className='tdc-dh-table__row'>
							<td className='tdc-dh-table__cell tdc-dh-table__cell--queue'>
								<span className='tdc-dh-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-dh-table__cell tdc-dh-table__cell--point'>
								<span className='tdc-dh-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-dh-table__cell tdc-dh-table__cell--token'>
								<span className='tdc-dh-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-dh-table__cell tdc-dh-table__cell--status'>
								<span
									className={[
										'tdc-dh-table__status',
										`tdc-dh-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-dh-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default HealthcareDashboardQueueTable;

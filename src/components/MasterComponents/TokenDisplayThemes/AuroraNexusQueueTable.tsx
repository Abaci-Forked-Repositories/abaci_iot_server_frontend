import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface AuroraNexusQueueTableProps {
	rows: PageTurnServingRow[];
}

const AuroraNexusQueueTable: React.FC<AuroraNexusQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-an-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-an-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-an-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-an-table__col-point'>
							<span className='tdc-an-table__head-long'>Counter</span>
							<span className='tdc-an-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-an-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-an-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className='tdc-an-table__row'>
							<td className='tdc-an-table__cell tdc-an-table__cell--queue'>
								<span className='tdc-an-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-an-table__cell tdc-an-table__cell--point'>
								<span className='tdc-an-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-an-table__cell tdc-an-table__cell--token'>
								<span className='tdc-an-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-an-table__cell tdc-an-table__cell--status'>
								<span
									className={[
										'tdc-an-table__status',
										`tdc-an-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-an-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default AuroraNexusQueueTable;

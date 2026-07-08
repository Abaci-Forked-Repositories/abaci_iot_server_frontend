import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface OledPulseQueueTableProps {
	rows: PageTurnServingRow[];
}

const OledPulseQueueTable: React.FC<OledPulseQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-op-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-op-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-op-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-op-table__col-point'>
							<span className='tdc-op-table__head-long'>Counter</span>
							<span className='tdc-op-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-op-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-op-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className='tdc-op-table__row'>
							<td className='tdc-op-table__cell tdc-op-table__cell--queue'>
								<span className='tdc-op-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-op-table__cell tdc-op-table__cell--point'>
								<span className='tdc-op-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-op-table__cell tdc-op-table__cell--token'>
								<span className='tdc-op-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-op-table__cell tdc-op-table__cell--status'>
								<span
									className={[
										'tdc-op-table__status',
										`tdc-op-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-op-table__status-dot' aria-hidden='true' />
									<span className='tdc-op-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default OledPulseQueueTable;

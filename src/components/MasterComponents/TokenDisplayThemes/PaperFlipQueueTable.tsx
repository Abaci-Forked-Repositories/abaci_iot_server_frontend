import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface PaperFlipQueueTableProps {
	rows: PageTurnServingRow[];
}

const PaperFlipQueueTable: React.FC<PaperFlipQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-pf-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-pf-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-pf-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-pf-table__col-point'>
							<span className='tdc-pf-table__head-long'>Counter</span>
							<span className='tdc-pf-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-pf-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-pf-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className='tdc-pf-table__row'>
							<td className='tdc-pf-table__cell tdc-pf-table__cell--queue'>
								<span className='tdc-pf-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-pf-table__cell tdc-pf-table__cell--point'>
								<span className='tdc-pf-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-pf-table__cell tdc-pf-table__cell--token'>
								<span className='tdc-pf-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-pf-table__cell tdc-pf-table__cell--status'>
								<span
									className={[
										'tdc-pf-table__status',
										`tdc-pf-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-pf-table__status-dot' aria-hidden='true' />
									<span className='tdc-pf-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default PaperFlipQueueTable;

import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface MonoFlipQueueTableProps {
	rows: PageTurnServingRow[];
}

const MonoFlipQueueTable: React.FC<MonoFlipQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-mf-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-mf-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-mf-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-mf-table__col-point'>
							<span className='tdc-mf-table__head-long'>Counter</span>
							<span className='tdc-mf-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-mf-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-mf-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-mf-table__row',
								index % 2 === 0 ? 'tdc-mf-table__row--light' : 'tdc-mf-table__row--dark',
							].join(' ')}>
							<td className='tdc-mf-table__cell tdc-mf-table__cell--queue'>
								<span className='tdc-mf-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-mf-table__cell tdc-mf-table__cell--point'>
								<span className='tdc-mf-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-mf-table__cell tdc-mf-table__cell--token'>
								<span className='tdc-mf-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-mf-table__cell tdc-mf-table__cell--status'>
								<span
									className={[
										'tdc-mf-table__status',
										`tdc-mf-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-mf-table__status-dot' aria-hidden='true' />
									<span className='tdc-mf-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default MonoFlipQueueTable;

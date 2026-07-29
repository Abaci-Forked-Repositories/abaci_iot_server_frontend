import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface MetroMosaicQueueTableProps {
	rows: PageTurnServingRow[];
}

const MetroMosaicQueueTable: React.FC<MetroMosaicQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-mm-table-wrap' role='region' aria-label='Metro mosaic serving board'>
			<table className='tdc-mm-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-mm-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-mm-table__col-point'>
							<span className='tdc-mm-table__head-long'>Counter</span>
							<span className='tdc-mm-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-mm-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-mm-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-mm-table__row',
								index % 2 === 0 ? 'tdc-mm-table__row--even' : 'tdc-mm-table__row--odd',
								row.statusModifier === 'serving' ? 'tdc-mm-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}
							style={{ animationDelay: `${0.2 + index * 0.06}s` }}>
							<td className='tdc-mm-table__cell tdc-mm-table__cell--queue'>
								<span className='tdc-mm-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-mm-table__cell tdc-mm-table__cell--point'>
								<span className='tdc-mm-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-mm-table__cell tdc-mm-table__cell--token'>
								<span className='tdc-mm-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-mm-table__cell tdc-mm-table__cell--status'>
								<span
									className={[
										'tdc-mm-table__status',
										`tdc-mm-table__status--${row.statusModifier}`,
									].join(' ')}>
									{row.statusLabel}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default MetroMosaicQueueTable;

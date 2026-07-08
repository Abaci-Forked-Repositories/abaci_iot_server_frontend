import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface AirportArrivalQueueTableProps {
	rows: PageTurnServingRow[];
}

const AirportArrivalQueueTable: React.FC<AirportArrivalQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-aa-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-aa-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-aa-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-aa-table__col-point'>
							<span className='tdc-aa-table__head-long'>Counter</span>
							<span className='tdc-aa-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-aa-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-aa-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-aa-table__row',
								index % 2 === 0 ? 'tdc-aa-table__row--odd' : 'tdc-aa-table__row--even',
								row.statusModifier === 'serving' ? 'tdc-aa-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}>
							<td className='tdc-aa-table__cell tdc-aa-table__cell--queue'>
								<span className='tdc-aa-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-aa-table__cell tdc-aa-table__cell--point'>
								<span className='tdc-aa-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-aa-table__cell tdc-aa-table__cell--token'>
								<span className='tdc-aa-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-aa-table__cell tdc-aa-table__cell--status'>
								<span
									className={[
										'tdc-aa-table__status',
										`tdc-aa-table__status--${row.statusModifier}`,
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

export default AirportArrivalQueueTable;

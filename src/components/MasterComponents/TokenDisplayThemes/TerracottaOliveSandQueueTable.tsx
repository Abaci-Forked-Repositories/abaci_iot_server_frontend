import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface TerracottaOliveSandQueueTableProps {
	rows: PageTurnServingRow[];
}

const TerracottaOliveSandQueueTable: React.FC<TerracottaOliveSandQueueTableProps> = ({
	rows,
}) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-tos-table-wrap' role='region' aria-label='Terracotta olive sand serving board'>
			<table className='tdc-tos-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-tos-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-tos-table__col-point'>
							<span className='tdc-tos-table__head-long'>Counter</span>
							<span className='tdc-tos-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-tos-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-tos-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-tos-table__row',
								index % 2 === 0 ? 'tdc-tos-table__row--even' : 'tdc-tos-table__row--odd',
								row.statusModifier === 'serving' ? 'tdc-tos-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}
							style={{ animationDelay: `${0.35 + index * 0.07}s` }}>
							<td className='tdc-tos-table__cell tdc-tos-table__cell--queue'>
								<span className='tdc-tos-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-tos-table__cell tdc-tos-table__cell--point'>
								<span className='tdc-tos-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-tos-table__cell tdc-tos-table__cell--token'>
								<span className='tdc-tos-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-tos-table__cell tdc-tos-table__cell--status'>
								<span
									className={[
										'tdc-tos-table__status',
										`tdc-tos-table__status--${row.statusModifier}`,
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

export default TerracottaOliveSandQueueTable;

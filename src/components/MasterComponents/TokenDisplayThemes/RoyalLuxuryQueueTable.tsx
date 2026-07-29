import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface RoyalLuxuryQueueTableProps {
	rows: PageTurnServingRow[];
}

const RoyalLuxuryQueueTable: React.FC<RoyalLuxuryQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-rl-table-wrap' role='region' aria-label='Gilded court serving board'>
			<table className='tdc-rl-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-rl-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-rl-table__col-point'>
							<span className='tdc-rl-table__head-long'>Counter</span>
							<span className='tdc-rl-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-rl-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-rl-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-rl-table__row',
								index % 2 === 0 ? 'tdc-rl-table__row--even' : 'tdc-rl-table__row--odd',
								row.statusModifier === 'serving' ? 'tdc-rl-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}
							style={{ animationDelay: `${0.55 + index * 0.07}s` }}>
							<td className='tdc-rl-table__cell tdc-rl-table__cell--queue'>
								<span className='tdc-rl-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-rl-table__cell tdc-rl-table__cell--point'>
								<span className='tdc-rl-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-rl-table__cell tdc-rl-table__cell--token'>
								<span className='tdc-rl-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-rl-table__cell tdc-rl-table__cell--status'>
								<span
									className={[
										'tdc-rl-table__status',
										`tdc-rl-table__status--${row.statusModifier}`,
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

export default RoyalLuxuryQueueTable;

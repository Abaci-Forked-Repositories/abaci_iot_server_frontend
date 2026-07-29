import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface GalaxySpiralQueueTableProps {
	rows: PageTurnServingRow[];
}

const GalaxySpiralQueueTable: React.FC<GalaxySpiralQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-gs-table-wrap' role='region' aria-label='Galaxy spiral serving board'>
			<table className='tdc-gs-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-gs-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-gs-table__col-point'>
							<span className='tdc-gs-table__head-long'>Counter</span>
							<span className='tdc-gs-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-gs-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-gs-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-gs-table__row',
								index % 2 === 0 ? 'tdc-gs-table__row--even' : 'tdc-gs-table__row--odd',
								row.statusModifier === 'serving' ? 'tdc-gs-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}
							style={{ animationDelay: `${0.4 + index * 0.06}s` }}>
							<td className='tdc-gs-table__cell tdc-gs-table__cell--queue'>
								<span className='tdc-gs-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-gs-table__cell tdc-gs-table__cell--point'>
								<span className='tdc-gs-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-gs-table__cell tdc-gs-table__cell--token'>
								<span className='tdc-gs-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-gs-table__cell tdc-gs-table__cell--status'>
								<span
									className={[
										'tdc-gs-table__status',
										`tdc-gs-table__status--${row.statusModifier}`,
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

export default GalaxySpiralQueueTable;

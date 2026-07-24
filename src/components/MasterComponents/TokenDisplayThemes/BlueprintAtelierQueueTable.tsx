import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface BlueprintAtelierQueueTableProps {
	rows: PageTurnServingRow[];
}

const BlueprintAtelierQueueTable: React.FC<BlueprintAtelierQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-ba-table-wrap' role='region' aria-label='Blueprint atelier serving board'>
			<table className='tdc-ba-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-ba-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-ba-table__col-point'>
							<span className='tdc-ba-table__head-long'>Counter</span>
							<span className='tdc-ba-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-ba-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-ba-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-ba-table__row',
								index % 2 === 0 ? 'tdc-ba-table__row--even' : 'tdc-ba-table__row--odd',
								row.statusModifier === 'serving' ? 'tdc-ba-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}
							style={{ animationDelay: `${0.16 + index * 0.05}s` }}>
							<td className='tdc-ba-table__cell tdc-ba-table__cell--queue'>
								<span className='tdc-ba-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-ba-table__cell tdc-ba-table__cell--point'>
								<span className='tdc-ba-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-ba-table__cell tdc-ba-table__cell--token'>
								<span className='tdc-ba-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-ba-table__cell tdc-ba-table__cell--status'>
								<span
									className={[
										'tdc-ba-table__status',
										`tdc-ba-table__status--${row.statusModifier}`,
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

export default BlueprintAtelierQueueTable;

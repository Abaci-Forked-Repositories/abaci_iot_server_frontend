import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface SpeedometerQueueTableProps {
	rows: PageTurnServingRow[];
}

const SpeedometerQueueTable: React.FC<SpeedometerQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-cs-table-wrap' role='region' aria-label='Queue dashboard board'>
			<table className='tdc-cs-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-cs-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-cs-table__col-point'>
							<span className='tdc-cs-table__head-long'>Counter</span>
							<span className='tdc-cs-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-cs-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-cs-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-cs-table__row',
								index % 2 === 0 ? 'tdc-cs-table__row--even' : 'tdc-cs-table__row--odd',
							].join(' ')}>
							<td className='tdc-cs-table__cell tdc-cs-table__cell--queue'>
								<span className='tdc-cs-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-cs-table__cell tdc-cs-table__cell--point'>
								<span className='tdc-cs-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-cs-table__cell tdc-cs-table__cell--token'>
								<span className='tdc-cs-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-cs-table__cell tdc-cs-table__cell--status'>
								<span
									className={[
										'tdc-cs-table__status',
										`tdc-cs-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-cs-table__status-gauge' aria-hidden='true'>
										<span className='tdc-cs-table__status-arc tdc-cs-table__status-arc--waiting' />
										<span className='tdc-cs-table__status-arc tdc-cs-table__status-arc--serving' />
										<span
											className={[
												'tdc-cs-table__status-needle',
												row.statusModifier === 'serving'
													? 'tdc-cs-table__status-needle--serving'
													: 'tdc-cs-table__status-needle--waiting',
											].join(' ')}
										/>
									</span>
									<span className='tdc-cs-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default SpeedometerQueueTable;

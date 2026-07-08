import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';
import AirportDepartureToken from './AirportDepartureToken';

export interface AirportDepartureQueueTableProps {
	rows: PageTurnServingRow[];
}

const AirportDepartureQueueTable: React.FC<AirportDepartureQueueTableProps> = ({
	rows,
}) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-ad-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-ad-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-ad-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-ad-table__col-point'>
							<span className='tdc-ad-table__head-long'>Counter</span>
							<span className='tdc-ad-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-ad-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-ad-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.id}
							className={[
								'tdc-ad-table__row',
								index % 2 === 0 ? 'tdc-ad-table__row--odd' : 'tdc-ad-table__row--even',
								row.statusModifier === 'serving' ? 'tdc-ad-table__row--serving' : '',
							]
								.filter(Boolean)
								.join(' ')}>
							<td className='tdc-ad-table__cell tdc-ad-table__cell--queue'>
								<span className='tdc-ad-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-ad-table__cell tdc-ad-table__cell--point'>
								<span className='tdc-ad-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-ad-table__cell tdc-ad-table__cell--token'>
								<AirportDepartureToken value={row.tokenDisplay} size='table' />
							</td>
								<td className='tdc-ad-table__cell tdc-ad-table__cell--status'>
									<span
										className={[
											'tdc-ad-table__status',
											`tdc-ad-table__status--${row.statusModifier}`,
										].join(' ')}>
										<span className='tdc-ad-table__status-dot' aria-hidden='true' />
										<span className='tdc-ad-table__status-label'>{row.statusLabel}</span>
									</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default AirportDepartureQueueTable;

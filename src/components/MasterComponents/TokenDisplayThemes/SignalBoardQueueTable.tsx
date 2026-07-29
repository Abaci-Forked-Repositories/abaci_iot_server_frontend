import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface SignalBoardQueueTableProps {
	rows: PageTurnServingRow[];
	activeQueueName?: string;
}

const SignalBoardQueueTable: React.FC<SignalBoardQueueTableProps> = ({
	rows,
	activeQueueName,
}) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-sig-table-wrap' role='region' aria-label='Serving points'>
			<table className='tdc-sig-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-sig-table__col-point'>
							<span className='tdc-sig-table__head-long'>Serving Point</span>
							<span className='tdc-sig-table__head-short' aria-hidden='true'>
								Point
							</span>
						</th>
						<th scope='col' className='tdc-sig-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-sig-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => {
						const isActive = Boolean(
							activeQueueName && row.queueName === activeQueueName,
						);
						return (
							<tr
								key={row.id}
								className={[
									'tdc-sig-table__row',
									isActive ? 'tdc-sig-table__row--active' : '',
								]
									.filter(Boolean)
									.join(' ')}>
								<td className='tdc-sig-table__cell tdc-sig-table__cell--point'>
									<span className='tdc-sig-table__point' title={row.servingPointName}>
										{row.servingPointName}
									</span>
								</td>
								<td className='tdc-sig-table__cell tdc-sig-table__cell--token'>
									<span className='tdc-sig-table__token'>{row.tokenDisplay}</span>
								</td>
								<td className='tdc-sig-table__cell tdc-sig-table__cell--status'>
									<span
										className={[
											'tdc-sig-table__status',
											`tdc-sig-table__status--${row.statusModifier}`,
										].join(' ')}>
										<span className='tdc-sig-table__status-dot' aria-hidden='true' />
										<span className='tdc-sig-table__status-label'>{row.statusLabel}</span>
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default SignalBoardQueueTable;

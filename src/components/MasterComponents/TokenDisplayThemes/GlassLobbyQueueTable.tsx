import React from 'react';
import type { PageTurnServingRow } from '../../../utils/zoneQueueResolution';

export interface GlassLobbyQueueTableProps {
	rows: PageTurnServingRow[];
}

const GlassLobbyQueueTable: React.FC<GlassLobbyQueueTableProps> = ({ rows }) => {
	if (!rows.length) return null;

	return (
		<div className='tdc-gl-table-wrap' role='region' aria-label='Queue serving board'>
			<table className='tdc-gl-table'>
				<thead>
					<tr>
						<th scope='col' className='tdc-gl-table__col-queue'>
							Queue
						</th>
						<th scope='col' className='tdc-gl-table__col-point'>
							<span className='tdc-gl-table__head-long'>Counter</span>
							<span className='tdc-gl-table__head-short' aria-hidden='true'>
								Ctr
							</span>
						</th>
						<th scope='col' className='tdc-gl-table__col-token'>
							Token
						</th>
						<th scope='col' className='tdc-gl-table__col-status'>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className='tdc-gl-table__row'>
							<td className='tdc-gl-table__cell tdc-gl-table__cell--queue'>
								<span className='tdc-gl-table__queue' title={row.queueName}>
									{row.queueName}
								</span>
							</td>
							<td className='tdc-gl-table__cell tdc-gl-table__cell--point'>
								<span className='tdc-gl-table__point' title={row.servingPointName}>
									{row.servingPointName}
								</span>
							</td>
							<td className='tdc-gl-table__cell tdc-gl-table__cell--token'>
								<span className='tdc-gl-table__token'>{row.tokenDisplay}</span>
							</td>
							<td className='tdc-gl-table__cell tdc-gl-table__cell--status'>
								<span
									className={[
										'tdc-gl-table__status',
										`tdc-gl-table__status--${row.statusModifier}`,
									].join(' ')}>
									<span className='tdc-gl-table__status-dot' aria-hidden='true' />
									<span className='tdc-gl-table__status-label'>{row.statusLabel}</span>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default GlassLobbyQueueTable;

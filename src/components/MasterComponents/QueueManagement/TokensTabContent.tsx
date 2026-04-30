import React from 'react';
import type { Queue, QueueSchedule, QueueStatistics, QueueStatus, ServingPoint, Token } from '../../../services/queueManagementApi';
import type { CreateTokenPayload } from '../../../services/queueManagementApi';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Badge from '../../bootstrap/Badge';
import TokenCreateForm from '../../PageComponents/QueueManagement/TokenCreateForm';
import { formatDate, getTokenQueueName, statusBadgeColor } from './queueManagementUtils';
import { TOKEN_STATUSES } from './queueManagementConstants';

export interface TokensTabContentProps {
	queues: Queue[];
	schedules: QueueSchedule[];
	servingPoints?: ServingPoint[];
	queueStats: QueueStatistics | null;
	queueStatus: QueueStatus | null;
	tokens: Token[];
	recentTokens: Token[];
	todayTokens: Token[];
	tokenForm: CreateTokenPayload;
	setTokenForm: React.Dispatch<React.SetStateAction<CreateTokenPayload>>;
	onCreateToken: (e: React.FormEvent<HTMLFormElement>) => void;
	createTokenLoading: boolean;
	tokenSearch: string;
	setTokenSearch: (v: string) => void;
	tokenStatusFilter: string;
	setTokenStatusFilter: (v: string) => void;
	selectedQueueId: number;
	setSelectedQueueId: (v: number) => void;
	onFilterTokens: () => void;
	renderTokenActions: (token: Token) => React.ReactNode;
}

const scheduleLabel = (id: number | undefined, schedules: QueueSchedule[]) => {
	if (id == null) return '—';
	const s = schedules.find((x) => x.id === id);
	if (!s) return `#${id}`;
	return s.description?.trim() || `${s.queue_name ?? 'Schedule'} · ${s.from_datetime?.slice(0, 10) ?? id}`;
};

const TokensTabContent: React.FC<TokensTabContentProps> = ({
	queues,
	schedules,
	servingPoints,
	queueStats,
	queueStatus,
	tokens,
	recentTokens,
	todayTokens,
	tokenForm,
	setTokenForm,
	onCreateToken,
	createTokenLoading,
	tokenSearch,
	setTokenSearch,
	tokenStatusFilter,
	setTokenStatusFilter,
	selectedQueueId,
	setSelectedQueueId,
	onFilterTokens,
	renderTokenActions,
}) => {
	const renderStats = () => (
		<div className='row g-3 mb-4'>
			{[
				{ label: 'Total', value: queueStats?.total_tokens ?? queueStatus?.total ?? 0 },
				{ label: 'Reported', value: queueStats?.reported ?? queueStatus?.reported ?? 0 },
				{ label: 'Serving', value: queueStats?.serving ?? queueStatus?.serving ?? 0 },
				{
					label: 'Completed Today',
					value: queueStatus?.completed_today ?? queueStats?.completed ?? 0,
				},
				{ label: 'No Show', value: queueStats?.no_show ?? 0 },
				{ label: 'Cancelled', value: queueStats?.cancelled ?? 0 },
			].map((item) => (
				<div className='col-6 col-md-4 col-xl-2' key={item.label}>
					<div className='border rounded-3 p-3 h-100'>
						<div className='text-muted small'>{item.label}</div>
						<div className='fs-4 fw-semibold'>{item.value}</div>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<div className='row g-4'>
			<div className='col-12'>{renderStats()}</div>
			<div className='col-12 col-xl-4'>
				<Card stretch>
					<CardHeader>
						<CardLabel icon='AddCircle'>
							<CardTitle tag='h5'>Create Token</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						<TokenCreateForm
							tokenForm={tokenForm}
							setTokenForm={setTokenForm}
							queues={queues}
							schedules={schedules}
							selectedQueueId={selectedQueueId}
							onQueueChange={setSelectedQueueId}
							servingPoints={servingPoints}
							onSubmit={onCreateToken}
							isSubmitting={createTokenLoading}
						/>
					</CardBody>
				</Card>
			</div>
			<div className='col-12 col-xl-8'>
				<Card stretch>
					<CardHeader>
						<CardLabel icon='ConfirmationNumber'>
							<CardTitle tag='h5'>Tokens</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						<div className='row g-2 mb-3'>
							<div className='col-md-4'>
								<input
									className='form-control'
									placeholder='Search token'
									value={tokenSearch}
									onChange={(e) => setTokenSearch(e.target.value)}
								/>
							</div>
							<div className='col-md-3'>
								<select
									className='form-select'
									value={tokenStatusFilter}
									onChange={(e) => setTokenStatusFilter(e.target.value)}>
									<option value=''>All statuses</option>
									{TOKEN_STATUSES.map((status) => (
										<option value={status} key={status}>
											{status}
										</option>
									))}
								</select>
							</div>
							<div className='col-md-3'>
								<select
									className='form-select'
									value={selectedQueueId || ''}
									onChange={(e) => setSelectedQueueId(Number(e.target.value))}>
									<option value=''>All queues</option>
									{queues.map((queue) => (
										<option value={queue.id} key={queue.id}>
											{queue.name}
										</option>
									))}
								</select>
							</div>
							<div className='col-md-2'>
								<Button color='primary' className='w-100' onClick={onFilterTokens}>
									Filter
								</Button>
							</div>
						</div>
						<div className='table-responsive'>
							<table className='table table-modern align-middle'>
								<thead>
									<tr>
										<th>Token</th>
										<th>Customer</th>
										<th>Queue</th>
										<th>Schedule</th>
										<th>Status</th>
										<th>Created</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{tokens.map((token) => (
										<tr key={token.id}>
											<td>
												<div className='fw-semibold'>{token.token_number}</div>
											</td>
											<td>
												<div>{token.token_user?.name || '-'}</div>
												<div className='text-muted small'>
													{token.token_user?.phone || token.token_user?.email || '-'}
												</div>
											</td>
											<td>{getTokenQueueName(token.queue, queues)}</td>
											<td className='small'>
												{typeof token.schedule === 'number'
													? scheduleLabel(token.schedule, schedules)
													: '—'}
											</td>
											<td>
												<Badge color={statusBadgeColor(token.status)} isLight>
													{token.status}
												</Badge>
											</td>
											<td>{formatDate(token.created_at)}</td>
											<td>{renderTokenActions(token)}</td>
										</tr>
									))}
									{!tokens.length && (
										<tr>
											<td colSpan={7} className='text-center text-muted py-4'>
												No tokens found.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardBody>
				</Card>
			</div>
			<div className='col-md-6'>
				<Card>
					<CardHeader>
						<CardLabel icon='History'>
							<CardTitle tag='h5'>Recent Tokens</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						{recentTokens.map((token) => (
							<div className='d-flex justify-content-between border-bottom py-2' key={token.id}>
								<span>{token.token_number}</span>
								<Badge color={statusBadgeColor(token.status)} isLight>
									{token.status}
								</Badge>
							</div>
						))}
						{!recentTokens.length && <p className='text-muted mb-0'>No recent tokens.</p>}
					</CardBody>
				</Card>
			</div>
			<div className='col-md-6'>
				<Card>
					<CardHeader>
						<CardLabel icon='Today'>
							<CardTitle tag='h5'>Today</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						{todayTokens.map((token) => (
							<div className='d-flex justify-content-between border-bottom py-2' key={token.id}>
								<span>{token.token_number}</span>
								<span className='text-muted small'>
									{formatDate(token.completed_at || token.created_at)}
								</span>
							</div>
						))}
						{!todayTokens.length && <p className='text-muted mb-0'>No tokens created today.</p>}
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default TokensTabContent;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type Token,
	type TokenUser,
	tokensApi,
} from '../../../services/queueManagementApi';
import { formatDate, statusBadgeColor } from '../QueueManagement/queueManagementUtils';

type TokenUserDetailWorkspaceProps = {
	onTokenUserNameChange?: (name: string | null) => void;
};

const tokenQueueName = (token: Token): string => {
	if (typeof token.queue === 'object' && token.queue) {
		return token.queue.name || `Queue ${token.queue.id}`;
	}
	if (token.queue_name) return token.queue_name;
	if (typeof token.queue === 'number') return `Queue ${token.queue}`;
	return '—';
};

const TokenUserDetailWorkspace: React.FC<TokenUserDetailWorkspaceProps> = ({
	onTokenUserNameChange,
}) => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const id = Number(userId);
	const seededTokenUser =
		(location.state as { tokenUser?: TokenUser } | null)?.tokenUser ?? null;

	const [loading, setLoading] = useState(true);
	const [tokenUser, setTokenUser] = useState<TokenUser | null>(seededTokenUser);
	const [tokens, setTokens] = useState<Token[]>([]);

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const load = useCallback(async () => {
		if (!id || Number.isNaN(id)) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const [tokensRes, usersListRes] = await Promise.all([
				tokensApi.list({
					token_user: id,
					ordering: '-created_at',
					limit: 500,
					offset: 0,
				}),
				seededTokenUser
					? Promise.resolve(null)
					: tokensApi.users({ page: 1, page_size: 500 }),
			]);

			setTokens(tokensRes.results || []);

			if (!seededTokenUser) {
				const found =
					usersListRes?.results.find((u) => u.id === id) ?? null;
				if (found) setTokenUser(found);
				else {
					const fromTokens = (tokensRes.results || [])
						.map((t) => t.token_user)
						.find((u): u is TokenUser => Boolean(u && u.id === id));
					if (fromTokens) setTokenUser(fromTokens);
				}
			}
		} catch (err) {
			errorNotifierRef.current(err);
			setTokens([]);
		} finally {
			setLoading(false);
		}
	}, [id, seededTokenUser]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!onTokenUserNameChange) return;
		onTokenUserNameChange(tokenUser?.name ?? null);
	}, [onTokenUserNameChange, tokenUser?.name]);

	const columns = useMemo(
		() => [
			{
				title: 'Token',
				field: 'token_number',
				render: (rowData: Token) => (
					<span className='fw-semibold'>{rowData.token_number || '—'}</span>
				),
			},
			{
				title: 'Queue',
				field: 'queue',
				render: (rowData: Token) => tokenQueueName(rowData),
			},
			{
				title: 'Schedule',
				field: 'schedule',
				render: (rowData: Token) =>
					rowData.schedule != null ? `#${rowData.schedule}` : '—',
			},
			{
				title: 'Status',
				field: 'status',
				render: (rowData: Token) => (
					<Badge color={statusBadgeColor(rowData.status)} isLight>
						{rowData.status}
					</Badge>
				),
			},
			{
				title: 'Created at',
				field: 'created_at',
				render: (rowData: Token) => formatDate(rowData.created_at),
			},
			{
				title: 'Started serving',
				field: 'started_serving_at',
				render: (rowData: Token) => formatDate(rowData.started_serving_at),
			},
			{
				title: 'Completed',
				field: 'completed_at',
				render: (rowData: Token) => formatDate(rowData.completed_at),
			},
		],
		[],
	);

	if (!id || Number.isNaN(id)) {
		return <div className='alert alert-warning'>Invalid token user.</div>;
	}

	const remarks =
		(tokenUser as (TokenUser & { remarks?: string | null }) | null)?.remarks || '';

	return (
		<div className='d-grid gap-4'>
			<Card>
				<CardBody>
					<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap'>
						<div>
							<div className='text-muted small mb-1'>Token User</div>
							<div className='h4 mb-1'>{tokenUser?.name || `User #${id}`}</div>
							<div className='text-muted'>
								{tokenUser?.created_at
									? `Joined ${formatDate(tokenUser.created_at)}`
									: ''}
							</div>
						</div>
						<div className='d-flex gap-2'>
							<Button
								color='light'
								isLight
								icon='ArrowBack'
								onClick={() => navigate('/token-users')}>
								Back
							</Button>
						</div>
					</div>

					{loading && !tokenUser ? (
						<div className='text-muted py-4'>Loading token user details...</div>
					) : (
						<div className='row g-3 mt-2'>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Email</div>
								<div className='fw-semibold'>{tokenUser?.email || '—'}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Phone</div>
								<div className='fw-semibold'>{tokenUser?.phone || '—'}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Age</div>
								<div className='fw-semibold'>
									{tokenUser?.age != null && tokenUser.age !== ''
										? String(tokenUser.age)
										: '—'}
								</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Place</div>
								<div className='fw-semibold'>{tokenUser?.place || '—'}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Created at</div>
								<div className='fw-semibold'>
									{formatDate(tokenUser?.created_at)}
								</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Total tokens</div>
								<div className='fw-semibold'>{tokens.length}</div>
							</div>
							{remarks && (
								<div className='col-12'>
									<div className='small text-muted'>Remarks</div>
									<div className='fw-semibold'>{remarks}</div>
								</div>
							)}
						</div>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<CardLabel icon='ConfirmationNumber'>
						<CardTitle tag='h5'>Tokens ({tokens.length})</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody className='table-responsive'>
					<div className='material_tabel_wrapper'>
						<ThemeProvider theme={theme}>
							<MaterialTable
								title=' '
								//@ts-ignore
								columns={columns}
								data={tokens}
								isLoading={loading}
								onRowClick={(_event, rowData) => {
									if (rowData?.schedule != null) {
										navigate(
											`/queue-management/schedules/${rowData.schedule}`,
										);
									}
								}}
								options={{
									headerStyle: headerStyles(),
									rowStyle: { ...rowStyles(), cursor: 'pointer' },
									search: true,
									pageSize: 10,
									pageSizeOptions: [10, 25, 50, 100],
									emptyRowsWhenPaging: false,
								}}
								localization={{
									pagination: { labelRowsPerPage: '' },
									body: { emptyDataSourceMessage: 'No tokens for this user yet.' },
								}}
							/>
						</ThemeProvider>
					</div>
				</CardBody>
			</Card>

			{tokenUser == null && !loading && (
				<div className='alert alert-warning mb-0'>
					<Icon icon='Info' className='me-1' />
					Token user details could not be loaded from the API. Showing tokens only.
				</div>
			)}
		</div>
	);
};

export default TokenUserDetailWorkspace;

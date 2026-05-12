import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader } from '../../bootstrap/Card';
import Icon from '../../icon/Icon';
import SearchComponent from '../../SearchComponent';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { type TokenUser, tokensApi } from '../../../services/queueManagementApi';
import { formatDate } from '../QueueManagement/queueManagementUtils';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const TokenUsersWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [tokenUsers, setTokenUsers] = useState<TokenUser[]>([]);

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const load = useCallback(async (term: string) => {
		setLoading(true);
		try {
			const res = await tokensApi.users({
				ordering: '-created_at',
				page: 1,
				page_size: 500,
				...(term.trim() ? { search: term.trim() } : {}),
			});
			setTokenUsers(res.results || []);
		} catch (err) {
			errorNotifierRef.current(err);
			setTokenUsers([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load('');
	}, [load]);

	const runHeaderSearch = () => {
		void load(search);
	};

	const columns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: TokenUser) => rowData.name || '—',
			},
			{
				title: 'Email',
				field: 'email',
				render: (rowData: TokenUser) => rowData.email || '—',
			},
			{
				title: 'Phone',
				field: 'phone',
				render: (rowData: TokenUser) => rowData.phone || '—',
			},
			// {
			// 	title: 'Age',
			// 	field: 'age',
			// 	render: (rowData: TokenUser) =>
			// 		rowData.age != null && rowData.age !== '' ? String(rowData.age) : '—',
			// },
			// {
			// 	title: 'Place',
			// 	field: 'place',
			// 	render: (rowData: TokenUser) => rowData.place || '—',
			// },
			{
				title: 'Created at',
				field: 'created_at',
				render: (rowData: TokenUser) => formatDate(rowData.created_at),
			},
		],
		[],
	);

	return (
		<Card stretch>
			<CardHeader>
				<div className='d-flex align-items-center gap-3'>
					<div className='media-files-title-text d-flex align-items-center gap-2'>
						<Icon icon='Person' color='primary' size='2x' />
						<span>Token Users ({tokenUsers.length})</span>
					</div>
				</div>
				<CardActions>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<SearchComponent
							handleChange={setSearch}
							value={search}
							placeholder='Search token users'
							className='app-search-modern me-0'
							inputClassName='app-search-modern__input'
							iconColor='primary'
							iconSize='2x'
							withDefaultMargin={false}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
								if (e.key === 'Enter') runHeaderSearch();
							}}
							onBlur={runHeaderSearch}
						/>
					</div>
				</CardActions>
			</CardHeader>
			<CardBody className='table-responsive'>
				<div className='material_tabel_wrapper'>
					<ThemeProvider theme={theme}>
						<MaterialTable
							title=' '
							//@ts-ignore
							columns={columns}
							data={tokenUsers}
							isLoading={loading}
							onRowClick={(_event, rowData) => {
								if (rowData?.id != null) {
									navigate(`/token-users/${rowData.id}`, {
										state: { tokenUser: rowData },
									});
								}
							}}
							options={{
								headerStyle: headerStyles(),
								rowStyle: { ...rowStyles(), cursor: 'pointer' },
								search: true,
								pageSize: 10,
								pageSizeOptions: [...PAGE_SIZE_OPTIONS],
								emptyRowsWhenPaging: false,
							}}
							localization={{
								pagination: {
									labelRowsPerPage: '',
								},
								body: {
									emptyDataSourceMessage: 'No token users found.',
								},
							}}
						/>
					</ThemeProvider>
				</div>
			</CardBody>
		</Card>
	);
};

export default TokenUsersWorkspace;

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
	const [search, setSearch] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize] = useState(10);

	const tableRef = useRef<{ onQueryChange: () => void } | null>(null);
	const headerSearchRef = useRef('');

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	useEffect(() => {
		showErrorRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const runHeaderSearch = () => {
		headerSearchRef.current = search.trim();
		tableRef.current?.onQueryChange?.();
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
						<span>Token Users ({totalCount})</span>
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
					<div style={{ overflow: 'hidden' }}>
						<ThemeProvider theme={theme}>
							<MaterialTable
								title=' '
								tableRef={tableRef}
								//@ts-ignore
								columns={columns}
								data={(query) =>
									new Promise((resolve) => {
										const term = headerSearchRef.current;
										tokensApi
											.users({
												limit: query.pageSize,
												offset: query.pageSize * query.page,
												...(term ? { search: term } : {}),
											})
											.then((res) => {
												const count = res.count ?? res.results?.length ?? 0;
												setTotalCount(count);
												resolve({
													data: res.results || [],
													page: query.page,
													totalCount: count,
												});
											})
											.catch((err) => {
												showErrorRef.current(err);
												setTotalCount(0);
												resolve({
													data: [],
													page: query.page,
													totalCount: 0,
												});
											});
									})
								}
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
									search: false,
									filtering: false,
									sorting: false,
									pageSize,
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
				</div>
			</CardBody>
		</Card>
	);
};

export default TokenUsersWorkspace;

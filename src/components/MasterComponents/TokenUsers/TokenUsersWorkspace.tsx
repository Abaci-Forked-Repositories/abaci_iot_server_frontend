import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable, { type Query, type QueryResult } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import Card, { CardBody, CardHeader } from '../../bootstrap/Card';
import Icon from '../../icon/Icon';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { type QueryParams, type TokenUser, tokensApi } from '../../../services/queueManagementApi';
import { formatDate } from '../QueueManagement/queueManagementUtils';
import ModernTableDateFilter from '../../CustomComponent/Filters/ModernTableDateFilter';
import ModernTableTextFilter from '../../CustomComponent/Filters/ModernTableTextFilter';
import { asMaterialTableFilterProps } from '../../CustomComponent/Filters/materialTableFilterTypes';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const hasFilterValue = (value: unknown) => {
	if (value == null || value === '') return false;
	if (Array.isArray(value) && value.length === 0) return false;
	return true;
};

const toFilterDate = (value: unknown): string | undefined => {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(String(value));
	if (Number.isNaN(date.getTime())) return undefined;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const buildTokenUserListParams = (
	query: Query<TokenUser>,
	applyColumnFilters: boolean,
): QueryParams => {
	const params: QueryParams = {
		limit: query.pageSize,
		offset: query.pageSize * query.page,
	};
	const search = query.search?.trim();
	if (search) params.search = search;
	if (!applyColumnFilters) return params;

	for (const filter of query.filters ?? []) {
		const field = String(filter.column?.field ?? '');
		const value = filter.value;
		if (!hasFilterValue(value)) continue;

		if (field === 'name') {
			params.name__icontains = String(value).trim();
		} else if (field === 'email') {
			params.email__icontains = String(value).trim();
		} else if (field === 'phone') {
			params.phone__icontains = String(value).trim();
		} else if (field === 'created_at') {
			const day = toFilterDate(value);
			if (day) params.created_at__date = day;
		}
	}

	return params;
};

const TokenUsersWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize] = useState(10);
	const [filterEnabled, setFilterEnabled] = useState(false);

	const tableRef = useRef<{ onQueryChange: () => void } | null>(null);
	const skipFilterToggleRefreshRef = useRef(true);

	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	useEffect(() => {
		showErrorRef.current = showErrorNotification;
	}, [showErrorNotification]);

	useEffect(() => {
		if (skipFilterToggleRefreshRef.current) {
			skipFilterToggleRefreshRef.current = false;
			return;
		}
		tableRef.current?.onQueryChange?.();
	}, [filterEnabled]);

	const fetchUserData = useCallback(
		(query: Query<TokenUser>): Promise<QueryResult<TokenUser>> => {
			return new Promise((resolve) => {
				tokensApi
					.users(buildTokenUserListParams(query, filterEnabled))
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
			});
		},
		[filterEnabled],
	);

	const columns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				filterComponent: (props: unknown) => (
					<ModernTableTextFilter
						{...asMaterialTableFilterProps(props)}
						placeholder='Filter name'
					/>
				),
				render: (rowData: TokenUser) => rowData.name || '—',
			},
			{
				title: 'Email',
				field: 'email',
				filterComponent: (props: unknown) => (
					<ModernTableTextFilter
						{...asMaterialTableFilterProps(props)}
						placeholder='Filter email'
					/>
				),
				render: (rowData: TokenUser) => rowData.email || '—',
			},
			{
				title: 'Phone',
				field: 'phone',
				filterComponent: (props: unknown) => (
					<ModernTableTextFilter
						{...asMaterialTableFilterProps(props)}
						placeholder='Filter phone'
					/>
				),
				render: (rowData: TokenUser) => rowData.phone || '—',
			},
			{
				title: 'Created at',
				field: 'created_at',
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
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
								data={fetchUserData}
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
									searchFieldStyle: searchFieldStyle(),
									search: true,
									filtering: filterEnabled,
									sorting: false,
									pageSize,
									pageSizeOptions: [...PAGE_SIZE_OPTIONS],
									emptyRowsWhenPaging: false,
									debounceInterval: 400,
								}}
								actions={[
									{
										icon: FilterListIcon,
										tooltip: filterEnabled ? 'Hide filters' : 'Show filters',
										isFreeAction: true,
										onClick: () => setFilterEnabled((prev) => !prev),
									},
								]}
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

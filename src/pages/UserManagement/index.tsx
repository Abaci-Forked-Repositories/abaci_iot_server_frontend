import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import MaterialTable, { Query, QueryResult } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import { getUsers } from '../../api/users/users';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { debounceIntervalForTable } from '../../helpers/constants';
import useToasterNotification from '../../hooks/useToasterNotification';

/** Row shape expected from GET /api/users list */
type UserListRow = {
	id: number;
	name: string;
	type: string;
	status: string;
};

const UserManagement: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const [filterEnabled, setFilterEnabled] = useState(false);

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Users', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Users', path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname, location.search]);

	const columns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				cellStyle: { fontWeight: 600 },
			},
			{
				title: 'Type',
				field: 'type',
				lookup: { Admin: 'Admin', User: 'User' },
			},
			{
				title: 'Status',
				field: 'status',
				lookup: { Active: 'Active', Inactive: 'Inactive' },
				render: (rowData: UserListRow) => (
					<span
						className={`badge ${
							rowData.status === 'Active' ? 'bg-success' : 'bg-danger'
						}`}>
						{rowData.status}
					</span>
				),
			},
		],
		[],
	);

	const fetchUsers = (query: Query<UserListRow>): Promise<QueryResult<UserListRow>> => {
		const otherFilters = formatFiltersWithOptions(query.filters);
		let ordering = '';
		if (query.orderBy?.field) {
			ordering =
				query.orderDirection === 'asc'
					? `&ordering=-${String(query.orderBy.field)}`
					: `&ordering=${String(query.orderBy.field)}`;
		}

		// MaterialTable pages are 0-based; API is 1-based
		return getUsers({
			page: query.page + 1,
			limit: query.pageSize,
			search: query.search,
			filters: otherFilters,
			ordering,
		})
			.then((response) => ({
				data: response.users ?? response.results ?? [],
				page: query.page,
				totalCount: response.count ?? response.total ?? 0,
			}))
			.catch((error) => {
				showErrorNotification(error);
				return {
					data: [],
					page: query.page,
					totalCount: 0,
				};
			});
	};

	const tableActions = useMemo(
		() => [
			{
				icon: FilterListIcon,
				tooltip: filterEnabled ? 'Hide filters' : 'Show filters',
				isFreeAction: true,
				onClick: () => setFilterEnabled((prev) => !prev),
			},
		],
		[filterEnabled],
	);

	return (
		<PageWrapper title='Users'>
			<Page container='fluid'>
				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center gap-2'>
							<Icon icon='Person' color='primary' size='2x' />
							<span>Users</span>
						</div>
					</CardHeader>
					<CardBody>
						<ThemeProvider theme={theme}>
							<MaterialTable
								title=''
								tableRef={tableRef}
								columns={columns}
								data={fetchUsers}
								actions={tableActions}
								options={{
									search: true,
									filtering: filterEnabled,
									sorting: true,
									paging: true,
									pageSize: 10,
									pageSizeOptions: [5, 10, 25],
									debounceInterval: debounceIntervalForTable,
									showEmptyDataSourceMessage: false,
									rowStyle: rowStyles(),
									headerStyle: headerStyles(),
									searchFieldStyle: searchFieldStyle(),
								}}
							/>
						</ThemeProvider>
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default UserManagement;

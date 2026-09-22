import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import { DUMMY_USERS } from '../Devices/usersDummyData';

const UserManagement: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const { theme, headerStyles, rowStyles } = useTablestyle();
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
				render: (rowData) => (
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
								columns={columns}
								data={DUMMY_USERS}
								actions={tableActions}
								options={{
									search: true,
									filtering: filterEnabled,
									sorting: true,
									paging: true,
									pageSize: 10,
									pageSizeOptions: [5, 10, 25],
									showEmptyDataSourceMessage: false,
									rowStyle: rowStyles(),
									headerStyle: headerStyles(),
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

import { useState, FC, useMemo, useEffect, useRef, useCallback } from 'react';
import MaterialTable from '@material-table/core';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTablestyle from '../../../hooks/useTablestyles';
import DeleteButton from '../../CustomComponent/Buttons/DeleteButton';
import EditUser from './EditUserOffCanvas';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import usePermissions from '../../../hooks/usePermissions';
import { buttonColor } from '../../../helpers/constants';
import swalFire from '../../../helpers/swalHelper';
import StatusBadge from '../../BadgeWithIcon';
import Button from '../../bootstrap/Button';

const USER_STATUS_LOOKUP: Record<string, string> = {
	true: 'Active',
	false: 'Inactive',
};

const hasFilterValue = (value: unknown) => {
	if (value == null || value === '') return false;
	if (Array.isArray(value) && value.length === 0) return false;
	return true;
};

const buildUserColumnFilters = (filters: any[] | undefined) => {
	let otherFilters = '';
	(filters ?? []).forEach((filteredItem: any) => {
		const field = String(filteredItem?.column?.field ?? '');
		const value = filteredItem?.value;
		if (!hasFilterValue(value)) return;

		if (field === 'full_name') {
			otherFilters += `&first_name__icontains=${encodeURIComponent(String(value).trim())}`;
		} else if (field === 'email') {
			otherFilters += `&email__icontains=${encodeURIComponent(String(value).trim())}`;
		} else if (field === 'role') {
			otherFilters += `&role=${encodeURIComponent(String(value))}`;
		} else if (field === 'is_active') {
			otherFilters += `&is_active=${String(value) === 'true'}`;
		}
	});
	return otherFilters;
};

interface UserManagementTableComponentProps {
	tableRef: any;
	urlBackup: any;
}
const UserManagementTableComponent: FC<UserManagementTableComponentProps> = ({
	tableRef,
	urlBackup,
}) => {
	const [pageSize] = useState(5);
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [roleLookup, setRoleLookup] = useState<Record<string, string>>({});
	const { theme, rowStyles, headerStyles, searchFieldStyle } = useTablestyle();
	const [itemToBeEdited, setItemToBeEdited] = useState(null);
	const [editModalShow, setEditModalShow] = useState(false);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const { can } = usePermissions();
	const canWrite = can('users_write');
	const skipFilterToggleRefreshRef = useRef(true);
	const filterEnabledRef = useRef(filterEnabled);
	filterEnabledRef.current = filterEnabled;
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;
	const rolesLoadedRef = useRef(false);

	useEffect(() => {
		if (skipFilterToggleRefreshRef.current) {
			skipFilterToggleRefreshRef.current = false;
			return;
		}
		tableRef.current?.onQueryChange?.();
	}, [filterEnabled, tableRef]);

	useEffect(() => {
		if (rolesLoadedRef.current) return;
		rolesLoadedRef.current = true;

		authAxios
			.get('api/users/roles/')
			.then((res) => {
				const results: any[] = res.data?.results ?? res.data ?? [];
				const lookup: Record<string, string> = {};
				if (Array.isArray(results)) {
					results.forEach((role) => {
						if (role?.id == null) return;
						lookup[String(role.id)] = role.name || String(role.id);
					});
				}
				setRoleLookup(lookup);
			})
			.catch((err) => showErrorRef.current(err));
	}, []);

	const fetchData = useCallback(
		(query: any) =>
			new Promise<any>((resolve) => {
				let orderBy = '';
				const otherFilters = filterEnabledRef.current
					? buildUserColumnFilters(query.filters)
					: '';
				if (query.orderBy) {
					orderBy =
						query.orderDirection === 'asc'
							? `&ordering=-${String(query.orderBy?.field)}`
							: `&ordering=${String(query.orderBy?.field)}`;
				}

				const url = `api/users/?limit=${query.pageSize}&offset=${query.pageSize * query.page}&search=${query.search}${orderBy}${otherFilters}`;
				urlBackup.current = url;

				authAxios
					.get(url)
					.then((response) => {
						resolve({
							data: response.data?.results,
							page: query.page,
							totalCount: response.data?.count,
						});
					})
					.catch((error) => {
						showErrorRef.current(error);
						resolve({ data: [], page: query.page, totalCount: 0 });
					});
			}),
		[urlBackup],
	);

	const handleEdit = useCallback((item: any) => {
		setItemToBeEdited(item);
		setEditModalShow(true);
	}, []);

	const staticColumns = useMemo(
		() => [
			{
				title: 'Full Name',
				field: 'full_name',
				render: (rowData: any) => {
					return `${rowData?.first_name} ${rowData?.last_name}` || '----';
				},
			},
			{
				title: 'Email',
				field: 'email',
				render: (rowData: any) => {
					const Email = rowData?.email;
					if (!Email) return '----';

					if (Email.includes('_deleted_')) {
						const cleanEmail = Email.split('_deleted_')[0];
						return <span style={{ color: 'red' }}>{cleanEmail} (Deleted)</span>;
					}

					return Email;
				},
			},
			{
				title: 'Role',
				field: 'role',
				lookup: roleLookup,
				render: (rowData: any) => {
					return rowData?.role?.name || '----';
				},
			},
			{
				title: 'Status',
				field: 'is_active',
				lookup: USER_STATUS_LOOKUP,
				render: (rowData: any) => (
					<StatusBadge status={rowData.is_active ? 'Active' : 'Inactive'} />
				),
			},
		],
		[roleLookup],
	);

	const columns = useMemo(() => {
		if (!canWrite) {
			return staticColumns;
		}

		return [
			...staticColumns,
			{
				title: 'Actions',
				align: 'right' as 'right',
				removable: false,
				sorting: false,
				grouping: false,
				filtering: false,
				render: (rowData: any) => (
					<div className='d-flex gap-1 justify-content-end'>
						{rowData.status !== 'DELETED' && (
							<>
								<Button
									color='primary'
									isLight
									icon='Edit'
									onClick={() => handleEdit(rowData)}
									id={rowData.id}
								/>
								<DeleteButton
									color='danger'
									tableRef={tableRef}
									apiEndpoint={`api/users/${rowData.id}/`}
									text='Are you sure you want to delete this User?'
								/>
							</>
						)}
					</div>
				),
			},
		];
	}, [canWrite, handleEdit, staticColumns, tableRef]);

	const tableOptions = useMemo(
		() => ({
			headerStyle: headerStyles(),
			rowStyle: rowStyles(),
			searchFieldStyle: searchFieldStyle(),
			actionsColumnIndex: -1,
			search: true,
			filtering: filterEnabled,
			sorting: false,
			debounceInterval: 400,
			pageSize,
			pageSizeOptions: [5, 10, 25, 50],
			emptyRowsWhenPaging: false,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- style helpers are stable enough for table options
		[filterEnabled, pageSize],
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
		<>
			{editModalShow && (
				<EditUser
					isOpen={editModalShow}
					setIsOpen={setEditModalShow}
					tableRef={tableRef}
					title='Edit User'
					id={itemToBeEdited?.id}
				/>
			)}
			<div className='material_tabel_wrapper'>
				<div style={{ overflow: 'hidden' }}>
					<ThemeProvider theme={theme}>
						<MaterialTable
							title=' '
							//@ts-ignore
							columns={columns}
							tableRef={tableRef}
							data={fetchData}
							options={tableOptions}
							actions={tableActions}
							localization={{
								pagination: {
									labelRowsPerPage: '',
								},
							}}
						/>
					</ThemeProvider>
				</div>
			</div>
		</>
	);
};

/* eslint-disable react/forbid-prop-types */
UserManagementTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default UserManagementTableComponent;

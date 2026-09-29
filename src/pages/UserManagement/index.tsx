import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Query, QueryResult } from '@material-table/core';
import FullHeightMaterialTable from '../../components/CustomComponent/FullHeightMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import useDarkMode from '../../hooks/useDarkMode';
import usePermissions from '../../hooks/usePermissions';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import {
	createUser,
	deleteUser,
	getUsers,
	updateUser,
	type ApiUser,
} from '../../api/users/users';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { buttonColor, debounceIntervalForTable } from '../../helpers/constants';
import useToasterNotification from '../../hooks/useToasterNotification';
import swalFire from '../../helpers/swalHelper';
import UserFormModal, { type UserFormData } from './UserFormModal';

/** Display row mapped from GET /api/users/ */
type UserListRow = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	role: string;
	status: string;
	date_joined: string;
	raw: ApiUser;
};

const EMPTY = '----';

const displayValue = (value: string | null | undefined) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : EMPTY;
};

const displayRole = (user: ApiUser): string => {
	if (user.is_superuser) return 'Superuser';
	if (user.is_staff) return 'Staff';
	return 'User';
};

const mapUserRow = (user: ApiUser): UserListRow => ({
	id: user.id,
	username: user.username || '',
	first_name: user.first_name || '',
	last_name: user.last_name || '',
	email: user.email || '',
	role: displayRole(user),
	status: user.is_active ? 'Active' : 'Inactive',
	date_joined: user.date_joined
		? new Date(user.date_joined).toLocaleString()
		: '',
	raw: user,
});

const toWritePayload = (data: UserFormData) => {
	const payload: Record<string, unknown> = {
		username: data.username.trim(),
		email: data.email.trim(),
		first_name: data.first_name.trim(),
		last_name: data.last_name.trim(),
		is_active: data.is_active,
		is_staff: data.role === 'Staff' || data.role === 'Superuser',
		is_superuser: data.role === 'Superuser',
	};
	if (data.password.trim()) {
		payload.password = data.password;
	}
	return payload;
};

const UserManagement: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const { can } = usePermissions();
	const canWrite = can('users_write');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
	const [saving, setSaving] = useState(false);

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

	const refreshTable = () => {
		tableRef.current?.onQueryChange?.();
	};

	const handleAdd = () => {
		setModalMode('add');
		setSelectedUser(null);
		setModalOpen(true);
	};

	const handleEdit = (row: UserListRow) => {
		setModalMode('edit');
		setSelectedUser(row.raw);
		setModalOpen(true);
	};

	const handleSave = async (data: UserFormData & { id?: number }) => {
		setSaving(true);
		try {
			const payload = toWritePayload(data);
			if (modalMode === 'add') {
				await createUser(payload as any);
				showSuccessNotification('User created successfully.');
			} else if (data.id != null) {
				await updateUser(data.id, payload as any);
				showSuccessNotification('User updated successfully.');
			}
			setModalOpen(false);
			refreshTable();
		} catch (error) {
			console.error('Error saving user:', error);
			showErrorNotification(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (row: UserListRow) => {
		swalFire({
			title: 'Are you sure?',
			icon: 'info',
			text: `Delete user "${row.username}"? You won't be able to revert this!`,
			showCancelButton: true,
			iconColor: buttonColor[0],
			theme: darkModeStatus ? 'dark' : 'light',
			confirmButtonColor: buttonColor[0],
			cancelButtonColor: buttonColor[1],
			confirmButtonText: 'Delete',
		}).then(async (result: any) => {
			if (!result.isConfirmed) return;
			try {
				await deleteUser(row.id);
				showSuccessNotification('User deleted successfully.');
				refreshTable();
			} catch (error) {
				showErrorNotification(error);
			}
		});
	};

	const columns = useMemo(
		() => [
			{
				title: 'First Name',
				field: 'first_name',
				cellStyle: { fontWeight: 600 },
				render: (rowData: UserListRow) => displayValue(rowData.first_name),
			},
			{
				title: 'Last Name',
				field: 'last_name',
				render: (rowData: UserListRow) => displayValue(rowData.last_name),
			},
			{
				title: 'Email',
				field: 'email',
			},
			{
				title: 'Role',
				field: 'role',
				lookup: {
					Superuser: 'Superuser',
					Staff: 'Staff',
					User: 'User',
				},
			},
			{
				title: 'Status',
				field: 'status',
				lookup: { Active: 'Active', Inactive: 'Inactive' },
				render: (rowData: UserListRow) => (
					<span
						className={`badge ${
							rowData.status === 'Active' ? 'bg-success' : 'bg-secondary'
						}`}>
						{rowData.status}
					</span>
				),
			},
			{
				title: 'Joined',
				field: 'date_joined',
				filtering: false,
			},
		],
		[],
	);

	const fetchUsers = (query: Query<UserListRow>): Promise<QueryResult<UserListRow>> => {
		const otherFilters = formatFiltersWithOptions(query.filters);
		let ordering = '';
		if (query.orderBy?.field) {
			const apiField =
				query.orderBy.field === 'role'
					? 'is_superuser'
					: query.orderBy.field === 'status'
						? 'is_active'
						: String(query.orderBy.field);
			ordering =
				query.orderDirection === 'asc'
					? `&ordering=${apiField}`
					: `&ordering=-${apiField}`;
		}

		return getUsers({
			page: query.page + 1,
			limit: query.pageSize,
			search: query.search,
			filters: otherFilters,
			ordering,
		})
			.then((response) => {
				let rows = response.results.map(mapUserRow);

				const search = (query.search || '').trim().toLowerCase();
				if (search) {
					rows = rows.filter(
						(r) =>
							r.first_name.toLowerCase().includes(search) ||
							r.last_name.toLowerCase().includes(search) ||
							r.username.toLowerCase().includes(search) ||
							r.email.toLowerCase().includes(search) ||
							r.role.toLowerCase().includes(search),
					);
				}

				query.filters?.forEach((f) => {
					const value = String(f.value ?? '').trim();
					if (!value || !f.column.field) return;
					const field = String(f.column.field);
					rows = rows.filter((r) => String((r as any)[field]) === value);
				});

				const isFullList = response.count === response.results.length;
				const totalCount = isFullList ? rows.length : response.count;
				const start = query.page * query.pageSize;
				const pageData = isFullList
					? rows.slice(start, start + query.pageSize)
					: rows;

				return {
					data: pageData,
					page: query.page,
					totalCount,
				};
			})
			.catch((error) => {
				showErrorNotification(error);
				return {
					data: [],
					page: query.page,
					totalCount: 0,
				};
			});
	};

	const tableActions = useMemo(() => {
		const actions: any[] = [
			{
				icon: FilterListIcon,
				tooltip: filterEnabled ? 'Hide filters' : 'Show filters',
				isFreeAction: true,
				onClick: () => setFilterEnabled((prev) => !prev),
			},
		];
		if (canWrite) {
			actions.push(
				{
					icon: EditIcon,
					tooltip: 'Edit User',
					onClick: (_event: any, rowData: UserListRow) => {
						handleEdit(rowData);
					},
				},
				{
					icon: DeleteIcon,
					tooltip: 'Delete User',
					onClick: (_event: any, rowData: UserListRow) => {
						handleDelete(rowData);
					},
				},
			);
		}
		return actions;
	}, [filterEnabled, canWrite, darkModeStatus]);

	return (
		<PageWrapper title='Users'>
			<Page container='fluid'>
				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center justify-content-between w-100 flex-wrap gap-2'>
							<div className='d-flex align-items-center gap-2'>
								<Icon icon='Person' color='primary' size='2x' />
								<span>Users</span>
							</div>
							{canWrite && (
								<Button
									color='primary'
									size='sm'
									onClick={handleAdd}
									isDisable={saving}>
									+ Add User
								</Button>
							)}
						</div>
					</CardHeader>
					<CardBody>
						<UserFormModal
							isOpen={modalOpen}
							setIsOpen={setModalOpen}
							mode={modalMode}
							user={selectedUser}
							onSave={handleSave}
							saving={saving}
						/>
						<ThemeProvider theme={theme}>
							<FullHeightMaterialTable
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
									showEmptyDataSourceMessage: true,
									emptyRowsWhenPaging: false,
									actionsColumnIndex: -1,
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

import { useState, FC, useMemo } from 'react';
import MaterialTable from '@material-table/core';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import useTablestyle from '../../../hooks/useTablestyles';
import CustomBadgeWithIcon from '../../CustomComponent/BadgeWithIcon';
import DeleteButton from '../../CustomComponent/Buttons/DeleteButton';
import EditUser from './EditUserOffCanvas';
import { authAxios } from '../../../axiosInstance';
import { formatFiltersWithOptions } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import CustomButtonWithNoName from '../../CustomComponent/Buttons/CustomButtonWithNoName';
import { buttonColor } from '../../../helpers/constants';
import swalFire from '../../../helpers/swalHelper';
import StatusBadge from '../../BadgeWithIcon';

interface UserManagementTableComponentProps {
	tableRef: any;
	urlBackup: any;
}
const UserManagementTableComponent: FC<UserManagementTableComponentProps> = ({
	tableRef,
	urlBackup,
}) => {
	const [pageSize, setPageSize] = useState(5);
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const [itemToBeEdited, setItemToBeEdited] = useState(null);
	const [editModalShow, setEditModalShow] = useState(false);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const staticColumns = [
		{
			title: 'Full Name',
			field: 'full_name',
			render: (rowData: any) => {
				return `${rowData?.first_name} ${rowData?.last_name}` || '----';
			},
		},
		{
			title: 'Mobile Number',
			field: 'mobile_number',
			render: (rowData: any) => {
				return rowData?.mobile_number || '----';
			},
		},
		{
			title: 'Email',
			field: 'email',
			render: (rowData: any) => {
				const Email = rowData?.email;
				if (!Email) return '----';

				// Check if it's deleted
				if (Email.includes('_deleted_')) {
					// Extract only the part before "_DELETED_"
					const cleanEmail = Email.split('_deleted_')[0];
					return <span style={{ color: 'red' }}>{cleanEmail} (Deleted)</span>;
				}

				// Normal registration number
				return Email;
			},
		},
		{
			title: 'Staff ID',
			field: 'staff_id',
			render: (rowData: any) => {
				return rowData?.staff_id || '----';
			},
		},
		{
			title: 'Status',
			field: 'status',
			render: (rowData) => (
				<StatusBadge status={rowData.status} />
			),
		},
	];
	const handleEdit = (item: any) => {
		setItemToBeEdited(item);
		setEditModalShow(!editModalShow);
	};
	const actionButtons = [
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
							<CustomButtonWithNoName
								icon={'Edit'}
								onClick={() => handleEdit(rowData)}
								id={rowData.id}
								size='sm'
							/>
							<DeleteButton
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

	const handleBulkDelete = async (selectedRows: any[]) => {
		if (!selectedRows.length) return;

		try {
			const result = await swalFire({
				title: 'Are you sure?',
				text: `You want to delete ${selectedRows.length} user(s)?`,
				icon: 'info',
				iconColor: buttonColor[0],
				showCancelButton: true,
				confirmButtonColor: buttonColor[0],
				cancelButtonColor: buttonColor[1],
				confirmButtonText: 'Delete',
				cancelButtonText: 'Cancel',
			});

			if (result.isConfirmed) {
				await Promise.all(
					selectedRows.map((row) =>
						authAxios.delete(`api/users/${row.id}/`).catch((err) => {
							showErrorNotification(err);
						}),
					),
				);
				if (tableRef) {
					tableRef.current.onQueryChange();
				}
				showSuccessNotification('Success! Selected users deleted successfully');
			}
		} catch (error) {
			showErrorNotification(error);
		}
	};

	const columns = useMemo(() => {
		return [...staticColumns, ...actionButtons];
	}, []);

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
							// data={data}
							data={(query) => {
								return new Promise((resolve, reject) => {
									// let statusTypes = '&status__in=Active,Disabled,Completed,Yet to start';
									// if (activeTab !== "All") {
									//     statusTypes = `&status__in=${activeTab}`
									// }

									let orderBy = '';
									const otherFilters = formatFiltersWithOptions(query.filters);
									if (query.orderBy) {
										orderBy =
											query.orderDirection === 'asc'
												? `&ordering=-${String(query.orderBy?.field)}`
												: `&ordering=${String(query.orderBy?.field)}`;
									}

									let url = `api/users/?limit=${query.pageSize}&offset=${query.pageSize * query.page}&search=${query.search}${orderBy}&${otherFilters}`;

									// Check if date range and selected item are defined
									// if (
									// 	date &&
									// 	date?.selection?.startDateFilter &&
									// 	date?.selection?.endDateFilter &&
									// 	selectedItem
									// ) {
									// 	url += `&start_date=${date.selection.startDateFilter}&end_date=${date.selection.endDateFilter}&filter_type=${selectedItem}`;
									// }
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
											showErrorNotification(error);
											// eslint-disable-next-line prefer-promise-reject-errors
											resolve({
												data: [],
												page: query.page,
												totalCount: 0,
											});
										});
								});
							}}
							options={{
								headerStyle: headerStyles(),
								rowStyle: rowStyles(),
								actionsColumnIndex: -1,
								debounceInterval: 500,
								search: true,
								pageSize,
							}}

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

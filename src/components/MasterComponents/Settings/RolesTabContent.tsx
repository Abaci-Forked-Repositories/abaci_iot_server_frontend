import React, { useState, useRef, useMemo, useEffect, FC } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import useTablestyle from '../../../hooks/useTablestyles';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import swalFire from '../../../helpers/swalHelper';
import Button from '../../bootstrap/Button';
import { Role } from './RoleModal';
import usePermissions from '../../../hooks/usePermissions';

interface RolesTabContentProps {
	onEditRole: (role: Role) => void;
	refreshSignal?: number;
}

const RolesTabContent: FC<RolesTabContentProps> = ({ onEditRole, refreshSignal }) => {
	const [pageSize] = useState(5);
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const tableRef = useRef<any>(null);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const { can } = usePermissions();
	const canWrite = can('settings_write');

	useEffect(() => {
		if (refreshSignal) {
			tableRef.current?.onQueryChange();
		}
	}, [refreshSignal]);

	const staticColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: Role) => rowData?.name || '----',
			},
			{
				title: 'Description',
				field: 'description',
				render: (rowData: Role) => rowData?.description || '----',
			},
		],
		[],
	);

	const handleDelete = async (role: Role) => {
		const result = await swalFire({
			title: 'Delete role?',
			text: `Delete "${role?.name}"? This action cannot be undone.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			await authAxios.delete(`/api/users/roles/${role.id}/`);
			showSuccessNotification('Role deleted successfully');
			tableRef.current?.onQueryChange();
		} catch (error) {
			showErrorNotification(error);
		}
	};

	const actionButtons = useMemo(
		() => [
			{
				title: 'Actions',
				align: 'right' as 'right',
				removable: false,
				sorting: false,
				grouping: false,
				filtering: false,
				render: (rowData: Role) => (
					<div className='d-flex gap-1 justify-content-end'>
						<Button
							color='primary'
							isLight
							icon='Edit'
							onClick={() => onEditRole(rowData)}
							id={String(rowData.id)}
						/>
						<Button
							color='danger'
							isLight
							icon='Delete'
							onClick={() => handleDelete(rowData)}
							id={String(rowData.id)}
						/>
					</div>
				),
			},
		],
		[onEditRole],
	);

	return (
		<div className='material_tabel_wrapper'>
		<div style={{ overflow: 'hidden' }}>
		<ThemeProvider theme={theme}>
			<MaterialTable
				tableRef={tableRef}
				title=''
				columns={canWrite ? [...staticColumns, ...actionButtons] : staticColumns}
				data={(query) =>
					new Promise((resolve) => {
						const offset = query.pageSize * query.page;
						const searchTerm = query.search ? `&search=${query.search}` : '';
						const url = `/api/users/roles/?offset=${offset}&limit=${query.pageSize}${searchTerm}`;

						authAxios
							.get(url)
							.then((res) => {
								resolve({
									data: res.data.results,
									page: query.page,
									totalCount: res.data.count,
								});
							})
							.catch((error) => {
								showErrorNotification(error);
								resolve({ data: [], page: query.page, totalCount: 0 });
							});
					})
				}
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
	);
};

export default RolesTabContent;
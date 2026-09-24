import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import MaterialTable, { Query, QueryResult } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import usePermissions from '../../hooks/usePermissions';
import useDarkMode from '../../hooks/useDarkMode';
import useToasterNotification from '../../hooks/useToasterNotification';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import {
	createSite,
	deleteSite,
	getSites,
	updateSite,
	type Site,
} from '../../api/sites/sites';
import { getUsers } from '../../api/users/users';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { debounceIntervalForTable, buttonColor } from '../../helpers/constants';
import swalFire from '../../helpers/swalHelper';
import SiteFormModal, {
	type SiteAdminOption,
	type SiteFormData,
} from './SiteFormModal';

const extractList = <T,>(response: any, keys: string[]): T[] => {
	for (const key of keys) {
		if (Array.isArray(response?.[key])) return response[key];
	}
	if (Array.isArray(response)) return response;
	return [];
};

const toAdminOption = (user: any): SiteAdminOption | null => {
	if (user?.id == null) return null;
	const name =
		user.name ||
		user.full_name ||
		[user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
		user.username ||
		user.email ||
		`User #${user.id}`;
	return {
		id: Number(user.id),
		name,
		type: user.type || user.role?.name,
		status:
			user.status ??
			(typeof user.is_active === 'boolean'
				? user.is_active
					? 'Active'
					: 'Inactive'
				: undefined),
	};
};

const Sites: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification } = useToasterNotification();
	const { can } = usePermissions();
	const canWrite = can('sites_write');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedSite, setSelectedSite] = useState<Site | null>(null);
	const [saving, setSaving] = useState(false);

	const { data: usersResponse } = useQuery({
		queryKey: ['users', 'site-admins'],
		queryFn: () => getUsers({ page: 1, limit: 1000 }),
	});

	const users: SiteAdminOption[] = useMemo(() => {
		const raw = extractList(usersResponse, ['users', 'results']);
		return raw.map(toAdminOption).filter(Boolean) as SiteAdminOption[];
	}, [usersResponse]);

	const userNameById = useMemo(() => {
		const map: Record<number, string> = {};
		users.forEach((u) => {
			map[u.id] = u.name;
		});
		return map;
	}, [users]);

	const adminLookup = useMemo(() => {
		const lookup: Record<string, string> = {};
		users.forEach((u) => {
			lookup[String(u.id)] = u.name;
		});
		return lookup;
	}, [users]);

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Sites', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Sites', path: location.pathname + location.search },
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
		setSelectedSite(null);
		setModalOpen(true);
	};

	const handleEdit = (site: Site) => {
		setModalMode('edit');
		setSelectedSite(site);
		setModalOpen(true);
	};

	const handleSave = async (site: SiteFormData & { id?: number }) => {
		setSaving(true);
		try {
			if (modalMode === 'add') {
				await createSite(site);
			} else if (site.id != null) {
				await updateSite(site.id, site);
			}
			setModalOpen(false);
			refreshTable();
		} catch (error) {
			console.error('Error saving site:', error);
			showErrorNotification(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (site: Site) => {
		swalFire({
			title: 'Are you sure?',
			icon: 'info',
			text: `Delete site "${site.name}"? You won't be able to revert this!`,
			showCancelButton: true,
			iconColor: buttonColor[0],
			theme: darkModeStatus ? 'dark' : 'light',
			confirmButtonColor: buttonColor[0],
			cancelButtonColor: buttonColor[1],
			confirmButtonText: 'Delete',
		}).then(async (result: any) => {
			if (!result.isConfirmed) return;
			try {
				await deleteSite(site.id);
				refreshTable();
			} catch (error) {
				showErrorNotification(error);
			}
		});
	};

	const columns = useMemo(
		() => [
			{
				title: 'Site Name',
				field: 'name',
				cellStyle: { fontWeight: 600 },
			},
			{
				title: 'Description',
				field: 'description',
			},
			{
				title: 'Site Admin',
				field: 'admin_id',
				lookup: adminLookup,
				render: (rowData: Site) =>
					rowData.admin_id != null
						? userNameById[rowData.admin_id] ||
							(rowData as any).admin_name ||
							'—'
						: '—',
			},
		],
		[userNameById, adminLookup],
	);

	const fetchSites = (query: Query<Site>): Promise<QueryResult<Site>> => {
		const otherFilters = formatFiltersWithOptions(query.filters);
		let ordering = '';
		if (query.orderBy?.field) {
			ordering =
				query.orderDirection === 'asc'
					? `&ordering=-${String(query.orderBy.field)}`
					: `&ordering=${String(query.orderBy.field)}`;
		}

		return getSites({
			page: query.page + 1,
			limit: query.pageSize,
			search: query.search,
			filters: otherFilters,
			ordering,
		})
			.then((response) => ({
				data: response.sites ?? response.results ?? [],
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
					tooltip: 'Edit Site',
					onClick: (_event: any, rowData: Site) => {
						handleEdit(rowData);
					},
				},
				{
					icon: DeleteIcon,
					tooltip: 'Delete Site',
					onClick: (_event: any, rowData: Site) => {
						handleDelete(rowData);
					},
				},
			);
		}
		return actions;
	}, [filterEnabled, canWrite, darkModeStatus]);

	return (
		<>
			<SiteFormModal
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				mode={modalMode}
				site={selectedSite}
				onSave={handleSave}
				users={users}
				saving={saving}
			/>
			<PageWrapper title='Sites'>
				<Page container='fluid'>
					<Card stretch>
						<CardHeader>
							<div className='d-flex align-items-center gap-2'>
								<Icon icon='Place' color='primary' size='2x' />
								<span>Sites</span>
							</div>
							{canWrite && (
								<Button
									color='primary'
									size='sm'
									onClick={handleAdd}
									isDisable={saving}>
									+ Add Site
								</Button>
							)}
						</CardHeader>
						<CardBody>
							<ThemeProvider theme={theme}>
								<MaterialTable
									title=''
									tableRef={tableRef}
									columns={columns}
									data={fetchSites}
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
		</>
	);
};

export default Sites;

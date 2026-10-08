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
import usePermissions from '../../hooks/usePermissions';
import useDarkMode from '../../hooks/useDarkMode';
import useToasterNotification from '../../hooks/useToasterNotification';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import {
	createSite,
	deleteSite,
	getSiteById,
	getSites,
	updateSite,
	type Site,
} from '../../api/sites/sites';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { debounceIntervalForTable, buttonColor } from '../../helpers/constants';
import swalFire from '../../helpers/swalHelper';
import SiteFormModal, { type SiteFormData } from './SiteFormModal';
import ModernTableDateFilter from '../../components/CustomComponent/Filters/ModernTableDateFilter';
import { asMaterialTableFilterProps } from '../../components/CustomComponent/Filters/materialTableFilterTypes';

const formatDate = (value: string | null | undefined) => {
	if (!value) return '—';
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const toDateKey = (value: unknown): string | null => {
	if (value == null || value === '') return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
	}
	const raw = String(value);
	if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return null;
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const DATE_FILTER_FIELDS = new Set(['created_at', 'updated_at']);

const Sites: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const { can } = usePermissions();
	const canWrite = can('sites_write');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedSite, setSelectedSite] = useState<Site | null>(null);
	const [saving, setSaving] = useState(false);
	const [loadingSite, setLoadingSite] = useState(false);

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
		setLoadingSite(false);
		setModalOpen(true);
	};

	const handleEdit = async (site: Site | Site[]) => {
		const selected = Array.isArray(site) ? site[0] : site;
		if (!selected?.id) {
			showErrorNotification('Unable to edit site: missing id.');
			return;
		}

		const fetchPromise = getSiteById(selected.id);

		setModalMode('edit');
		setSelectedSite(selected);
		setLoadingSite(true);
		setModalOpen(true);

		try {
			const fresh = await fetchPromise;
			setSelectedSite(fresh);
		} catch (error) {
			showErrorNotification(error);
		} finally {
			setLoadingSite(false);
		}
	};

	const handleSave = async (site: SiteFormData & { id?: number }) => {
		setSaving(true);
		try {
			const payload = {
				name: site.name,
				description: site.description,
			};
			if (modalMode === 'add') {
				await createSite(payload);
				showSuccessNotification('Site created successfully.');
			} else {
				const siteId = selectedSite?.id ?? site.id;
				if (siteId == null) {
					showErrorNotification('Unable to update site: missing id.');
					return;
				}
				await updateSite(siteId, payload);
				showSuccessNotification('Site updated successfully.');
			}
			setModalOpen(false);
			setSelectedSite(null);
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
				showSuccessNotification('Site deleted successfully.');
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
				title: 'Created Date',
				field: 'created_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (row: Site) => formatDate(row.created_at),
			},
			{
				title: 'Updated Date',
				field: 'updated_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (row: Site) => formatDate(row.updated_at),
			},
		],
		[],
	);

	const fetchSites = (query: Query<Site>): Promise<QueryResult<Site>> => {
		const otherFilters = formatFiltersWithOptions(query.filters);
		let ordering = '';
		if (query.orderBy?.field) {
			ordering =
				query.orderDirection === 'asc'
					? `&ordering=${String(query.orderBy.field)}`
					: `&ordering=-${String(query.orderBy.field)}`;
		}

		return getSites({
			page: query.page + 1,
			limit: query.pageSize,
			search: query.search,
			filters: otherFilters,
			ordering,
		})
			.then((response) => {
				let rows = response.results;

				const search = (query.search || '').trim().toLowerCase();
				if (search) {
					rows = rows.filter(
						(r) =>
							r.name?.toLowerCase().includes(search) ||
							r.description?.toLowerCase().includes(search),
					);
				}

				query.filters?.forEach((f) => {
					const value = f.value;
					if (value == null || value === '' || !f.column.field) return;
					const field = String(f.column.field);

					if (DATE_FILTER_FIELDS.has(field)) {
						const filterKey = toDateKey(value);
						if (!filterKey) return;
						rows = rows.filter((r) => toDateKey((r as any)[field]) === filterKey);
						return;
					}

					rows = rows.filter((r) => String((r as any)[field] ?? '') === String(value));
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
				saving={saving}
				loading={loadingSite}
			/>
			<PageWrapper title='Sites'>
				<Page container='fluid'>
					<Card stretch>
						<CardHeader>
							<div className='d-flex align-items-center justify-content-between w-100 flex-wrap gap-2'>
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
							</div>
						</CardHeader>
						<CardBody>
							<ThemeProvider theme={theme}>
								<FullHeightMaterialTable
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
		</>
	);
};

export default Sites;

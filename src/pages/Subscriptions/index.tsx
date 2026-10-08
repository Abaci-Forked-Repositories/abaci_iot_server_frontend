import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Query, QueryResult } from '@material-table/core';
import FullHeightMaterialTable from '../../components/CustomComponent/FullHeightMaterialTable';
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
	createSubscription,
	deleteSubscription,
	getSubscriptionById,
	getSubscriptions,
	updateSubscription,
	type Subscription,
} from '../../api/subscriptions/subscriptions';
import { getUsers } from '../../api/users/users';
import { formatFiltersWithOptions } from '../../helpers/functions';
import { buttonColor, debounceIntervalForTable } from '../../helpers/constants';
import swalFire from '../../helpers/swalHelper';
import SubscriptionFormModal, {
	type SubscriptionFormData,
	type SubscriptionUserOption,
} from './SubscriptionFormModal';
import ModernTableDateFilter from '../../components/CustomComponent/Filters/ModernTableDateFilter';
import { asMaterialTableFilterProps } from '../../components/CustomComponent/Filters/materialTableFilterTypes';

const formatDate = (value: string | null | undefined) => {
	if (!value) return '—';
	// Prefer plain YYYY-MM-DD display without time
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

/** Normalize filter/API values to YYYY-MM-DD for comparison */
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

const DATE_FILTER_FIELDS = new Set([
	'start_date',
	'end_date',
	'created_at',
	'updated_at',
]);


const Subscriptions: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const { can } = usePermissions();
	const canWrite = can('subscriptions_write');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selected, setSelected] = useState<Subscription | null>(null);
	const [saving, setSaving] = useState(false);
	const [loadingSubscription, setLoadingSubscription] = useState(false);

	const { data: usersResponse } = useQuery({
		queryKey: ['users', 'subscription-picker'],
		queryFn: () => getUsers({ page: 1, limit: 1000 }),
	});

	const users: SubscriptionUserOption[] = useMemo(() => {
		const list = usersResponse?.results ?? [];
		return list.map((u) => ({
			id: u.id,
			label: u.username || u.email || `User #${u.id}`,
		}));
	}, [usersResponse]);

	const userLabelById = useMemo(() => {
		const map: Record<number, string> = {};
		users.forEach((u) => {
			map[u.id] = u.label;
		});
		return map;
	}, [users]);

	const userLookup = useMemo(() => {
		const lookup: Record<string, string> = {};
		users.forEach((u) => {
			lookup[String(u.id)] = u.label;
		});
		return lookup;
	}, [users]);

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Subscriptions', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Subscriptions', path: location.pathname + location.search },
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
		setSelected(null);
		setLoadingSubscription(false);
		setModalOpen(true);
	};

	const handleEdit = async (row: Subscription | Subscription[]) => {
		const selectedRow = Array.isArray(row) ? row[0] : row;
		if (!selectedRow?.id) {
			showErrorNotification('Unable to edit subscription: missing id.');
			return;
		}

		const fetchPromise = getSubscriptionById(selectedRow.id);

		setModalMode('edit');
		setSelected(selectedRow);
		setLoadingSubscription(true);
		setModalOpen(true);

		try {
			const fresh = await fetchPromise;
			setSelected(fresh);
		} catch (error) {
			showErrorNotification(error);
		} finally {
			setLoadingSubscription(false);
		}
	};

	const handleSave = async (data: SubscriptionFormData & { id?: number }) => {
		setSaving(true);
		try {
			const payload = {
				user: Number(data.user),
				start_date: data.start_date || null,
				end_date: data.end_date || null,
			};
			if (modalMode === 'add') {
				await createSubscription(payload);
				showSuccessNotification('Subscription created successfully.');
			} else {
				const subscriptionId = selected?.id ?? data.id;
				if (subscriptionId == null) {
					showErrorNotification('Unable to update subscription: missing id.');
					return;
				}
				await updateSubscription(subscriptionId, payload);
				showSuccessNotification('Subscription updated successfully.');
			}
			setModalOpen(false);
			setSelected(null);
			refreshTable();
		} catch (error) {
			console.error('Error saving subscription:', error);
			showErrorNotification(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (row: Subscription) => {
		const userLabel = userLabelById[row.user] || `User #${row.user}`;
		swalFire({
			title: 'Are you sure?',
			icon: 'info',
			text: `Delete subscription for "${userLabel}"? You won't be able to revert this!`,
			showCancelButton: true,
			iconColor: buttonColor[0],
			theme: darkModeStatus ? 'dark' : 'light',
			confirmButtonColor: buttonColor[0],
			cancelButtonColor: buttonColor[1],
			confirmButtonText: 'Delete',
		}).then(async (result: any) => {
			if (!result.isConfirmed) return;
			try {
				await deleteSubscription(row.id);
				showSuccessNotification('Subscription deleted successfully.');
				refreshTable();
			} catch (error) {
				showErrorNotification(error);
			}
		});
	};

	const columns = useMemo(
		() => [
			{
				title: 'ID',
				field: 'id',
				cellStyle: { fontWeight: 600 },
			},
			{
				title: 'User',
				field: 'user',
				lookup: userLookup,
				render: (row: Subscription) =>
					userLabelById[row.user] || (row.user != null ? `User #${row.user}` : '—'),
			},
			{
				title: 'Start Date',
				field: 'start_date',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (row: Subscription) => formatDate(row.start_date),
			},
			{
				title: 'End Date',
				field: 'end_date',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (row: Subscription) => formatDate(row.end_date),
			},
			{
				title: 'Created At',
				field: 'created_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (row: Subscription) => formatDate(row.created_at),
			},
			{
				title: 'Updated At',
				field: 'updated_at',
				type: 'date' as const,
				filtering: true,
				filterComponent: (props: unknown) => (
					<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
				),
				render: (row: Subscription) => formatDate(row.updated_at),
			},
		],
		[userLookup, userLabelById],
	);

	const fetchSubscriptions = (
		query: Query<Subscription>,
	): Promise<QueryResult<Subscription>> => {
		const otherFilters = formatFiltersWithOptions(query.filters);
		let ordering = '';
		if (query.orderBy?.field) {
			ordering =
				query.orderDirection === 'asc'
					? `&ordering=${String(query.orderBy.field)}`
					: `&ordering=-${String(query.orderBy.field)}`;
		}

		return getSubscriptions({
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
					rows = rows.filter((r) => {
						const userLabel = (userLabelById[r.user] || '').toLowerCase();
						return (
							userLabel.includes(search) ||
							String(r.id).includes(search) ||
							String(r.user).includes(search)
						);
					});
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
					tooltip: 'Edit Subscription',
					onClick: (_event: any, rowData: Subscription) => {
						handleEdit(rowData);
					},
				},
				{
					icon: DeleteIcon,
					tooltip: 'Delete Subscription',
					onClick: (_event: any, rowData: Subscription) => {
						handleDelete(rowData);
					},
				},
			);
		}
		return actions;
	}, [filterEnabled, canWrite, darkModeStatus, userLabelById]);

	return (
		<PageWrapper title='Subscriptions'>
			<Page container='fluid'>
				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center justify-content-between w-100 flex-wrap gap-2'>
							<div className='d-flex align-items-center gap-2'>
								<Icon icon='CardMembership' color='primary' size='2x' />
								<span>Subscriptions</span>
							</div>
							{canWrite && (
								<Button
									color='primary'
									size='sm'
									onClick={handleAdd}
									isDisable={saving}>
									+ Add Subscription
								</Button>
							)}
						</div>
					</CardHeader>
					<CardBody>
						<SubscriptionFormModal
							isOpen={modalOpen}
							setIsOpen={setModalOpen}
							mode={modalMode}
							subscription={selected}
							onSave={handleSave}
							users={users}
							saving={saving}
							loading={loadingSubscription}
						/>
						<ThemeProvider theme={theme}>
							<FullHeightMaterialTable
								title=''
								tableRef={tableRef}
								columns={columns}
								data={fetchSubscriptions}
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

export default Subscriptions;

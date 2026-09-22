import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Icon from '../../components/icon/Icon';
import useTablestyle from '../../hooks/useTablestyles';
import usePermissions from '../../hooks/usePermissions';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import SiteFormModal, { type SiteFormData } from './SiteFormModal';
import { DUMMY_USERS } from '../Devices/usersDummyData';

// ─── Dummy data (replace with API when backend is ready) ───
const DUMMY_SITES: (SiteFormData & { id: number })[] = [
	{
		id: 1,
		name: 'Site Alpha',
		description: 'Primary monitoring site',
		admin_id: 1,
	},
	{
		id: 2,
		name: 'Site Beta',
		description: 'Secondary sensor site',
		admin_id: 2,
	},
	{
		id: 3,
		name: 'Site Gamma',
		description: 'Gateway hub location',
		admin_id: 7,
	},
];
// ────────────────────────────────────────────────────────────

type Site = (typeof DUMMY_SITES)[number];

const Sites: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { can } = usePermissions();
	const canWrite = can('sites_write');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [selectedSite, setSelectedSite] = useState<Site | null>(null);
	const [sites, setSites] = useState<Site[]>(DUMMY_SITES);

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

	const userNameById = useMemo(() => {
		const map: Record<number, string> = {};
		DUMMY_USERS.forEach((u) => {
			map[u.id] = u.name;
		});
		return map;
	}, []);

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

	const handleSave = (site: SiteFormData & { id?: number }) => {
		if (modalMode === 'add') {
			const newId = Math.max(0, ...sites.map((s) => s.id)) + 1;
			setSites([...sites, { ...site, id: newId } as Site]);
		} else {
			setSites(sites.map((s) => (s.id === site.id ? ({ ...s, ...site } as Site) : s)));
		}
		setModalOpen(false);
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
				render: (rowData: Site) =>
					rowData.admin_id != null
						? userNameById[rowData.admin_id] || '—'
						: '—',
			},
		],
		[userNameById],
	);

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
			actions.push({
				icon: EditIcon,
				tooltip: 'Edit Site',
				onClick: (_event: any, rowData: Site) => {
					handleEdit(rowData);
				},
			});
		}
		return actions;
	}, [filterEnabled, canWrite]);

	return (
		<>
			<SiteFormModal
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				mode={modalMode}
				site={selectedSite}
				onSave={handleSave}
				users={DUMMY_USERS}
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
								<button
									type='button'
									className='btn btn-primary btn-sm'
									onClick={handleAdd}>
									+ Add Site
								</button>
							)}
						</CardHeader>
						<CardBody>
							<ThemeProvider theme={theme}>
								<MaterialTable
									title=''
									columns={columns}
									data={sites}
									actions={tableActions}
									options={{
										search: true,
										filtering: filterEnabled,
										sorting: true,
										paging: true,
										pageSize: 10,
										pageSizeOptions: [5, 10, 25],
										showEmptyDataSourceMessage: false,
										actionsColumnIndex: -1,
										rowStyle: rowStyles(),
										headerStyle: headerStyles(),
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

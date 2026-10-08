import React, { useMemo, useRef, useState } from 'react';
import { Column, Query, QueryResult } from '@material-table/core';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { getIotData, type IotDataRecord } from '../../../api/data/iotData';
import { debounceIntervalForTable } from '../../../helpers/constants';
import { formatFiltersWithOptions } from '../../../helpers/functions';
import ModernTableSelectFilter from '../../CustomComponent/Filters/ModernTableSelectFilter';
import ModernTableTextFilter from '../../CustomComponent/Filters/ModernTableTextFilter';
import ModernTableDateFilter from '../../CustomComponent/Filters/ModernTableDateFilter';
import { asMaterialTableFilterProps } from '../../CustomComponent/Filters/materialTableFilterTypes';

interface IotDataTableProps {
	deviceId: number | string;
}

const EMPTY = '—';

const formatDateTime = (value: string | null | undefined) => {
	if (!value) return EMPTY;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

/** Flat row shape used by MaterialTable — keys match the IotDataRecord fields. */
type IotDataRow = IotDataRecord;

/** Lookup options for digital boolean columns — used by both filter and API. */
const DIGITAL_LOOKUP: Record<string, string> = {
	true: 'ON',
	false: 'OFF',
};

/**
 * Build MaterialTable columns dynamically from the first record's name fields.
 * - digital_in_name_X  → column header, digital_in_X → ON/OFF select filter
 * - digital_out_name_X → column header, digital_out_X → ON/OFF select filter
 * - analog_name_X      → column header, analog_in_X * ratio + unit → text filter
 */
const buildColumns = (sample: IotDataRecord | undefined): Column<IotDataRow>[] => {
	const base: Column<IotDataRow>[] = [
		{
			title: 'Data Timestamp',
			field: 'data_timestamp',
			type: 'date' as const,
			filtering: true,
			filterComponent: (props: unknown) => (
				<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
			),
			render: (row) => formatDateTime(row.data_timestamp),
		},
		{
			title: 'Server Timestamp',
			field: 'server_timestamp',
			type: 'date' as const,
			filtering: true,
			filterComponent: (props: unknown) => (
				<ModernTableDateFilter {...asMaterialTableFilterProps(props)} />
			),
			render: (row) => formatDateTime(row.server_timestamp),
		},
	];

	if (!sample) return base;

	// Digital In columns — dropdown filter (ON/OFF)
	for (let i = 1; i <= 2; i++) {
		const nameKey = `digital_in_name_${i}` as keyof IotDataRow;
		const valKey = `digital_in_${i}` as keyof IotDataRow;
		const header = (sample[nameKey] as string) || `Digital In ${i}`;
		base.push({
			title: header,
			field: valKey as string,
			filtering: true,
			lookup: DIGITAL_LOOKUP,
			filterComponent: (props: unknown) => (
				<ModernTableSelectFilter
					{...asMaterialTableFilterProps(props)}
					lookup={DIGITAL_LOOKUP}
					placeholder='All'
				/>
			),
			render: (row) => {
				const active = row[valKey] as boolean;
				return (
					<span
						className={`badge bg-${active ? 'success' : 'secondary'}`}
						style={{ fontSize: '0.8rem', minWidth: 40, display: 'inline-block' }}>
						{active ? 'ON' : 'OFF'}
					</span>
				);
			},
		});
	}

	// Digital Out columns — dropdown filter (ON/OFF)
	for (let i = 1; i <= 2; i++) {
		const nameKey = `digital_out_name_${i}` as keyof IotDataRow;
		const valKey = `digital_out_${i}` as keyof IotDataRow;
		const header = (sample[nameKey] as string) || `Digital Out ${i}`;
		base.push({
			title: header,
			field: valKey as string,
			filtering: true,
			lookup: DIGITAL_LOOKUP,
			filterComponent: (props: unknown) => (
				<ModernTableSelectFilter
					{...asMaterialTableFilterProps(props)}
					lookup={DIGITAL_LOOKUP}
					placeholder='All'
				/>
			),
			render: (row) => {
				const active = row[valKey] as boolean;
				return (
					<span
						className={`badge bg-${active ? 'success' : 'secondary'}`}
						style={{ fontSize: '0.8rem', minWidth: 40, display: 'inline-block' }}>
						{active ? 'ON' : 'OFF'}
					</span>
				);
			},
		});
	}

	// Analog columns — text filter
	for (let i = 1; i <= 4; i++) {
		const nameKey = `analog_name_${i}` as keyof IotDataRow;
		const valKey = `analog_in_${i}` as keyof IotDataRow;
		const unitKey = `analog_unit_${i}` as keyof IotDataRow;
		const ratioKey = `analog_ratio_${i}` as keyof IotDataRow;
		const header = (sample[nameKey] as string) || `Analog In ${i}`;
		base.push({
			title: header,
			field: valKey as string,
			filtering: true,
			filterComponent: (props: unknown) => (
				<ModernTableTextFilter
					{...asMaterialTableFilterProps(props)}
					placeholder='Filter…'
				/>
			),
			render: (row) => {
				const rawValue = row[valKey] as number;
				const ratio = row[ratioKey] as { source: string; parsedValue: number } | null;
				const unit = (row[unitKey] as string) || '';
				const displayValue =
					ratio?.parsedValue != null ? rawValue * ratio.parsedValue : rawValue;
				return (
					<span className='fw-semibold'>
						{displayValue}
						{unit ? ` ${unit}` : ''}
					</span>
				);
			},
		});
	}

	return base;
};

/** Fixed max height for the table body — keeps it bounded inside a non-stretch Card. */
const TABLE_BODY_MAX_HEIGHT = 350;

const IotDataTable: React.FC<IotDataTableProps> = ({ deviceId }) => {
	const tableRef = useRef<any>(null);
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const [filterEnabled, setFilterEnabled] = useState(false);

	// Store the first record so we can build dynamic columns.
	// Use a ref to avoid stale closures in fetchData — columns are built once only.
	const [sampleRecord, setSampleRecord] = useState<IotDataRecord | undefined>(undefined);
	const sampleRecordRef = useRef<IotDataRecord | undefined>(undefined);

	// Reset sample when device changes so columns rebuild for the new device
	React.useEffect(() => {
		sampleRecordRef.current = undefined;
		setSampleRecord(undefined);
	}, [deviceId]);

	const columns = useMemo(() => buildColumns(sampleRecord), [sampleRecord]);

	const fetchData = (query: Query<IotDataRow>): Promise<QueryResult<IotDataRow>> => {
		let ordering = '';
		if (query.orderBy?.field) {
			ordering =
				query.orderDirection === 'asc'
					? String(query.orderBy.field)
					: `-${String(query.orderBy.field)}`;
		}

		// Build filter query string from MaterialTable filters
		const filterStr = formatFiltersWithOptions(query.filters);

		// Update filter active state for the icon color
		const anyFilter = (query.filters ?? []).some(
			(f: any) => f.value != null && f.value !== '',
		);
		setFilterActive(anyFilter);

		return getIotData({
			limit: query.pageSize,
			offset: query.page * query.pageSize,
			device_id: deviceId,
			search: query.search,
			ordering,
			filters: filterStr,
		})
			.then((response) => {
				const rows = response.results;
				// Only set sample once — rebuilding columns on every fetch
				// causes MaterialTable to lose filter/sort state
				if (rows.length > 0 && !sampleRecordRef.current) {
					sampleRecordRef.current = rows[0];
					setSampleRecord(rows[0]);
				}
				return {
					data: rows,
					page: query.page,
					totalCount: response.count,
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

	// Check if any filters are currently active on the table
	const hasActiveFilters = () => {
		const state = tableRef.current?.state;
		if (!state?.columns) return false;
		return state.columns.some(
			(col: any) => col.tableData?.filterValue != null && col.tableData?.filterValue !== '',
		);
	};

	const [filterActive, setFilterActive] = useState(false);

	const actions = useMemo(
		() => [
			{
				icon: () => (
					<FilterListIcon
						style={{ color: filterActive ? '#5B8CFF' : undefined }}
					/>
				),
				tooltip: filterEnabled ? 'Hide filters' : 'Show filters',
				isFreeAction: true,
				onClick: () => setFilterEnabled((prev) => !prev),
			},
		],
		[filterEnabled, filterActive],
	);

	return (
		<ThemeProvider theme={theme}>
			<MaterialTable
				title=''
				tableRef={tableRef}
				columns={columns}
				data={fetchData}
				actions={actions}
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
					maxBodyHeight: TABLE_BODY_MAX_HEIGHT,
					minBodyHeight: TABLE_BODY_MAX_HEIGHT,
					actionsColumnIndex: -1,
					rowStyle: rowStyles(),
					headerStyle: headerStyles(),
					searchFieldStyle: searchFieldStyle(),
				}}
			/>
		</ThemeProvider>
	);
};

export default IotDataTable;

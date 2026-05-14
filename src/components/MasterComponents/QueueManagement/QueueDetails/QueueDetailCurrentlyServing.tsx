import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import Badge from '../../../bootstrap/Badge';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../bootstrap/Card';
import Button from '../../../bootstrap/Button';
import Spinner from '../../../bootstrap/Spinner';
import useTablestyle from '../../../../hooks/useTablestyles';
import type { CurrentlyServingEntry, PaginatedResponse } from '../../../../services/queueManagementApi';
import { queuesApi } from '../../../../services/queueManagementApi';
import useToasterNotification from '../../../../hooks/useToasterNotification';

export interface QueueDetailCurrentlyServingProps {
	queueId: number;
	/** Increment when parent finishes a full queue reload so this panel refetches. */
	refreshVersion: number;
}

function normalizeCurrentlyServingResponse(
	data: CurrentlyServingEntry[] | PaginatedResponse<CurrentlyServingEntry>,
): CurrentlyServingEntry[] {
	if (Array.isArray(data)) return data;
	if (data && typeof data === 'object' && Array.isArray(data.results)) return data.results;
	return [];
}

function formatDuration(raw: string | null | undefined): string {
	if (raw == null || String(raw).trim() === '') return '—';
	return String(raw).replace(/\.\d+(?=\s*$)/, '');
}

function nonEmpty(s: string | number | null | undefined): string | undefined {
	if (s == null) return undefined;
	const t = String(s).trim();
	return t === '' ? undefined : t;
}

type CurrentlyServingRow = {
	token: string;
	customer: string;
	phone: string;
	email: string;
	wait: string;
	notes: string;
};

function entryToRow(entry: CurrentlyServingEntry): CurrentlyServingRow {
	const tokenDisplay =
		entry.token_display != null && String(entry.token_display).trim() !== ''
			? String(entry.token_display)
			: undefined;
	const tokenRaw = tokenDisplay ?? entry.token_number ?? entry.token;
	const token = tokenRaw != null && String(tokenRaw).trim() !== '' ? String(tokenRaw) : '—';

	const customer =
		entry.customer_name ??
		entry.customer ??
		(typeof entry.token_user?.name === 'string' ? entry.token_user.name : undefined) ??
		'—';

	const waitRaw = entry.wait_time ?? entry.wait;
	const wait = formatDuration(waitRaw != null && String(waitRaw).trim() !== '' ? String(waitRaw) : undefined);

	const notes =
		entry.notes != null && String(entry.notes).trim() !== '' ? String(entry.notes).trim() : '—';

	const u = entry.token_user;
	const phone = nonEmpty(u?.phone) ?? '—';
	const email = nonEmpty(u?.email) ?? '—';

	return {
		token,
		customer,
		phone,
		email,
		wait,
		notes,
	};
}

const QueueDetailCurrentlyServing: React.FC<QueueDetailCurrentlyServingProps> = ({ queueId, refreshVersion }) => {
	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const showErrorNotificationRef = useRef(showErrorNotification);
	showErrorNotificationRef.current = showErrorNotification;

	const [loading, setLoading] = useState(true);
	const [rows, setRows] = useState<CurrentlyServingRow[]>([]);

	const load = useCallback(async () => {
		if (!queueId || Number.isNaN(queueId)) {
			setRows([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const data = await queuesApi.currentlyServing(queueId);
			const list = normalizeCurrentlyServingResponse(data);
			setRows(list.map(entryToRow));
		} catch (err) {
			showErrorNotificationRef.current(err);
			setRows([]);
		} finally {
			setLoading(false);
		}
	}, [queueId]);

	useEffect(() => {
		void load();
	}, [load, refreshVersion]);

	const columns = useMemo(
		() => [
			{
				title: 'Token',
				field: 'token',
				render: (rowData: CurrentlyServingRow) => (
					<Badge color='success' isLight>
						{rowData.token}
					</Badge>
				),
			},
			{ title: 'Customer', field: 'customer' },
			{ title: 'Phone', field: 'phone' },
			{ title: 'Email', field: 'email' },
			{ title: 'Wait time', field: 'wait' },
			{
				title: 'Notes',
				field: 'notes',
				cellStyle: { maxWidth: 220, whiteSpace: 'normal' as const },
				render: (rowData: CurrentlyServingRow) => (
					<span className='small text-muted' title={rowData.notes === '—' ? undefined : rowData.notes}>
						{rowData.notes}
					</span>
				),
			},
		],
		[],
	);

	return (
		<div className='col-12 col-xl-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='Group'>
						<CardTitle tag='h5'>Currently Serving ({rows.length})</CardTitle>
					</CardLabel>
					<Button color='light' size='sm' icon='Refresh' onClick={() => void load()} isDisable={loading}>
						Refresh
					</Button>
				</CardHeader>
				<CardBody>
					{loading ? (
						<div className='d-flex justify-content-center align-items-center py-5 gap-2 text-muted'>
							<Spinner color='primary' />
							<span>Loading…</span>
						</div>
					) : (
						<div className='material_tabel_wrapper'>
							<div style={{ overflow: 'hidden' }}>
								<ThemeProvider theme={theme}>
									<MaterialTable
										title=' '
										// @ts-ignore
										columns={columns}
										data={rows}
										options={{
											headerStyle: headerStyles(),
											rowStyle: rowStyles(),
											search: true,
											pageSize: 5,
											pageSizeOptions: [5, 10, 20, 50],
											emptyRowsWhenPaging: false,
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
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default QueueDetailCurrentlyServing;

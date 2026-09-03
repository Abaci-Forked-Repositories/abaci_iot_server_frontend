import React, {
	type FormEvent,
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable, { MTableToolbar } from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import StatusBadge from '../../BadgeWithIcon.jsx';
import Button from '../../bootstrap/Button';
import DropDownFilter from '../../CustomComponent/DropDown/DropDownFilter';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import usePermissions from '../../../hooks/usePermissions';
import {
	type QueueSchedule,
	type Token,
	type TokenQueueRef,
	tokensApi,
} from '../../../services/queueManagementApi';
import { formatDate, getTokenDisplay } from '../QueueManagement/queueManagementUtils';

const ShareTokenModal = lazy(() => import('../../PageComponents/ServingPoints/ShareTokenModal'));

const tokenStatusKey = (status?: string) => (status || '').toLowerCase().trim();

type TokenStatusAction = 'mark_waiting' | 'cancel' | 'postpone';

const buildTokenStatusActionOptions = (
	token: Token,
	schedule: QueueSchedule | null,
): Array<{ value: TokenStatusAction; label: string }> => {
	const isReportingEnabled = Boolean(schedule?.is_reporting_enabled);
	const allowPostpone = Boolean(schedule?.allow_postpone);
	const s = tokenStatusKey(token.status);
	const opts: Array<{ value: TokenStatusAction; label: string }> = [];
	if (s === 'registred') {
		if (isReportingEnabled) {
			opts.push({ value: 'mark_waiting', label: 'Waiting' });
		}
		opts.push({ value: 'cancel', label: 'Cancelled' });
		opts.push({ value: 'mark_waiting', label: 'Waiting' });
		if (allowPostpone) {
			opts.push({ value: 'postpone', label: 'Postponed' });
		}
		return opts;
	}
	if (s === 'waiting') {
		opts.push({ value: 'cancel', label: 'Cancelled' });
		if (allowPostpone) {
			opts.push({ value: 'postpone', label: 'Postponed' });
		}
		return opts;
	}
	return [];
};

const ACTION_SUBMIT_COLORS: Record<TokenStatusAction, 'primary' | 'danger' | 'secondary'> = {
	mark_waiting: 'primary',
	cancel: 'danger',
	postpone: 'secondary',
};

const TOKEN_STATUS_ACTION_META: Record<
	TokenStatusAction,
	{
		icon: string;
		color: 'primary' | 'danger' | 'secondary';
		badgeStatus: string;
		selectedCard: string;
		selectedRadio: string;
		selectedIconWrap: string;
		selectedText: string;
	}
> = {
	mark_waiting: {
		icon: 'NotificationsActive',
		color: 'primary',
		badgeStatus: 'waiting',
		selectedCard: 'border-primary bg-primary bg-opacity-10',
		selectedRadio: 'bg-primary border-primary',
		selectedIconWrap: 'bg-primary bg-opacity-15',
		selectedText: 'text-primary',
	},
	cancel: {
		icon: 'Cancel',
		color: 'danger',
		badgeStatus: 'cancelled',
		selectedCard: 'border-danger bg-danger bg-opacity-10',
		selectedRadio: 'bg-danger border-danger',
		selectedIconWrap: 'bg-danger bg-opacity-15',
		selectedText: 'text-danger',
	},
	postpone: {
		icon: 'Update',
		color: 'secondary',
		badgeStatus: 'postponed',
		selectedCard: 'border-secondary bg-secondary bg-opacity-10',
		selectedRadio: 'bg-secondary border-secondary',
		selectedIconWrap: 'bg-secondary bg-opacity-15',
		selectedText: 'text-secondary',
	},
};

const canEditTokenDetails = (token: Token) => {
	const s = tokenStatusKey(token.status);
	return !['completed', 'cancelled', 'no_show'].includes(s);
};

export type ScheduleDetailScheduleTokensProps = {
	scheduleId: number;
	scheduleRecord: QueueSchedule | null;
	onEditToken: (token: Token) => void;
	onTokensUpdated: () => void | Promise<void>;
	/** Parent calls this after create/edit token to refresh the table without watching `loading`. */
	onRegisterTableRefresh?: (refresh: () => void) => void;
};

const ScheduleDetailScheduleTokens: React.FC<ScheduleDetailScheduleTokensProps> = ({
	scheduleId,
	scheduleRecord,
	onEditToken,
	onTokensUpdated,
	onRegisterTableRefresh,
}) => {
	const navigate = useNavigate();
	const { can } = usePermissions();
	const canReadTokenUsers = can('token_users_read');
	const { theme, headerStyles, rowStyles, searchFieldStyle } = useTablestyle();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	const tableRef = useRef<any>(null);
	const statusFilterValueRef = useRef('all');

	const [tokenStatusFilter, setTokenStatusFilter] = useState<{ label: string; value: string }>({
		label: 'All',
		value: 'all',
	});
	const [statusModalToken, setStatusModalToken] = useState<Token | null>(null);
	const [statusActionValue, setStatusActionValue] = useState<TokenStatusAction | ''>('');
	const [statusSaving, setStatusSaving] = useState(false);
	const [shareToken, setShareToken] = useState<Token | null>(null);

	const refreshTable = useCallback(() => {
		tableRef.current?.onQueryChange();
	}, []);

	useEffect(() => {
		onRegisterTableRefresh?.(refreshTable);
	}, [onRegisterTableRefresh, refreshTable]);

	const handleTokenStatusFilterChange = useCallback(
		(option: { label: string; value: string }) => {
			if (option.value === statusFilterValueRef.current) return;
			statusFilterValueRef.current = option.value;
			setTokenStatusFilter(option);
			refreshTable();
		},
		[refreshTable],
	);

	const statusModalOptions = useMemo(
		() => (statusModalToken ? buildTokenStatusActionOptions(statusModalToken, scheduleRecord) : []),
		[statusModalToken, scheduleRecord],
	);

	useEffect(() => {
		if (!statusModalToken) return;
		const opts = buildTokenStatusActionOptions(statusModalToken, scheduleRecord);
		setStatusActionValue((opts[0]?.value as TokenStatusAction) ?? '');
	}, [statusModalToken, scheduleRecord]);

	const closeStatusModal = useCallback(() => {
		setStatusModalToken(null);
		setStatusActionValue('');
	}, []);

	const handleSubmitTokenStatus = useCallback(
		async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (!statusModalToken || !statusActionValue) return;
			const allowed = buildTokenStatusActionOptions(statusModalToken, scheduleRecord).map(
				(o) => o.value,
			);
			if (!allowed.includes(statusActionValue)) {
				showErrorNotification('Selected status change is not allowed.');
				return;
			}
			setStatusSaving(true);
			try {
				if (statusActionValue === 'mark_waiting') {
					await tokensApi.markArrived(statusModalToken.id);
				} else if (statusActionValue === 'cancel') {
					await tokensApi.cancel(statusModalToken.id);
				} else {
					await tokensApi.postpone(statusModalToken.id);
				}
				showSuccessNotification('Token status updated successfully.');
				closeStatusModal();
				refreshTable();
				await onTokensUpdated();
			} catch (err) {
				showErrorNotification(err);
			} finally {
				setStatusSaving(false);
			}
		},
		[
			statusModalToken,
			statusActionValue,
			scheduleRecord,
			closeStatusModal,
			refreshTable,
			onTokensUpdated,
			showErrorNotification,
			showSuccessNotification,
		],
	);

	// ── Server-side data fetcher (limit/offset) ──────────────────────────────
	const fetchTokenData = useCallback(
		(query: any): Promise<{ data: Token[]; page: number; totalCount: number }> => {
			return new Promise((resolve) => {
				const limit = query.pageSize;
				const offset = query.pageSize * query.page;
				const search = query.search ?? '';

				const params: Record<string, any> = {
					schedule: scheduleId,
					limit,
					offset,
					ordering: '-created_at',
				};
				if (search) params.search = search;
				const statusFilter = statusFilterValueRef.current;
				if (statusFilter !== 'all') params.status = statusFilter;

				tokensApi
					.list(params)
					.then((tableRes) => {
						resolve({
							data: tableRes.results ?? [],
							page: query.page,
							totalCount: tableRes.count ?? 0,
						});
					})
					.catch((err) => {
						showErrorNotification(err);
						resolve({ data: [], page: query.page, totalCount: 0 });
					});
			});
		},
		[scheduleId, showErrorNotification],
	);

	const tokenColumns = useMemo(
		() => [
			{
				title: 'Token',
				field: 'token_display',
				render: (rowData: Token) => getTokenDisplay(rowData),
			},
			{
				title: 'Customer',
				field: 'token_user.name',
				render: (rowData: Token) => {
					const name = rowData.token_user?.name?.trim();
					if (!name) return '—';
					const userId = rowData.token_user?.id;
					if (userId == null || !canReadTokenUsers) return name;
					return (
						<button
							type='button'
							className='btn btn-link p-0 align-baseline fw-semibold'
							aria-label={`Open token user ${name}`}
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								navigate(`/token-users/${userId}`, {
									state: { tokenUser: rowData.token_user },
								});
							}}>
							{name}
						</button>
					);
				},
			},
			{
				title: 'Status',
				field: 'status',
				render: (rowData: Token) => <StatusBadge status={String(rowData.status)} />,
			},
			{
				title: 'Created',
				field: 'created_at',
				render: (rowData: Token) => formatDate(rowData.created_at),
			},
			{
				title: 'Actions',
				field: 'actions',
				sorting: false,
				filtering: false,
				render: (rowData: Token) => {
					const canChangeStatus =
						buildTokenStatusActionOptions(rowData, scheduleRecord).length > 0;
					const canEdit = canEditTokenDetails(rowData);
					const canShare = Boolean(rowData.token_user?.uuid);
					if (!canChangeStatus && !canEdit && !canShare) {
						return <span className='text-muted small'>—</span>;
					}
					return (
						<div className='d-inline-flex flex-wrap gap-1 align-items-center'>
							{canShare && (
								<Tooltip title='Share token status link'>
									<span className='d-inline-flex'>
										<Button
											color='info'
											isLight
											size='sm'
											icon='QrCode2'
											onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.preventDefault();
												e.stopPropagation();
												setShareToken(rowData);
											}}
										/>
									</span>
								</Tooltip>
							)}
							{canChangeStatus && (
								<Tooltip title='Change token status'>
									<span className='d-inline-flex'>
										<Button
											color='primary'
											isLight
											size='sm'
											icon='TrackChanges'
											onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.preventDefault();
												e.stopPropagation();
												setStatusModalToken(rowData);
											}}
										/>
									</span>
								</Tooltip>
							)}
							{canEdit && (
								<Tooltip title='Edit token details'>
									<span className='d-inline-flex'>
										<Button
											color='primary'
											isLight
											size='sm'
											icon='Edit'
											onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.preventDefault();
												e.stopPropagation();
												onEditToken(rowData);
											}}
										/>
									</span>
								</Tooltip>
							)}
						</div>
					);
				},
			},
		],
		[canReadTokenUsers, navigate, onEditToken, scheduleRecord],
	);

	const tokenStatusFilterOptions = useMemo(
		() => [
			{ label: 'All', value: 'all' },
			{ label: 'Registred', value: 'registred' },
			{ label: 'Waiting', value: 'waiting' },
			{ label: 'Serving', value: 'serving' },
			{ label: 'Completed', value: 'completed' },
			{ label: 'Cancelled', value: 'cancelled' },
			{ label: 'Postponed', value: 'postponed' },
			{ label: 'No Show', value: 'no_show' },
		],
		[],
	);

	const tokenToolbar = (props: any) => (
		<div className='d-flex align-items-center justify-content-end gap-2 pe-2'>
			<div style={{ display: 'inline-flex', width: 'auto', flex: '0 0 auto', minWidth: 0 }}>
				<MTableToolbar {...props} />
			</div>
			<DropDownFilter
				options={tokenStatusFilterOptions}
				onChange={handleTokenStatusFilterChange}
				selectedOption={tokenStatusFilter}
				labelField='label'
				icon='FilterAlt'
				direction='down'
				buttonClassName='text-nowrap'
			/>
		</div>
	);

	const selectedActionLabel =
		statusModalOptions.find((o) => o.value === statusActionValue)?.label ?? 'Update';

	return (
		<>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='ConfirmationNumber'>
						<CardTitle tag='h5'>Scheduled Tokens</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<div className='material_tabel_wrapper'>
						<div style={{ overflow: 'hidden' }}>
							<ThemeProvider theme={theme}>
								<MaterialTable
									title=' '
									tableRef={tableRef}
									// @ts-ignore
									columns={tokenColumns}
									data={fetchTokenData}
									components={{ Toolbar: tokenToolbar }}
									options={{
										headerStyle: headerStyles(),
										rowStyle: rowStyles(),
										searchFieldStyle: searchFieldStyle(),
										search: true,
										filtering: false,
										sorting: false,
										pageSize: 5,
										pageSizeOptions: [5, 10, 20],
										emptyRowsWhenPaging: false,
										debounceInterval: 400,
									}}
									localization={{
										pagination: { labelRowsPerPage: '' },
									}}
								/>
							</ThemeProvider>
						</div>
					</div>
				</CardBody>
			</Card>

			<Modal
				isOpen={statusModalToken != null}
				setIsOpen={(open) => {
					if (!open) closeStatusModal();
				}}
				isCentered
				size='lg'
				isAnimation={false}>
				<ModalHeader
					setIsOpen={(open) => {
						if (!open) closeStatusModal();
					}}>
					<ModalTitle id='schedule-token-status-modal'>
						<div className='d-flex align-items-center gap-3'>
							<span
								className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
								style={{ width: 40, height: 40 }}>
								<Icon icon='TrackChanges' color='primary' />
							</span>
							<div>
								<div className='fw-bold lh-sm'>Update token status</div>
								<div className='text-muted small fw-normal mt-1'>
									Choose the next state for this scheduled token
								</div>
							</div>
						</div>
					</ModalTitle>
				</ModalHeader>
				{statusModalToken && statusModalOptions.length > 0 && (
					<form onSubmit={handleSubmitTokenStatus}>
						<ModalBody className='pt-2 pb-4'>
							<div className='d-flex align-items-center gap-3 p-3 p-md-4 rounded-4 mb-4 border border-secondary border-opacity-25 bg-body-secondary'>
								<span
									className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
									style={{ width: 48, height: 48 }}>
									<Icon icon='ConfirmationNumber' color='primary' />
								</span>
								<div className='min-w-0 flex-grow-1'>
									<div className='text-muted small text-uppercase fw-semibold mb-1'>Token</div>
									<div className='fw-bold fs-5 text-body lh-sm text-truncate'>
										{getTokenDisplay(statusModalToken)}
									</div>
									{statusModalToken.token_user?.name ? (
										<div className='text-muted small mt-2 lh-base text-truncate'>
											{statusModalToken.token_user.name}
										</div>
									) : null}
								</div>
							</div>

							<div className='d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4 px-1'>
								<div className='d-flex flex-column gap-2'>
									<span className='text-muted small text-uppercase fw-semibold'>
										Current status
									</span>
									<StatusBadge status={String(statusModalToken.status)} />
								</div>
								<span
									className='d-inline-flex align-items-center justify-content-center rounded-circle bg-body-secondary border border-secondary border-opacity-25 flex-shrink-0'
									style={{ width: 36, height: 36 }}>
									<Icon icon='ArrowForward' color='secondary' size='sm' />
								</span>
								<div className='d-flex flex-column gap-2'>
									<span className='text-muted small text-uppercase fw-semibold'>
										New status
									</span>
									{statusActionValue ? (
										<StatusBadge
											status={TOKEN_STATUS_ACTION_META[statusActionValue].badgeStatus}
										/>
									) : (
										<span className='text-muted small'>Select below</span>
									)}
								</div>
							</div>

							<div className='mb-1'>
								<div className='text-muted small text-uppercase fw-semibold mb-3 px-1'>
									Select new status
								</div>
								<div className='d-flex flex-column gap-2'>
									{statusModalOptions.map((option, index) => {
										const meta = TOKEN_STATUS_ACTION_META[option.value];
										const isSelected = statusActionValue === option.value;
										return (
											<button
												key={`${option.value}-${index}`}
												type='button'
												disabled={statusSaving}
												onClick={() => setStatusActionValue(option.value)}
												className={[
													'd-flex align-items-center gap-3 p-3 rounded-3 border text-start w-100',
													isSelected
														? meta.selectedCard
														: 'border-secondary border-opacity-25 bg-transparent',
												].join(' ')}
												style={{ cursor: statusSaving ? 'not-allowed' : 'pointer' }}>
												<span
													className={[
														'd-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 border',
														isSelected
															? meta.selectedRadio
															: 'bg-body border-secondary border-opacity-50',
													].join(' ')}
													style={{ width: 22, height: 22 }}>
													{isSelected && <Icon icon='Check' size='sm' color='light' />}
												</span>
												<span
													className={[
														'd-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0',
														isSelected ? meta.selectedIconWrap : 'bg-body-secondary',
													].join(' ')}
													style={{ width: 40, height: 40 }}>
													<Icon icon={meta.icon} color={meta.color} />
												</span>
												<div className='flex-grow-1 min-w-0'>
													<div
														className={`fw-semibold ${isSelected ? meta.selectedText : 'text-body'}`}>
														{option.label}
													</div>
													<div className='text-muted small'>
														Set token to {option.label.toLowerCase()}
													</div>
												</div>
												{isSelected && (
													<Icon
														icon='ArrowForward'
														color={meta.color}
														size='sm'
														className='flex-shrink-0'
													/>
												)}
											</button>
										);
									})}
								</div>
							</div>
						</ModalBody>
						<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
							<Button
								color='secondary'
								isLight
								type='button'
								isDisable={statusSaving}
								onClick={closeStatusModal}>
								Cancel
							</Button>
							<Button
								color={
									statusActionValue ? ACTION_SUBMIT_COLORS[statusActionValue] : 'primary'
								}
								type='submit'
								icon={statusActionValue ? TOKEN_STATUS_ACTION_META[statusActionValue].icon : undefined}
								isDisable={statusSaving || !statusActionValue}>
								{statusSaving ? (
									<>
										<Spinner isSmall inButton />
										Updating…
									</>
								) : (
									`Set ${selectedActionLabel}`
								)}
							</Button>
						</ModalFooter>
					</form>
				)}
			</Modal>

			{shareToken &&
				(() => {
					const uuid = shareToken.token_user?.uuid ?? '';
					const queueId =
						typeof shareToken.queue === 'number'
							? shareToken.queue
							: ((shareToken.queue as TokenQueueRef | undefined)?.id ??
								scheduleRecord?.queue ??
								0);
					if (!uuid || !queueId) return null;
					return (
						<Suspense fallback={null}>
							<ShareTokenModal
								isOpen={shareToken != null}
								setIsOpen={(open) => {
									if (!open) setShareToken(null);
								}}
								tokenUserUuid={uuid}
								queueId={queueId}
								tokenDisplay={getTokenDisplay(shareToken)}
								customerName={shareToken.token_user?.name ?? null}
							/>
						</Suspense>
					);
				})()}
		</>
	);
};

export default ScheduleDetailScheduleTokens;
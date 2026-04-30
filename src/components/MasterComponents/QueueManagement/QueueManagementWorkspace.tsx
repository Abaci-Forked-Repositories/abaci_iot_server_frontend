import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import SearchComponent from '../../SearchComponent';
import ReactSelectComponent from '../../CustomComponent/Select/ReactSelectComponent';
import DropDownFilter from '../../CustomComponent/DropDown/DropDownFilter';
import { useForm } from 'react-hook-form';
import {
	type CreateQueuePayload,
	type CreateTokenPayload,
	type Queue,
	type QueueGroup,
	type QueueSchedule,
	type QueueStatistics,
	type QueueStatus,
	type ServingPoint,
	type Token,
	type TokenUser,
	queuesApi,
	schedulesApi,
	tokensApi,
} from '../../../services/queueManagementApi';
import {
	initialTokenForm,
	type QueueGroupFilterValue,
	type QueueManagementTab,
} from './queueManagementConstants';
import { getErrorMessage } from './queueManagementUtils';
import QueuesTabContent from './QueuesTabContent';
import TokensTabContent from './TokensTabContent';
import CustomersTabContent from './CustomersTabContent';

const QueueManagementWorkspace: React.FC = () => {
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<QueueManagementTab>('queues');
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const [queues, setQueues] = useState<Queue[]>([]);
	/** Broad list for token/customer queue pickers (not narrowed by group filter). */
	const [queuesCatalog, setQueuesCatalog] = useState<Queue[]>([]);
	const [groups, setGroups] = useState<QueueGroup[]>([]);
	const [groupsPage, setGroupsPage] = useState(1);
	const [groupsHasMore, setGroupsHasMore] = useState(true);
	const [groupsLoadingMore, setGroupsLoadingMore] = useState(false);
	const [servingPoints, setServingPoints] = useState<ServingPoint[]>([]);
	const [selectedQueueId, setSelectedQueueId] = useState<number>(0);
	const [queueStats, setQueueStats] = useState<QueueStatistics | null>(null);
	const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
	const [schedulesForQueue, setSchedulesForQueue] = useState<QueueSchedule[]>([]);

	const [tokens, setTokens] = useState<Token[]>([]);
	const [recentTokens, setRecentTokens] = useState<Token[]>([]);
	const [todayTokens, setTodayTokens] = useState<Token[]>([]);
	const [tokenUsers, setTokenUsers] = useState<TokenUser[]>([]);
	const [customerSearchResults, setCustomerSearchResults] = useState<TokenUser[]>([]);

	const [queueSearch, setQueueSearch] = useState('');
	const [queueDisplayMode, setQueueDisplayMode] = useState<'queues' | 'groups'>('queues');
	const [queueRefreshKey, setQueueRefreshKey] = useState(0);
	const [queueGroupFilter, setQueueGroupFilter] = useState<QueueGroupFilterValue>('all');
	const [queuePage, setQueuePage] = useState(1);
	const [queueHasMore, setQueueHasMore] = useState(true);
	const [queueLoadingMore, setQueueLoadingMore] = useState(false);
	const [tokenSearch, setTokenSearch] = useState('');
	const [tokenStatusFilter, setTokenStatusFilter] = useState('');
	const [customerSearchType, setCustomerSearchType] = useState<'phone' | 'email'>('phone');
	const [customerSearchValue, setCustomerSearchValue] = useState('');
	const [tokenForm, setTokenForm] = useState<CreateTokenPayload>(initialTokenForm);
	const [showCreateQueueModal, setShowCreateQueueModal] = useState(false);
	const [queueCreateForm, setQueueCreateForm] = useState<{
		name: string;
		description: string;
		limit: string;
		allow_postpone: boolean;
	}>({
		name: '',
		description: '',
		limit: '50',
		allow_postpone: true,
	});
	const {
		control: queueModalControl,
		getValues: getQueueModalValues,
		setValue: setQueueModalValue,
		formState: { errors: queueModalErrors },
	} = useForm<{ serving_points: Array<{ label: string; value: number }> }>({
		defaultValues: { serving_points: [] },
	});
	const servingPointOptions = useMemo(
		() =>
			servingPoints.map((point) => ({
				label: point.name,
				value: point.id,
			})),
		[servingPoints],
	);

	const servingPointsForSelectedQueue = useMemo(
		() => servingPoints.filter((sp) => sp.queue === selectedQueueId),
		[servingPoints, selectedQueueId],
	);

	const clearMessages = () => {
		setError('');
		setSuccess('');
	};

	const loadQueues = useCallback(
		async (reset = true, groupFilterOverride?: QueueGroupFilterValue) => {
			const filter = groupFilterOverride !== undefined ? groupFilterOverride : queueGroupFilter;
			const requestedPage = reset ? 1 : queuePage;
			try {
				if (!reset) {
					if (filter === 'ungrouped') {
						return;
					}
					setQueueLoadingMore(true);
				}

				if (filter === 'ungrouped' && reset) {
					const response = await queuesApi.list({
						search: queueSearch || undefined,
						ordering: 'name',
						page: 1,
						page_size: 200,
					});
					const incomingRows = (response.results || []).filter((q) => q.group == null);
					setQueues(incomingRows);
					setQueueHasMore(false);
					setQueuePage(2);
					if (!selectedQueueId && incomingRows[0]) {
						setSelectedQueueId(incomingRows[0].id);
					}
					return;
				}

				const response = await queuesApi.list({
					search: queueSearch || undefined,
					ordering: 'name',
					page: requestedPage,
					page_size: 12,
					group: typeof filter === 'number' ? filter : undefined,
				});
				const incomingRows = response.results || [];
				setQueues((prev) => (reset ? incomingRows : [...prev, ...incomingRows]));
				setQueueHasMore(Boolean(response.next));
				setQueuePage(reset ? 2 : requestedPage + 1);
				if (!selectedQueueId && incomingRows[0]) {
					setSelectedQueueId(incomingRows[0].id);
				}
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				if (!reset) {
					setQueueLoadingMore(false);
				}
			}
		},
		[queuePage, queueSearch, queueGroupFilter, selectedQueueId],
	);

	const loadGroups = useCallback(
		async (reset = true) => {
			const requestedPage = reset ? 1 : groupsPage;
			try {
				if (!reset) {
					setGroupsLoadingMore(true);
				}
				const response = await queuesApi.groups({
					search: queueSearch || undefined,
					ordering: 'name',
					page: requestedPage,
					page_size: 12,
				});
				const incomingRows = response.results || [];
				setGroups((prev) => (reset ? incomingRows : [...prev, ...incomingRows]));
				setGroupsHasMore(Boolean(response.next));
				setGroupsPage(reset ? 2 : requestedPage + 1);
			} catch (err) {
				setError(getErrorMessage(err));
			} finally {
				if (!reset) {
					setGroupsLoadingMore(false);
				}
			}
		},
		[groupsPage, queueSearch],
	);

	const handleQueueGroupFilterChange = useCallback(
		(next: QueueGroupFilterValue) => {
			setQueueGroupFilter(next);
			setQueueRefreshKey((v) => v + 1);
		},
		[],
	);

	const refreshQueueCatalog = useCallback(async () => {
		try {
			const res = await queuesApi.list({ ordering: 'name', page: 1, page_size: 400 });
			setQueuesCatalog(res.results || []);
		} catch {
			/* non-fatal */
		}
	}, []);

	const handleLoadMoreQueues = useCallback(async () => {
		if (!queueHasMore || queueLoadingMore || loading) {
			return;
		}
		await loadQueues(false);
	}, [queueHasMore, queueLoadingMore, loading, loadQueues]);

	const handleLoadMoreGroups = useCallback(async () => {
		if (!groupsHasMore || groupsLoadingMore || loading) {
			return;
		}
		await loadGroups(false);
	}, [groupsHasMore, groupsLoadingMore, loading, loadGroups]);

	const loadQueuesTabData = useCallback(async () => {
		setLoading(false);
	}, []);

	const loadCustomersTabData = useCallback(async () => {
		setLoading(true);
		clearMessages();
		try {
			const tokenUsersR = await tokensApi.users({ ordering: '-created_at', page_size: 25 });
			setTokenUsers(tokenUsersR.results || []);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, []);

	const loadQueueFocus = useCallback(async () => {
		if (!selectedQueueId) return;
		try {
			const [statsRes, statusRes, schRes] = await Promise.all([
				queuesApi.statistics(selectedQueueId),
				tokensApi.queueStatus(selectedQueueId),
				schedulesApi.list({
					queue: selectedQueueId,
					page_size: 200,
					ordering: 'from_datetime',
				}),
			]);
			setQueueStats(statsRes);
			setQueueStatus(statusRes);
			const list = schRes.results || [];
			setSchedulesForQueue(list);
			setTokenForm((p) => {
				const stillValid = list.some((s) => s.id === p.schedule_id);
				const firstId = list[0]?.id ?? 0;
				if (stillValid) return p;
				return { ...p, schedule_id: firstId };
			});
		} catch (err) {
			setError(getErrorMessage(err));
		}
	}, [selectedQueueId]);

	const loadTokens = useCallback(async () => {
		try {
			const res = await tokensApi.list({
				queue: selectedQueueId || undefined,
				status: tokenStatusFilter || undefined,
				search: tokenSearch || undefined,
				ordering: '-created_at',
				page_size: 50,
			});
			setTokens(res.results || []);
		} catch (err) {
			setError(getErrorMessage(err));
		}
	}, [selectedQueueId, tokenSearch, tokenStatusFilter]);

	const loadTokensTabData = useCallback(async () => {
		setLoading(true);
		clearMessages();
		try {
			const [servingPointsR, recentR, todayR] = await Promise.all([
				queuesApi.servingPoints(),
				tokensApi.recent(10),
				tokensApi.today(),
			]);
			setServingPoints(servingPointsR.results || []);
			setRecentTokens(recentR || []);
			setTodayTokens(todayR || []);
			await refreshQueueCatalog();
			await loadQueueFocus();
			await loadTokens();
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [loadQueueFocus, loadTokens, refreshQueueCatalog]);

	useEffect(() => {
		const state = location.state as { tab?: QueueManagementTab } | null | undefined;
		const next = state?.tab;
		if (next === 'tokens' || next === 'queues' || next === 'customers') {
			setActiveTab(next);
		}
	}, [location.state]);

	useEffect(() => {
		if (activeTab !== 'tokens' || !selectedQueueId) {
			return;
		}
		void loadQueueFocus();
	}, [activeTab, selectedQueueId, loadQueueFocus]);

	useEffect(() => {
		if (activeTab !== 'tokens') {
			return;
		}
		void loadTokens();
	}, [activeTab, loadTokens]);

	useEffect(() => {
		if (activeTab === 'queues') {
			void loadQueuesTabData();
		} else if (activeTab === 'tokens') {
			void loadTokensTabData();
		} else if (activeTab === 'customers') {
			void loadCustomersTabData();
		}
	}, [activeTab, loadCustomersTabData, loadQueuesTabData, loadTokensTabData]);

	useEffect(() => {
		if (activeTab !== 'queues') return;
		if (queueDisplayMode === 'groups') {
			setQueueRefreshKey((v) => v + 1);
		}
	}, [activeTab, queueDisplayMode]);

	const refreshTokensOperationalData = async () => {
		const [recentR, todayR] = await Promise.all([tokensApi.recent(10), tokensApi.today()]);
		setRecentTokens(recentR || []);
		setTodayTokens(todayR || []);
		await refreshQueueCatalog();
		await loadQueueFocus();
		await loadTokens();
	};

	const runAction = async (key: string, action: () => Promise<unknown>, message: string) => {
		setActionLoading(key);
		clearMessages();

		try {
			await action();
			setSuccess(message);
			if (activeTab === 'queues') {
				setQueueRefreshKey((v) => v + 1);
				await refreshQueueCatalog();
			} else if (activeTab === 'tokens') {
				await refreshTokensOperationalData();
			} else if (activeTab === 'customers') {
				await loadCustomersTabData();
			}
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setActionLoading(null);
		}
	};

	const handleCreateToken = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!tokenForm.schedule_id) {
			setError('Please select a schedule for this token.');
			return;
		}
		await runAction(
			'create-token',
			() =>
				tokensApi.create({
					schedule_id: Number(tokenForm.schedule_id),
					name: tokenForm.name.trim(),
					email: tokenForm.email?.trim() || undefined,
					phone: tokenForm.phone?.trim() || undefined,
					age:
						tokenForm.age != null && !Number.isNaN(Number(tokenForm.age))
							? Number(tokenForm.age)
							: undefined,
					place: tokenForm.place?.trim() || undefined,
					remarks: tokenForm.remarks?.trim() || undefined,
					priority: tokenForm.priority,
					is_vip: tokenForm.is_vip,
				}),
			'Token created successfully.',
		);
		setTokenForm((previous) => ({
			...initialTokenForm,
			schedule_id: previous.schedule_id,
		}));
	};

	const resetQueueCreateForm = () =>
		setQueueCreateForm({
			name: '',
			description: '',
			limit: '50',
			allow_postpone: true,
		});

	const handleCreateQueue = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!queueCreateForm.name.trim()) {
			setError('Queue name is required.');
			return;
		}
		setActionLoading('create-queue');
		clearMessages();
		try {
			const payload: CreateQueuePayload = {
				name: queueCreateForm.name.trim(),
				description: queueCreateForm.description.trim() || undefined,
				limit: Number(queueCreateForm.limit || 0) || 0,
				allow_postpone: queueCreateForm.allow_postpone,
				serving_points: (getQueueModalValues('serving_points') || []).map((item) => item.value),
			};
			const created = await queuesApi.create(payload);
			setSuccess('Queue created successfully.');
			setQueues((prev) => [created, ...prev]);
			setQueuesCatalog((prev) => [created, ...prev]);
			setSelectedQueueId(created.id);
			resetQueueCreateForm();
			setQueueModalValue('serving_points', []);
			setShowCreateQueueModal(false);
			setQueueRefreshKey((v) => v + 1);
			await refreshQueueCatalog();
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setActionLoading(null);
		}
	};

	const handleCustomerSearch = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		clearMessages();
		setActionLoading('customer-search');
		try {
			const res =
				customerSearchType === 'phone'
					? await tokensApi.usersByPhone(customerSearchValue)
					: await tokensApi.usersByEmail(customerSearchValue);
			setCustomerSearchResults(res || []);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setActionLoading(null);
		}
	};

	const handleToggleQueue = (queue: Queue) => {
		runAction(
			`queue-${queue.id}`,
			() => (queue.is_active ? queuesApi.deactivate(queue.id) : queuesApi.activate(queue.id)),
			`Queue ${queue.is_active ? 'deactivated' : 'activated'} successfully.`,
		);
	};

	const renderTokenActions = (token: Token) => {
		const actions: Array<{ label: string; key: string; action: () => Promise<Token> }> = [];

		if (token.status === 'registred') {
			actions.push({
				label: 'Mark arrived',
				key: 'arrived',
				action: () => tokensApi.markArrived(token.id),
			});
		}

		if (token.status === 'reported' || token.status === 'postponed') {
			actions.push({
				label: 'Start',
				key: 'start',
				action: () => tokensApi.startServing(token.id),
			});
		}

		if (token.status === 'serving') {
			actions.push({
				label: 'Complete',
				key: 'complete',
				action: () => tokensApi.completeServing(token.id),
			});
		}

		if (token.status === 'registred') {
			actions.push({
				label: 'Postpone',
				key: 'postpone',
				action: () => tokensApi.postpone(token.id),
			});
		}

		if (token.status === 'registred' || token.status === 'reported' || token.status === 'serving') {
			actions.push({
				label: 'No Show',
				key: 'no-show',
				action: () => tokensApi.markNoShow(token.id),
			});
		}

		if (!['completed', 'cancelled', 'no_show'].includes(token.status)) {
			actions.push({
				label: 'Cancel',
				key: 'cancel',
				action: () => tokensApi.cancel(token.id),
			});
		}

		if (!actions.length) {
			return <span className='text-muted small'>No actions</span>;
		}

		return (
			<div
				className='d-flex flex-wrap gap-2'
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
				role='presentation'>
				{actions.map((item) => (
					<Button
						key={item.key}
						color={item.key === 'cancel' || item.key === 'no-show' ? 'danger' : 'primary'}
						isLight
						size='sm'
						isDisable={actionLoading === `token-${token.id}-${item.key}`}
						onClick={() =>
							runAction(
								`token-${token.id}-${item.key}`,
								item.action,
								`${token.token_number} updated successfully.`,
							)
						}>
						{item.label}
					</Button>
				))}
			</div>
		);
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case 'queues':
				return (
					<QueuesTabContent
						searchTerm={queueSearch}
						displayMode={queueDisplayMode}
						selectedGroupFilter={queueGroupFilter}
						onGroupFilterChange={handleQueueGroupFilterChange}
						onQueueGroupCardSelect={(groupId) => {
							setQueueDisplayMode('queues');
							handleQueueGroupFilterChange(groupId);
						}}
						refreshKey={queueRefreshKey}
						onToggleQueue={handleToggleQueue}
						isQueueActionLoading={(id) => actionLoading === `queue-${id}`}
					/>
				);
			case 'tokens':
				return (
					<TokensTabContent
						queues={queuesCatalog.length ? queuesCatalog : queues}
						schedules={schedulesForQueue}
						servingPoints={servingPointsForSelectedQueue}
						queueStats={queueStats}
						queueStatus={queueStatus}
						tokens={tokens}
						recentTokens={recentTokens}
						todayTokens={todayTokens}
						tokenForm={tokenForm}
						setTokenForm={setTokenForm}
						onCreateToken={handleCreateToken}
						createTokenLoading={actionLoading === 'create-token'}
						tokenSearch={tokenSearch}
						setTokenSearch={setTokenSearch}
						tokenStatusFilter={tokenStatusFilter}
						setTokenStatusFilter={setTokenStatusFilter}
						selectedQueueId={selectedQueueId}
						setSelectedQueueId={setSelectedQueueId}
						onFilterTokens={() => {
							void loadTokens();
						}}
						renderTokenActions={renderTokenActions}
					/>
				);
			case 'customers':
				return (
					<CustomersTabContent
						customerSearchType={customerSearchType}
						setCustomerSearchType={setCustomerSearchType}
						customerSearchValue={customerSearchValue}
						setCustomerSearchValue={setCustomerSearchValue}
						onSearch={handleCustomerSearch}
						searchLoading={actionLoading === 'customer-search'}
						customerSearchResults={customerSearchResults}
						tokenUsers={tokenUsers}
					/>
				);
			default:
				return null;
		}
	};

	const tabKeys: QueueManagementTab[] = ['queues', 'tokens', 'customers'];
	const runQueueHeaderSearch = () => {
		setQueueRefreshKey((v) => v + 1);
	};

	return (
		<Card stretch>
			<CardHeader>
				<div className='d-flex align-items-center gap-3'>
					<div className='media-files-title-text d-flex align-items-center gap-2 '>
						<Icon icon='Queue' color='primary' size='2x' />
						<span>Queue Management</span>
					</div>
					<div className='media-files-title-divider' />
					<div className='d-flex align-items-center justify-content-center media-files-tab-shell app-header-controls'>
						{tabKeys.map((tab) => {
							const label =
								tab === 'queues'
									? 'Queues'
									: tab === 'tokens'
										? 'Tokens'
										: 'Customers';
							return (
								<Button
									key={tab}
									color={activeTab === tab ? 'primary' : undefined}
									isLight={activeTab !== tab}
									className='media-files-tab-btn'
									onClick={() => setActiveTab(tab)}>
									{label}
								</Button>
							);
						})}
					</div>
				</div>
				<CardActions>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						{activeTab === 'queues' && (
							<>
								<DropDownFilter
									options={[
										{ label: 'Queues', value: 'queues' as const },
										{ label: 'Queue Groups', value: 'groups' as const },
									]}
									onChange={(option: { value: 'queues' | 'groups' }) => {
										setQueueDisplayMode(option.value);
										setQueueRefreshKey((v) => v + 1);
									}}
									selectedOption={
										queueDisplayMode === 'queues'
											? { label: 'Queues', value: 'queues' as const }
											: { label: 'Queue Groups', value: 'groups' as const }
									}
									color='primary'
									labelField='label'
									direction='down'
									icon='FilterAlt'
									buttonClassName='app-control-btn'
								/>
								<SearchComponent
									handleChange={setQueueSearch}
									value={queueSearch}
									placeholder={
										queueDisplayMode === 'groups'
											? 'Search queue groups'
											: 'Search queues'
									}
									className='app-search-modern me-0'
									inputClassName='app-search-modern__input'
									iconColor='primary'
									iconSize='2x'
									withDefaultMargin={false}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											runQueueHeaderSearch();
										}
									}}
									onBlur={runQueueHeaderSearch}
								/>
							</>
						)}
						<Button color='primary' icon='Add' onClick={() => setShowCreateQueueModal(true)}>
							Add Queue
						</Button>
					</div>
				</CardActions>
			</CardHeader>
			<CardBody>
				{error && <div className='alert alert-danger'>{error}</div>}
				{success && <div className='alert alert-success'>{success}</div>}

				{loading ? (
					<div className='text-center text-muted py-5'>Loading queue management data...</div>
				) : (
					renderTabContent()
				)}
			</CardBody>

			<Modal isOpen={showCreateQueueModal} setIsOpen={setShowCreateQueueModal} isCentered size='lg' isAnimation={false}>
				<ModalHeader setIsOpen={setShowCreateQueueModal}>
					<ModalTitle id='add-queue-modal'>Add Queue</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleCreateQueue}>
					<ModalBody>
						<div className='row g-3'>
							<div className='col-12'>
								<label className='form-label fw-semibold' htmlFor='queue-name'>
									Queue Name
								</label>
								<input
									id='queue-name'
									className='form-control'
									value={queueCreateForm.name}
									onChange={(e) =>
										setQueueCreateForm((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder='Enter queue name'
									required
								/>
							</div>
							<div className='col-12'>
								<label className='form-label fw-semibold' htmlFor='queue-description'>
									Description
								</label>
								<textarea
									id='queue-description'
									className='form-control'
									rows={3}
									value={queueCreateForm.description}
									onChange={(e) =>
										setQueueCreateForm((prev) => ({ ...prev, description: e.target.value }))
									}
									placeholder='Short description'
								/>
							</div>
							<div className='col-md-6'>
								<label className='form-label fw-semibold' htmlFor='queue-limit'>
									Token Limit
								</label>
								<input
									id='queue-limit'
									type='number'
									min={1}
									className='form-control'
									value={queueCreateForm.limit}
									onChange={(e) =>
										setQueueCreateForm((prev) => ({ ...prev, limit: e.target.value }))
									}
								/>
							</div>
							<div className='col-md-6 d-flex align-items-end'>
								<div className='form-check form-switch mb-2'>
									<input
										className='form-check-input'
										type='checkbox'
										id='queue-allow-postpone'
										checked={queueCreateForm.allow_postpone}
										onChange={(e) =>
											setQueueCreateForm((prev) => ({
												...prev,
												allow_postpone: e.target.checked,
											}))
										}
									/>
									<label className='form-check-label fw-semibold' htmlFor='queue-allow-postpone'>
										Allow Postpone
									</label>
								</div>
							</div>
							<div className='col-12'>
								<label className='form-label fw-semibold'>Serving Points</label>
								<ReactSelectComponent
									control={queueModalControl}
									name=''
									field_name='serving_points'
									getValues={getQueueModalValues}
									errors={queueModalErrors}
									options={servingPointOptions}
									isRequired={false}
									isDisable={false}
									isClearable
									isMulti={true}
									placeholder='Select serving points'
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color='light'
							isLight
							onClick={() => {
								resetQueueCreateForm();
								setQueueModalValue('serving_points', []);
								setShowCreateQueueModal(false);
							}}>
							Cancel
						</Button>
						<Button color='primary' type='submit' isDisable={actionLoading === 'create-queue'}>
							{actionLoading === 'create-queue' ? (
								<>
									<Spinner isSmall inButton />
									Creating...
								</>
							) : (
								'Create Queue'
							)}
						</Button>
					</ModalFooter>
				</form>
			</Modal>
		</Card>
	);
};

export default QueueManagementWorkspace;

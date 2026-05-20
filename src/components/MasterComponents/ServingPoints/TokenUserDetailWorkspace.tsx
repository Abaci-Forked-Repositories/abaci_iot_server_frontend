import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Nav, { NavItem } from '../../bootstrap/Nav';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '../../bootstrap/Dropdown';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type PatchTokenUserPayload,
	type QueueEvent,
	type Token,
	type TokenParentSummary,
	type TokenServingHistory,
	type TokenUser,
	tokensApi,
} from '../../../services/queueManagementApi';
import { formatDate, statusBadgeColor } from '../QueueManagement/queueManagementUtils';
import { EventFeed } from '../QueueManagement/QueueEventsTimelineCard';

type TokenUserDetailWorkspaceProps = {
	onTokenUserNameChange?: (name: string | null) => void;
};

const tokenQueueName = (token: Token): string => {
	if (typeof token.queue === 'object' && token.queue) {
		return token.queue.name || `Queue ${token.queue.id}`;
	}
	if (token.queue_name) return token.queue_name;
	if (typeof token.queue === 'number') return `Queue ${token.queue}`;
	return '—';
};

const displayOrDash = (value: unknown): string => {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
};

/** Customer-facing parent token label: `parent_tokens` row where `id === parent_token`, then `token_display` / `token_number`. */
const resolveParentTokenDisplay = (token: Token): string | null => {
	if (token.parent_token == null) return null;
	const row = token.parent_tokens?.find((p) => p.id === token.parent_token);
	if (!row) return null;
	if (row.token_display != null && String(row.token_display).trim() !== '')
		return String(row.token_display).trim();
	if (row.token_number != null && String(row.token_number).trim() !== '')
		return String(row.token_number).trim();
	return null;
};

const formatParentTokenField = (token: Token): string => {
	if (token.parent_token == null) return '—';
	const label = resolveParentTokenDisplay(token);
	return label != null ? `#${label}` : '—';
};

const parentSummaryDisplayToken = (p: TokenParentSummary): string => {
	if (p.token_display != null && String(p.token_display).trim() !== '')
		return String(p.token_display).trim();
	if (p.token_number != null && String(p.token_number).trim() !== '')
		return String(p.token_number).trim();
	return '—';
};

const tokenServingHistoryRows = (token: Token): TokenServingHistory[] => {
	const rows = token.complete_serving_history ?? token.serving_history;
	return rows?.length ? rows : [];
};

const servingHistoryEntryEnded = (h: TokenServingHistory): boolean => {
	if (h.exited_at) return true;
	if (
		h.completed_at ||
		h.cancelled_at ||
		h.no_show_marked_at ||
		h.postponed_at ||
		h.skipped_at
	)
		return true;
	const rel = h.relationship != null && String(h.relationship).trim() !== '';
	if (rel && h.duration != null && String(h.duration).trim() !== '') return true;
	return false;
};

/** Map token serving history into `QueueEvent`-shaped rows for `EventFeed` (schedule event history UI). */
const mapServingHistoryToQueueEvents = (token: Token): QueueEvent[] => {
	const raw = tokenServingHistoryRows(token);
	if (!raw.length) return [];
	const sorted = [...raw].sort((a, b) => {
		const ta = a.entered_at ? Date.parse(a.entered_at) : 0;
		const tb = b.entered_at ? Date.parse(b.entered_at) : 0;
		return ta - tb;
	});
	const queueName =
		token.queue_name ??
		(typeof token.queue === 'object' && token.queue ? token.queue.name : null);

	return sorted.map((h) => {
		const ended = servingHistoryEntryEnded(h);
		const rel = h.relationship?.toLowerCase();
		const isParent = rel === 'parent';
		const event_type = !ended
			? 'serving_history_active'
			: isParent
				? 'serving_history_parent'
				: 'serving_history_self';

		const lines: string[] = [];
		if (rel === 'parent') {
			const td = h.token_display?.trim();
			lines.push(td ? `Parent token #${td}` : 'Parent token');
		} else if (rel === 'self') {
			lines.push('This token');
		}
		if (!ended) {
			lines.push('Still at counter');
		} else {
			const endBits: string[] = [];
			if (h.completed_at) endBits.push(`Completed: ${formatDate(h.completed_at)}`);
			if (h.cancelled_at) endBits.push(`Cancelled: ${formatDate(h.cancelled_at)}`);
			if (h.no_show_marked_at) endBits.push(`No-show: ${formatDate(h.no_show_marked_at)}`);
			if (h.postponed_at) endBits.push(`Postponed: ${formatDate(h.postponed_at)}`);
			if (h.skipped_at) endBits.push(`Skipped: ${formatDate(h.skipped_at)}`);
			if (h.exited_at) endBits.push(`Exited: ${formatDate(h.exited_at)}`);
			if (endBits.length) lines.push(...endBits);
			else lines.push('Visit ended');
		}
		if (h.duration != null && h.duration !== '') lines.push(`Duration: ${h.duration}`);
		if (h.served_by_username?.trim())
			lines.push(`Served by: ${h.served_by_username.trim()}`);
		if (h.completed_by_username?.trim())
			lines.push(`Completed by: ${h.completed_by_username.trim()}`);
		if (h.notes != null && String(h.notes).trim() !== '') lines.push(String(h.notes).trim());

		const pointLabel = h.serving_point_name?.trim() || `Serving point #${h.serving_point}`;
		const event_type_display =
			isParent && h.token_display?.trim()
				? `Parent token #${h.token_display.trim()}`
				: ended
					? pointLabel
					: `At counter · ${pointLabel}`;

		const actor =
			h.served_by_username?.trim() || h.completed_by_username?.trim() || undefined;

		return {
			id: h.id,
			event_type,
			event_type_display,
			description: lines.length ? lines.join('\n') : null,
			timestamp: h.entered_at,
			queue_name: queueName,
			schedule_name: token.schedule != null ? `Schedule #${token.schedule}` : null,
			serving_point_name: h.serving_point_name?.trim() || null,
			user_username: actor ?? null,
		} as QueueEvent;
	});
};

type StatusRuleKey = 'registred' | 'waiting';

const normalizeStatusForRules = (status: string): StatusRuleKey | null => {
	const s = status.toLowerCase();
	if (s === 'registred' || s === 'registered') return 'registred';
	if (s === 'waiting') return 'waiting';
	return null;
};

/** 1: registred → waiting, cancelled, postponed. 2: waiting → cancelled, postponed. */
const allowedNextTokenStatuses = (
	status: string,
): Array<'waiting' | 'cancelled' | 'postponed'> => {
	const key = normalizeStatusForRules(status);
	if (key === 'registred') return ['waiting', 'cancelled', 'postponed'];
	if (key === 'waiting') return ['cancelled', 'postponed'];
	return [];
};

const applyTokenStatusTransition = (
	tokenId: number,
	target: 'waiting' | 'cancelled' | 'postponed',
): Promise<Token> => {
	if (target === 'waiting') return tokensApi.markArrived(tokenId);
	if (target === 'cancelled') return tokensApi.cancel(tokenId);
	return tokensApi.postpone(tokenId);
};

const statusTransitionButtonColor = (
	target: 'waiting' | 'cancelled' | 'postponed',
): 'primary' | 'danger' | 'warning' => {
	if (target === 'waiting') return 'primary';
	if (target === 'cancelled') return 'danger';
	return 'warning';
};

const statusTransitionLabel = (target: 'waiting' | 'cancelled' | 'postponed'): string => {
	if (target === 'waiting') return 'Mark waiting';
	if (target === 'cancelled') return 'Cancel';
	if (target === 'postponed') return 'Postpone';
	return target;
};

const TokenUserDetailWorkspace: React.FC<TokenUserDetailWorkspaceProps> = ({
	onTokenUserNameChange,
}) => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const id = Number(userId);
	const seededTokenUser =
		(location.state as { tokenUser?: TokenUser } | null)?.tokenUser ?? null;

	const [loading, setLoading] = useState(true);
	const [tokenUser, setTokenUser] = useState<TokenUser | null>(seededTokenUser);
	const [tokens, setTokens] = useState<Token[]>([]);
	const [detailViewTokenId, setDetailViewTokenId] = useState<number | null>(null);
	const [detailToken, setDetailToken] = useState<Token | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [statusTransitionTokenId, setStatusTransitionTokenId] = useState<number | null>(null);
	const [statusActionsMenuTokenId, setStatusActionsMenuTokenId] = useState<number | null>(null);
	const [prioritizingTokenId, setPrioritizingTokenId] = useState<number | null>(null);
	const [editUserOpen, setEditUserOpen] = useState(false);
	const [savingUser, setSavingUser] = useState(false);
	const [editDraft, setEditDraft] = useState({
		name: '',
		email: '',
		phone: '',
		age: '',
		place: '',
		remarks: '',
	});
	/** Token detail modal: details, optional parent chain list, serving history */
	const [detailModalTab, setDetailModalTab] = useState<'details' | 'parents' | 'serving'>('details');

	const { theme, headerStyles, rowStyles } = useTablestyle();
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);
	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const load = useCallback(async () => {
		if (!id || Number.isNaN(id)) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const [tokensRes, usersListRes] = await Promise.all([
				tokensApi.list({
					token_user: id,
					ordering: '-created_at',
					limit: 500,
					offset: 0,
				}),
				seededTokenUser
					? Promise.resolve(null)
					: tokensApi.users({ page: 1, page_size: 500 }),
			]);

			setTokens(tokensRes.results || []);

			if (!seededTokenUser) {
				const found =
					usersListRes?.results.find((u) => u.id === id) ?? null;
				if (found) setTokenUser(found);
				else {
					const fromTokens = (tokensRes.results || [])
						.map((t) => t.token_user)
						.find((u): u is TokenUser => Boolean(u && u.id === id));
					if (fromTokens) setTokenUser(fromTokens);
				}
			}
		} catch (err) {
			errorNotifierRef.current(err);
			setTokens([]);
		} finally {
			setLoading(false);
		}
	}, [id, seededTokenUser]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!onTokenUserNameChange) return;
		onTokenUserNameChange(tokenUser?.name ?? null);
	}, [onTokenUserNameChange, tokenUser?.name]);

	useEffect(() => {
		if (detailViewTokenId == null) {
			setDetailToken(null);
			setDetailLoading(false);
			return;
		}
		let cancelled = false;
		setDetailLoading(true);
		setDetailToken(null);
		void tokensApi
			.get(detailViewTokenId)
			.then((t) => {
				if (!cancelled) {
					setDetailToken(t);
					setDetailLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					errorNotifierRef.current(err);
					setDetailLoading(false);
					setDetailViewTokenId(null);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [detailViewTokenId]);

	useEffect(() => {
		setDetailModalTab('details');
	}, [detailViewTokenId]);

	useEffect(() => {
		if (
			detailToken &&
			detailModalTab === 'parents' &&
			!(detailToken.parent_tokens && detailToken.parent_tokens.length > 0)
		) {
			setDetailModalTab('details');
		}
	}, [detailToken, detailModalTab]);

	const closeDetailModal = useCallback(() => {
		setDetailViewTokenId(null);
	}, []);

	const openTokenDetail = useCallback((row: Token) => {
		setDetailViewTokenId(row.id);
	}, []);

	const handleTokenStatusTransition = useCallback(
		async (row: Token, target: 'waiting' | 'cancelled' | 'postponed') => {
			const allowed = allowedNextTokenStatuses(row.status);
			if (!allowed.includes(target)) {
				showErrorNotification('That status change is not allowed from the current state.');
				return;
			}
			setStatusTransitionTokenId(row.id);
			try {
				const updated = await applyTokenStatusTransition(row.id, target);
				setTokens((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
				setDetailToken((d) => (d?.id === updated.id ? updated : d));
				showSuccessNotification('Status updated.');
			} catch (err) {
				showErrorNotification(err);
			} finally {
				setStatusTransitionTokenId(null);
			}
		},
		[showErrorNotification, showSuccessNotification],
	);

	const openEditUserModal = useCallback(() => {
		if (!tokenUser) return;
		setEditDraft({
			name: tokenUser.name ?? '',
			email: tokenUser.email ?? '',
			phone: tokenUser.phone ?? '',
			age: tokenUser.age != null && tokenUser.age !== '' ? String(tokenUser.age) : '',
			place: tokenUser.place ?? '',
			remarks: tokenUser.remarks ?? '',
		});
		setEditUserOpen(true);
	}, [tokenUser]);

	const closeEditUserModal = useCallback(() => {
		setEditUserOpen(false);
	}, []);

	const handleSaveTokenUser = useCallback(async () => {
		const name = editDraft.name.trim();
		if (!name) {
			showErrorNotification('Name is required.');
			return;
		}
		const ageStr = editDraft.age.trim();
		if (ageStr !== '') {
			const n = Number(ageStr);
			if (!Number.isFinite(n)) {
				showErrorNotification('Age must be a valid number.');
				return;
			}
		}
		const payload: PatchTokenUserPayload = {
			name,
			email: editDraft.email.trim() || null,
			phone: editDraft.phone.trim() || null,
			place: editDraft.place.trim() || null,
			remarks: editDraft.remarks.trim() || null,
		};
		if (ageStr !== '') {
			payload.age = Number(ageStr);
		} else {
			payload.age = null;
		}
		setSavingUser(true);
		try {
			const updated = await tokensApi.patchUser(id, payload);
			setTokenUser(updated);
			setTokens((prev) =>
				prev.map((t) =>
					t.token_user ? { ...t, token_user: { ...t.token_user, ...updated } } : t,
				),
			);
			setDetailToken((d) =>
				d?.token_user ? { ...d, token_user: { ...d.token_user, ...updated } } : d,
			);
			closeEditUserModal();
			showSuccessNotification('Token user updated.');
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSavingUser(false);
		}
	}, [
		closeEditUserModal,
		editDraft,
		id,
		showErrorNotification,
		showSuccessNotification,
	]);

	const handleSetPrioritizedQueue = useCallback(
		async (row: Token, prioritized: boolean) => {
			if (Boolean(row.is_priority_queued) === prioritized) return;
			setPrioritizingTokenId(row.id);
			try {
				const updated = await tokensApi.patch(row.id, {
					is_priority_queued: prioritized,
				});
				setTokens((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
				setDetailToken((d) => (d?.id === updated.id ? updated : d));
				showSuccessNotification(
					prioritized
						? 'Marked as prioritized for the queue.'
						: 'Removed prioritization for the queue.',
				);
			} catch (err) {
				showErrorNotification(err);
			} finally {
				setPrioritizingTokenId(null);
			}
		},
		[showErrorNotification, showSuccessNotification],
	);

	const columns = useMemo(
		() => [
			{
				title: 'Token',
				field: 'token_number',
				render: (rowData: Token) => (
					<span className='fw-semibold'>{rowData.token_number || '—'}</span>
				),
			},
			{
				title: 'Queue',
				field: 'queue',
				render: (rowData: Token) => tokenQueueName(rowData),
			},
			{
				title: 'Schedule',
				field: 'schedule',
				render: (rowData: Token) => {
					if (rowData.schedule == null) return '—';
					return (
						<button
							type='button'
							className='btn btn-link p-0 align-baseline fw-semibold'
							aria-label={`Open schedule ${rowData.schedule}`}
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								navigate(`/queue-management/schedules/${rowData.schedule}`);
							}}>
							#{rowData.schedule}
						</button>
					);
				},
			},
			{
				title: 'Status',
				field: 'status',
				render: (rowData: Token) => (
					<Badge color={statusBadgeColor(rowData.status)} isLight>
						{rowData.status}
					</Badge>
				),
			},
			{
				title: 'Created at',
				field: 'created_at',
				render: (rowData: Token) => formatDate(rowData.created_at),
			},
			{
				title: 'Started serving',
				field: 'started_serving_at',
				render: (rowData: Token) => formatDate(rowData.started_serving_at),
			},
			{
				title: 'Completed',
				field: 'completed_at',
				render: (rowData: Token) => formatDate(rowData.completed_at),
			},
			{
				title: 'Actions',
				field: 'actions',
				sorting: false,
				filtering: false,
				cellStyle: { whiteSpace: 'nowrap', verticalAlign: 'middle' },
				headerStyle: { whiteSpace: 'nowrap' },
				render: (rowData: Token) => (
					<div className='d-flex flex-row flex-nowrap align-items-center gap-1'>
						{rowData.is_priority_queued ? (
							<Button
								color='secondary'
								isLight
								size='sm'
								aria-label='Remove prioritization for this token in the queue'
								isDisable={prioritizingTokenId === rowData.id}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.preventDefault();
									e.stopPropagation();
									void handleSetPrioritizedQueue(rowData, false);
								}}>
								Unprioritize
							</Button>
						) : (
							<Button
								color='success'
								isLight
								size='sm'
								aria-label='Mark this token as prioritized for the queue'
								isDisable={prioritizingTokenId === rowData.id}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.preventDefault();
									e.stopPropagation();
									void handleSetPrioritizedQueue(rowData, true);
								}}>
								Prioritize
							</Button>
						)}
						{(() => {
							const allowed = allowedNextTokenStatuses(rowData.status);
							const busy = statusTransitionTokenId === rowData.id;
							const waitingTargets = allowed.filter((t) => t === 'waiting');
							const cancelPostponeTargets = allowed.filter(
								(t): t is 'cancelled' | 'postponed' =>
									t === 'cancelled' || t === 'postponed',
							);
							return (
								<>
									{waitingTargets.map((target) => {
										const label = statusTransitionLabel(target);
										return (
											<Button
												key={target}
												color={statusTransitionButtonColor(target)}
												isLight
												size='sm'
												aria-label={`Set token status to ${label}`}
												isDisable={busy}
												onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
													e.preventDefault();
													e.stopPropagation();
													void handleTokenStatusTransition(rowData, target);
												}}>
												{label}
											</Button>
										);
									})}
									{cancelPostponeTargets.length > 0 ? (
										<div
											className='d-inline-block'
											role='presentation'
											onClick={(e) => e.stopPropagation()}>
											<Dropdown
												isOpen={statusActionsMenuTokenId === rowData.id}
												setIsOpen={(
													next:
														| boolean
														| null
														| ((prev: boolean) => boolean),
												) => {
													if (typeof next === 'function') {
														setStatusActionsMenuTokenId((openId) => {
															const wasOpen = openId === rowData.id;
															const shouldOpen = next(wasOpen);
															return shouldOpen ? rowData.id : wasOpen ? null : openId;
														});
														return;
													}
													if (next === false || next === null) {
														setStatusActionsMenuTokenId((openId) =>
															openId === rowData.id ? null : openId,
														);
														return;
													}
													setStatusActionsMenuTokenId(rowData.id);
												}}>
												<DropdownToggle hasIcon={false}>
													<Button
														type='button'
														color='secondary'
														isLight
														size='sm'
														icon='KeyboardArrowDown'
														aria-label='Cancel or postpone token'
														isDisable={busy}
													/>
												</DropdownToggle>
												<DropdownMenu isAlignmentEnd size='sm'>
													{cancelPostponeTargets.map((target) => {
														const label = statusTransitionLabel(target);
														return (
															<DropdownItem key={target}>
																<button
																	type='button'
																	className={`text-start w-100 border-0 bg-transparent py-2 px-3 ${
																		target === 'cancelled'
																			? 'text-danger'
																			: 'text-warning'
																	}`}
																	disabled={busy}
																	onClick={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		setStatusActionsMenuTokenId(null);
																		void handleTokenStatusTransition(
																			rowData,
																			target,
																		);
																	}}>
																	{label}
																</button>
															</DropdownItem>
														);
													})}
												</DropdownMenu>
											</Dropdown>
										</div>
									) : null}
								</>
							);
						})()}
						
					</div>
				),
			},
		],
		[
			navigate,
			handleTokenStatusTransition,
			handleSetPrioritizedQueue,
			prioritizingTokenId,
			statusTransitionTokenId,
			statusActionsMenuTokenId,
		],
	);

	const detailModalTitle = useMemo(() => {
		if (detailToken?.token_number != null && detailToken.token_number !== '') {
			return `Token #${detailToken.token_number}`;
		}
		if (detailViewTokenId == null) return 'Token details';
		const row = tokens.find((t) => t.id === detailViewTokenId);
		if (row?.token_number) return `Token #${row.token_number}`;
		return `Token #${detailViewTokenId}`;
	}, [detailToken, detailViewTokenId, tokens]);

	const servingHistoryQueueEvents = useMemo(
		() => (detailToken ? mapServingHistoryToQueueEvents(detailToken) : []),
		[detailToken],
	);
	const servingHistorySubtitle = useMemo(() => {
		if (!detailToken) return null;
		const parts: string[] = [];
		const qn = tokenQueueName(detailToken);
		if (qn && qn !== '—') parts.push(qn);
		if (detailToken.schedule != null) parts.push(`Schedule #${detailToken.schedule}`);
		const td =
			detailToken.token_display != null && String(detailToken.token_display).trim() !== ''
				? String(detailToken.token_display).trim()
				: detailToken.token_number != null && String(detailToken.token_number).trim() !== ''
					? String(detailToken.token_number).trim()
					: null;
		if (td) parts.push(`Token #${td}`);
		return parts.length ? parts.join(' · ') : null;
	}, [detailToken]);
	const servingHistoryCount = detailToken ? tokenServingHistoryRows(detailToken).length : 0;
	const parentTokensCount = detailToken?.parent_tokens?.length ?? 0;

	if (!id || Number.isNaN(id)) {
		return <div className='alert alert-warning'>Invalid token user.</div>;
	}

	const remarks = tokenUser?.remarks?.trim() ? tokenUser.remarks : '';

	return (
		<div className='d-grid gap-4'>
			<Card>
				<CardBody>
					<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap'>
						<div>
							<div className='text-muted small mb-1'>Token User</div>
							<div className='h4 mb-1'>{tokenUser?.name || `User #${id}`}</div>
							<div className='text-muted'>
								{tokenUser?.created_at
									? `Joined ${formatDate(tokenUser.created_at)}`
									: ''}
							</div>
						</div>
						<div className='d-flex gap-2'>
							<Button
								color='primary'
								isLight
								icon='Edit'
								isDisable={loading || !tokenUser}
								onClick={openEditUserModal}>
								Edit
							</Button>
							<Button
								color='light'
								isLight
								icon='ArrowBack'
								onClick={() => navigate('/token-users')}>
								Back
							</Button>
						</div>
					</div>

					{loading && !tokenUser ? (
						<div className='text-muted py-4'>Loading token user details...</div>
					) : (
						<div className='row g-3 mt-2'>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Email</div>
								<div className='fw-semibold'>{tokenUser?.email || '—'}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Phone</div>
								<div className='fw-semibold'>{tokenUser?.phone || '—'}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Age</div>
								<div className='fw-semibold'>
									{tokenUser?.age != null && tokenUser.age !== ''
										? String(tokenUser.age)
										: '—'}
								</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Place</div>
								<div className='fw-semibold'>{tokenUser?.place || '—'}</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Created at</div>
								<div className='fw-semibold'>
									{formatDate(tokenUser?.created_at)}
								</div>
							</div>
							<div className='col-12 col-md-4'>
								<div className='small text-muted'>Total tokens</div>
								<div className='fw-semibold'>{tokens.length}</div>
							</div>
							{remarks && (
								<div className='col-12'>
									<div className='small text-muted'>Remarks</div>
									<div className='fw-semibold'>{remarks}</div>
								</div>
							)}
						</div>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<CardLabel icon='ConfirmationNumber'>
						<CardTitle tag='h5'>Tokens ({tokens.length})</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody className='table-responsive'>
					<div className='material_tabel_wrapper'>
						<ThemeProvider theme={theme}>
							<MaterialTable
								title=' '
								//@ts-ignore
								columns={columns}
								data={tokens}
								isLoading={loading}
								onRowClick={(_event, rowData) => {
									if (rowData) openTokenDetail(rowData);
								}}
								options={{
									headerStyle: headerStyles(),
									rowStyle: { ...rowStyles(), cursor: 'pointer' },
									search: true,
									pageSize: 10,
									pageSizeOptions: [10, 25, 50, 100],
									emptyRowsWhenPaging: false,
								}}
								localization={{
									pagination: { labelRowsPerPage: '' },
									body: { emptyDataSourceMessage: 'No tokens for this user yet.' },
								}}
							/>
						</ThemeProvider>
					</div>
				</CardBody>
			</Card>

			{tokenUser == null && !loading && (
				<div className='alert alert-warning mb-0'>
					<Icon icon='Info' className='me-1' />
					Token user details could not be loaded from the API. Showing tokens only.
				</div>
			)}

			<Modal
				isCentered
				isOpen={detailViewTokenId != null}
				setIsOpen={(open) => {
					if (!open) closeDetailModal();
				}}
				size='lg'
				titleId='token-detail-modal-title'>
				<ModalHeader setIsOpen={closeDetailModal}>
					<ModalTitle id='token-detail-modal-title'>{detailModalTitle}</ModalTitle>
				</ModalHeader>
				<ModalBody
					className='overflow-auto'
					style={{ maxHeight: 'min(85vh, calc(100dvh - 10rem))' }}>
					{detailLoading && (
						<div className='d-flex flex-column align-items-center justify-content-center gap-2 py-5 text-muted'>
							<Spinner color='primary' />
							<span>Loading token…</span>
						</div>
					)}
					{!detailLoading && detailToken && (
						<div>
							<Nav
								design='pills'
								isFill
								className='mb-3 gap-2'
								role='tablist'>
								<NavItem isActive={detailModalTab === 'details'}>
									<button
										type='button'
										className='w-100 text-center'
										id='token-modal-tab-details'
										role='tab'
										aria-selected={detailModalTab === 'details'}
										aria-controls='token-modal-panel-details'
										onClick={() => setDetailModalTab('details')}>
										Details
									</button>
								</NavItem>
								{parentTokensCount > 0 ? (
									<NavItem isActive={detailModalTab === 'parents'}>
										<button
											type='button'
											className='w-100 d-inline-flex align-items-center justify-content-center gap-2'
											id='token-modal-tab-parents'
											role='tab'
											aria-selected={detailModalTab === 'parents'}
											aria-controls='token-modal-panel-parents'
											onClick={() => setDetailModalTab('parents')}>
											<span>Parent tokens</span>
											<span className='badge bg-warning bg-opacity-25 text-warning rounded-pill'>
												{parentTokensCount}
											</span>
										</button>
									</NavItem>
								) : null}
								<NavItem isActive={detailModalTab === 'serving'}>
									<button
										type='button'
										className='w-100 d-inline-flex align-items-center justify-content-center gap-2'
										id='token-modal-tab-serving'
										role='tab'
										aria-selected={detailModalTab === 'serving'}
										aria-controls='token-modal-panel-serving'
										onClick={() => setDetailModalTab('serving')}>
										<span>Serving history</span>
										{servingHistoryCount > 0 ? (
											<span className='badge bg-info bg-opacity-25 text-info rounded-pill'>
												{servingHistoryCount}
											</span>
										) : null}
									</button>
								</NavItem>
							</Nav>

							<div
								id='token-modal-panel-details'
								role='tabpanel'
								aria-labelledby='token-modal-tab-details'
								hidden={detailModalTab !== 'details'}
								className={
									detailModalTab === 'details' ? 'd-grid gap-3' : 'd-none'
								}>
								<Card shadow='sm' className='mb-0'>
									<CardHeader>
										<CardLabel icon='ConfirmationNumber' iconColor='primary'>
											<CardTitle tag='h6' className='h6 mb-0'>
												Token details
											</CardTitle>
										</CardLabel>
									</CardHeader>
									<CardBody>
										<div className='row g-3'>
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Queue</div>
												<div className='fw-semibold'>{tokenQueueName(detailToken)}</div>
											</div>
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Schedule</div>
												<div className='fw-semibold'>
													{detailToken.schedule != null ? `${detailToken.schedule}` : '—'}
												</div>
											</div>
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Status</div>
												<div>
													<Badge color={statusBadgeColor(detailToken.status)} isLight>
														{detailToken.status}
													</Badge>
												</div>
											</div>
											{/* <div className='col-12 col-md-6'>
												<div className='small text-muted'>Created at</div>
												<div className='fw-semibold'>{formatDate(detailToken.created_at)}</div>
											</div> */}
											{/* <div className='col-12 col-md-6'>
												<div className='small text-muted'>Started serving</div>
												<div className='fw-semibold'>
													{formatDate(detailToken.started_serving_at)}
												</div>
											</div> */}
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Completed</div>
												<div className='fw-semibold'>{formatDate(detailToken.completed_at)}</div>
											</div>
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Cancelled</div>
												<div className='fw-semibold'>{formatDate(detailToken.cancelled_at)}</div>
											</div>
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Wait time</div>
												<div className='fw-semibold'>{displayOrDash(detailToken.wait_time)}</div>
											</div>
											<div className='col-12 col-md-6'>
												<div className='small text-muted'>Service time</div>
												<div className='fw-semibold'>
													{displayOrDash(detailToken.service_time)}
												</div>
											</div>
											{detailToken.parent_token != null && (
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>Parent token</div>
													<div className='fw-semibold'>
														{formatParentTokenField(detailToken)}
													</div>
												</div>
											)}
											<div className='col-12'>
												<div className='small text-muted'>Notes</div>
												<div
													className='fw-semibold text-break'
													style={{ whiteSpace: 'pre-wrap' }}>
													{detailToken.notes != null && detailToken.notes !== ''
														? detailToken.notes
														: '—'}
												</div>
											</div>
										</div>
									</CardBody>
								</Card>

								{detailToken.token_user && (
									<Card shadow='sm' className='mb-0'>
										<CardHeader>
											<CardLabel icon='Person' iconColor='success'>
												<CardTitle tag='h6' className='h6 mb-0'>
													Token user
												</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											<div className='row g-3'>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>Name</div>
													<div className='fw-semibold'>
														{displayOrDash(detailToken.token_user.name)}
													</div>
												</div>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>Email</div>
													<div className='fw-semibold'>
														{displayOrDash(detailToken.token_user.email)}
													</div>
												</div>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>Phone</div>
													<div className='fw-semibold'>
														{displayOrDash(detailToken.token_user.phone)}
													</div>
												</div>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>Age</div>
													<div className='fw-semibold'>
														{detailToken.token_user.age != null &&
														detailToken.token_user.age !== ''
															? String(detailToken.token_user.age)
															: '—'}
													</div>
												</div>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>Place</div>
													<div className='fw-semibold'>
														{displayOrDash(detailToken.token_user.place)}
													</div>
												</div>
												<div className='col-12'>
													<div className='small text-muted'>Remarks</div>
													<div
														className='fw-semibold text-break'
														style={{ whiteSpace: 'pre-wrap' }}>
														{detailToken.token_user.remarks != null &&
														detailToken.token_user.remarks !== ''
															? detailToken.token_user.remarks
															: '—'}
													</div>
												</div>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>User created at</div>
													<div className='fw-semibold'>
														{formatDate(detailToken.token_user.created_at)}
													</div>
												</div>
												<div className='col-12 col-md-6'>
													<div className='small text-muted'>User updated at</div>
													<div className='fw-semibold'>
														{formatDate(detailToken.token_user.updated_at)}
													</div>
												</div>
											</div>
										</CardBody>
									</Card>
								)}
							</div>

							<div
								id='token-modal-panel-parents'
								role='tabpanel'
								aria-labelledby='token-modal-tab-parents'
								hidden={detailModalTab !== 'parents'}
								className={detailModalTab === 'parents' ? undefined : 'd-none'}>
								<Card shadow='sm' className='mb-0'>
									<CardHeader>
										<CardLabel icon='AccountTree' iconColor='warning'>
											<CardTitle
												tag='h6'
												className='h6 mb-0 d-flex align-items-center gap-2 flex-wrap'>
												Parent tokens
												<span className='badge bg-warning bg-opacity-25 text-warning rounded-pill'>
													{parentTokensCount}
												</span>
											</CardTitle>
										</CardLabel>
									</CardHeader>
									<CardBody>
										{/* {detailToken.parent_token != null ? (
											<p className='text-muted small mb-3 lh-base'>
												Immediate parent reference:{' '}
												<span className='fw-semibold text-body'>
													record #{detailToken.parent_token}
												</span>
												{' '}
												<span className='text-muted'>
													— matches the highlighted row when present.
												</span>
											</p>
										) : (
											<p className='text-muted small mb-3 lh-base'>
												Parent tokens linked to this token from the API.
											</p>
										)} */}
										<div className='table-responsive rounded border'>
											<table className='table table-sm table-striped mb-0 align-middle'>
												<thead className='table-light'>
													<tr>
														<th scope='col' className='small text-muted fw-semibold'>
															Token
														</th>
														<th scope='col' className='small text-muted fw-semibold'>
															Status
														</th>
														<th scope='col' className='small text-muted fw-semibold'>
															Created at
														</th>
													</tr>
												</thead>
												<tbody>
													{detailToken.parent_tokens?.map((p) => {
														const display = parentSummaryDisplayToken(p);
														const isDirectParent =
															detailToken.parent_token != null &&
															p.id === detailToken.parent_token;
														return (
															<tr
																key={p.id}
																className={isDirectParent ? 'table-info' : undefined}>
																<td className='fw-semibold'>
																	<span className='me-2'>#{display}</span>
																	{isDirectParent ? (
																		<Badge color='info' isLight className='rounded-pill'>
																			Parent
																		</Badge>
																	) : null}
																</td>
																<td>
																	<Badge
																		color={statusBadgeColor(String(p.status))}
																		isLight>
																		{p.status}
																	</Badge>
																</td>
																<td className='text-nowrap'>
																	{formatDate(p.created_at)}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									</CardBody>
								</Card>
							</div>

							<div
								id='token-modal-panel-serving'
								role='tabpanel'
								aria-labelledby='token-modal-tab-serving'
								hidden={detailModalTab !== 'serving'}
								className={detailModalTab === 'serving' ? undefined : 'd-none'}>
								<Card shadow='sm' className='mb-0'>
									<CardHeader>
										<CardLabel icon='Timeline' iconColor='info'>
											<CardTitle
												tag='h6'
												className='h6 mb-0 d-flex align-items-center gap-2 flex-wrap'>
												Serving history
												{servingHistoryCount > 0 ? (
													<span className='badge bg-info bg-opacity-25 text-info rounded-pill'>
														{servingHistoryCount}
													</span>
												) : null}
											</CardTitle>
										</CardLabel>
									</CardHeader>
									<CardBody>
										{servingHistorySubtitle ? (
											<p className='text-muted small mb-3 lh-base fw-medium'>
												{/* {servingHistorySubtitle} */}
											</p>
										) : null}
										<EventFeed
											events={servingHistoryQueueEvents}
											loading={false}
											emptyText='No serving history yet.'
											emptyHelpText='Visits to counters will appear here once recorded.'
										/>
									</CardBody>
								</Card>
							</div>
						</div>
					)}
				</ModalBody>
				<ModalFooter>
					<Button
						color='secondary'
						isOutline
						onClick={closeDetailModal}
						isDisable={detailLoading}>
						Close
					</Button>
				</ModalFooter>
			</Modal>

			<Modal
				isCentered
				isOpen={editUserOpen}
				setIsOpen={(open) => {
					if (!open) closeEditUserModal();
				}}
				size='lg'
				titleId='token-user-edit-modal-title'>
				<ModalHeader setIsOpen={closeEditUserModal}>
					<ModalTitle id='token-user-edit-modal-title'>Edit token user</ModalTitle>
				</ModalHeader>
				<ModalBody>
					<form
						className='d-grid gap-3'
						onSubmit={(e) => {
							e.preventDefault();
							void handleSaveTokenUser();
						}}>
						<div>
							<label htmlFor='token-user-edit-name' className='form-label small'>
								Name <span className='text-danger'>*</span>
							</label>
							<input
								id='token-user-edit-name'
								type='text'
								className='form-control'
								value={editDraft.name}
								onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
								autoComplete='name'
								required
							/>
						</div>
						<div>
							<label htmlFor='token-user-edit-email' className='form-label small'>
								Email
							</label>
							<input
								id='token-user-edit-email'
								type='email'
								className='form-control'
								value={editDraft.email}
								onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
								autoComplete='email'
							/>
						</div>
						<div>
							<label htmlFor='token-user-edit-phone' className='form-label small'>
								Phone
							</label>
							<input
								id='token-user-edit-phone'
								type='tel'
								className='form-control'
								value={editDraft.phone}
								onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
								autoComplete='tel'
							/>
						</div>
						<div className='row g-3'>
							<div className='col-12 col-sm-6'>
								<label htmlFor='token-user-edit-age' className='form-label small'>
									Age
								</label>
								<input
									id='token-user-edit-age'
									type='text'
									inputMode='numeric'
									className='form-control'
									value={editDraft.age}
									onChange={(e) => setEditDraft((d) => ({ ...d, age: e.target.value }))}
								/>
							</div>
							<div className='col-12 col-sm-6'>
								<label htmlFor='token-user-edit-place' className='form-label small'>
									Place
								</label>
								<input
									id='token-user-edit-place'
									type='text'
									className='form-control'
									value={editDraft.place}
									onChange={(e) => setEditDraft((d) => ({ ...d, place: e.target.value }))}
								/>
							</div>
						</div>
						<div>
							<label htmlFor='token-user-edit-remarks' className='form-label small'>
								Remarks
							</label>
							<textarea
								id='token-user-edit-remarks'
								className='form-control'
								rows={3}
								value={editDraft.remarks}
								onChange={(e) => setEditDraft((d) => ({ ...d, remarks: e.target.value }))}
							/>
						</div>
					</form>
				</ModalBody>
				<ModalFooter>
					<Button
						color='secondary'
						isOutline
						onClick={closeEditUserModal}
						isDisable={savingUser}>
						Cancel
					</Button>
					<Button
						color='primary'
						onClick={() => void handleSaveTokenUser()}
						isDisable={savingUser}>
						{savingUser ? 'Saving…' : 'Save'}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default TokenUserDetailWorkspace;

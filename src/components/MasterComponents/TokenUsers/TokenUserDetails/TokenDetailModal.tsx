import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../bootstrap/Card';
import Nav, { NavItem } from '../../../bootstrap/Nav';
import Badge from '../../../bootstrap/Badge';
import Button from '../../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../../bootstrap/Modal';
import Spinner from '../../../bootstrap/Spinner';
import Icon from '../../../icon/Icon';
import useToasterNotification from '../../../../hooks/useToasterNotification';
import {
	type Token,
	// type TokenParentSummary, // Parent tokens tab — restore with tab below
	type TokenServingHistory,
	tokensApi,
} from '../../../../services/queueManagementApi';
import { formatDate, statusBadgeColor } from '../../QueueManagement/queueManagementUtils';
import TokenServingHistoryTimeline from './TokenServingHistoryTimeline';

type FieldCardAccent = 'primary' | 'info' | 'success' | 'warning' | 'secondary' | 'danger';

const FIELD_CARD_ACCENT: Record<
	FieldCardAccent,
	{ card: string; iconBg: string; iconColor: FieldCardAccent }
> = {
	primary: {
		card: 'schedule-detail-hover-card--primary',
		iconBg: 'rgba(34, 73, 158, 0.14)',
		iconColor: 'primary',
	},
	info: {
		card: 'schedule-detail-hover-card--info',
		iconBg: 'rgba(54, 153, 255, 0.14)',
		iconColor: 'info',
	},
	success: {
		card: 'schedule-detail-hover-card--success',
		iconBg: 'rgba(27, 197, 189, 0.16)',
		iconColor: 'success',
	},
	warning: {
		card: 'schedule-detail-hover-card--warning',
		iconBg: 'rgba(255, 168, 0, 0.16)',
		iconColor: 'warning',
	},
	secondary: {
		card: 'schedule-detail-hover-card--secondary',
		iconBg: 'rgba(125, 138, 156, 0.14)',
		iconColor: 'secondary',
	},
	danger: {
		card: 'schedule-detail-hover-card--danger',
		iconBg: 'rgba(246, 78, 96, 0.16)',
		iconColor: 'danger',
	},
};

const TokenDetailFieldCard: React.FC<{
	label: string;
	icon: string;
	accent?: FieldCardAccent;
	index?: number;
	/** half = 2-up, third = 3-up, full = full width */
	span?: 'half' | 'third' | 'full';
	children: React.ReactNode;
}> = ({ label, icon, accent = 'primary', index = 0, span = 'half', children }) => {
	const reduceMotion = useReducedMotion();
	const meta = FIELD_CARD_ACCENT[accent];
	const colClass =
		span === 'full' ? 'col-12' : span === 'third' ? 'col-12 col-md-4' : 'col-md-6';

	return (
		<motion.div
			className={colClass}
			initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{
				type: 'spring',
				stiffness: 420,
				damping: 30,
				delay: reduceMotion ? 0 : Math.min(index, 10) * 0.035,
			}}>
			<div
				className={`schedule-detail-hover-card ${meta.card} p-3 h-100 d-flex align-items-start gap-3`}>
				<span
					className='d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
					style={{ width: 34, height: 34, backgroundColor: meta.iconBg }}>
					<Icon icon={icon} color={meta.iconColor} />
				</span>
				<div className='min-w-0 flex-grow-1'>
					<div className='text-muted small mb-1'>{label}</div>
					<div className='fw-semibold text-break' style={{ whiteSpace: 'pre-wrap' }}>
						{children}
					</div>
				</div>
			</div>
		</motion.div>
	);
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

// Parent tokens tab — restore with tab below
// const parentSummaryDisplayToken = (p: TokenParentSummary): string => {
// 	if (p.token_display != null && String(p.token_display).trim() !== '')
// 		return String(p.token_display).trim();
// 	if (p.token_number != null && String(p.token_number).trim() !== '')
// 		return String(p.token_number).trim();
// 	return '—';
// };

const tokenServingHistoryRows = (token: Token): TokenServingHistory[] => {
	const rows = token.complete_serving_history ?? token.serving_history;
	return rows?.length ? rows : [];
};

export interface TokenDetailModalProps {
	tokenId: number | null;
	setTokenId: (id: number | null) => void;
	tokens: Token[];
}

const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ tokenId, setTokenId, tokens }) => {
	const [detailToken, setDetailToken] = useState<Token | null>(null);
	const [loading, setLoading] = useState(false);
	// 'parents' kept in type for when Parent tokens tab is restored
	const [activeTab, setActiveTab] = useState<'details' | 'parents' | 'serving'>('details');
	const [detailsSubTab, setDetailsSubTab] = useState<'token' | 'user'>('token');
	const { showErrorNotification } = useToasterNotification();
	const errorNotifierRef = useRef(showErrorNotification);

	useEffect(() => {
		errorNotifierRef.current = showErrorNotification;
	}, [showErrorNotification]);

	const closeModal = useCallback(() => {
		setTokenId(null);
	}, [setTokenId]);

	useEffect(() => {
		if (tokenId == null) {
			setDetailToken(null);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setDetailToken(null);
		void tokensApi
			.get(tokenId)
			.then((t) => {
				if (!cancelled) {
					setDetailToken(t);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					errorNotifierRef.current(err);
					setLoading(false);
					setTokenId(null);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [tokenId, setTokenId]);

	useEffect(() => {
		setActiveTab('details');
		setDetailsSubTab('token');
	}, [tokenId]);

	useEffect(() => {
		if (detailsSubTab === 'user' && !detailToken?.token_user) {
			setDetailsSubTab('token');
		}
	}, [detailToken, detailsSubTab]);

	useEffect(() => {
		if (tokenId == null) return;
		const fromList = tokens.find((t) => t.id === tokenId);
		if (!fromList) return;
		setDetailToken((prev) => {
			if (!prev || prev.id !== tokenId) return prev;
			return { ...prev, ...fromList };
		});
	}, [tokens, tokenId]);

	// Parent tokens tab — restore with tab below
	// useEffect(() => {
	// 	if (
	// 		detailToken &&
	// 		activeTab === 'parents' &&
	// 		!(detailToken.parent_tokens && detailToken.parent_tokens.length > 0)
	// 	) {
	// 		setActiveTab('details');
	// 	}
	// }, [detailToken, activeTab]);

	const modalTitle = useMemo(() => {
		if (detailToken?.token_number != null && detailToken.token_number !== '') {
			return `Token #${detailToken.token_number}`;
		}
		if (tokenId == null) return 'Token details';
		const row = tokens.find((t) => t.id === tokenId);
		if (row?.token_number) return `Token #${row.token_number}`;
		return `Token #${tokenId}`;
	}, [detailToken, tokenId, tokens]);

	const servingHistoryRows = useMemo(
		() => (detailToken ? tokenServingHistoryRows(detailToken) : []),
		[detailToken],
	);
	const servingHistoryCount = servingHistoryRows.length;
	const servingHistoryQueueName = useMemo(() => {
		if (!detailToken) return null;
		const name = tokenQueueName(detailToken);
		return name === '—' ? null : name;
	}, [detailToken]);
	const servingHistoryScheduleLabel = useMemo(() => {
		if (detailToken?.schedule == null) return null;
		return `Schedule #${detailToken.schedule}`;
	}, [detailToken]);
	// Parent tokens tab — restore with tab below
	// const parentTokensCount = detailToken?.parent_tokens?.length ?? 0;

	return (
		<Modal
			isCentered
			isAnimation={false}
			isOpen={tokenId != null}
			setIsOpen={(open) => {
				if (!open) closeModal();
			}}
			size='lg'
			titleId='token-detail-modal-title'>
			<ModalHeader setIsOpen={closeModal}>
				<ModalTitle id='token-detail-modal-title'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon='ConfirmationNumber' color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>{modalTitle}</div>
							<div className='text-muted small fw-normal mt-1'>
								Token and customer details
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<ModalBody
				className='overflow-auto'
				style={{ maxHeight: 'min(85vh, calc(100dvh - 10rem))' }}>
				{loading && (
					<div className='d-flex flex-column align-items-center justify-content-center gap-2 py-5 text-muted'>
						<Spinner color='primary' />
						<span>Loading token…</span>
					</div>
				)}
				{!loading && detailToken && (
					<div>
						<Nav design='pills' isFill className='mb-3 gap-2' role='tablist'>
							<NavItem isActive={activeTab === 'details'}>
								<button
									type='button'
									className='w-100 text-center'
									id='token-modal-tab-details'
									role='tab'
									aria-selected={activeTab === 'details'}
									aria-controls='token-modal-panel-details'
									onClick={() => setActiveTab('details')}>
									Details
								</button>
							</NavItem>
							{/* Parent tokens tab — hidden for now; uncomment to restore
							{parentTokensCount > 0 ? (
								<NavItem isActive={activeTab === 'parents'}>
									<button
										type='button'
										className='w-100 d-inline-flex align-items-center justify-content-center gap-2'
										id='token-modal-tab-parents'
										role='tab'
										aria-selected={activeTab === 'parents'}
										aria-controls='token-modal-panel-parents'
										onClick={() => setActiveTab('parents')}>
										<span>Parent tokens</span>
										<span className='badge bg-warning bg-opacity-25 text-warning rounded-pill'>
											{parentTokensCount}
										</span>
									</button>
								</NavItem>
							) : null}
							*/}
							<NavItem isActive={activeTab === 'serving'}>
								<button
									type='button'
									className='w-100 d-inline-flex align-items-center justify-content-center gap-2'
									id='token-modal-tab-serving'
									role='tab'
									aria-selected={activeTab === 'serving'}
									aria-controls='token-modal-panel-serving'
									onClick={() => setActiveTab('serving')}>
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
							hidden={activeTab !== 'details'}
							className={activeTab === 'details' ? undefined : 'd-none'}>
							{detailToken.token_user ? (
								<div className='row mb-3'>
									<div className='col-12 col-md-6'>
										<div
											className='d-flex w-100 gap-2 p-1 rounded-3 border border-secondary border-opacity-25 bg-body-secondary'
											role='tablist'
											aria-label='Details sections'>
											<button
												type='button'
												role='tab'
												id='token-modal-subtab-token'
												aria-selected={detailsSubTab === 'token'}
												aria-controls='token-modal-subpanel-token'
												className={[
													'btn btn-sm flex-fill d-inline-flex align-items-center justify-content-center gap-2',
													detailsSubTab === 'token' ? 'btn-primary' : 'btn-light text-body',
												].join(' ')}
												onClick={() => setDetailsSubTab('token')}>
												<Icon icon='ConfirmationNumber' size='sm' />
												Token details
											</button>
											<button
												type='button'
												role='tab'
												id='token-modal-subtab-user'
												aria-selected={detailsSubTab === 'user'}
												aria-controls='token-modal-subpanel-user'
												className={[
													'btn btn-sm flex-fill d-inline-flex align-items-center justify-content-center gap-2',
													detailsSubTab === 'user' ? 'btn-primary' : 'btn-light text-body',
												].join(' ')}
												onClick={() => setDetailsSubTab('user')}>
												<Icon icon='Person' size='sm' />
												Token user
											</button>
										</div>
									</div>
								</div>
							) : null}

							<div
								id='token-modal-subpanel-token'
								role='tabpanel'
								aria-labelledby='token-modal-subtab-token'
								hidden={detailsSubTab !== 'token'}
								className={detailsSubTab === 'token' ? undefined : 'd-none'}>
								<div className='row g-3 schedule-detail-hover-grid'>
									<TokenDetailFieldCard label='Queue' icon='Queue' accent='info' index={0}>
										{tokenQueueName(detailToken)}
									</TokenDetailFieldCard>
									<TokenDetailFieldCard
										label='Schedule'
										icon='Event'
										accent='primary'
										index={1}>
										{detailToken.schedule != null ? `${detailToken.schedule}` : '—'}
									</TokenDetailFieldCard>
									<TokenDetailFieldCard
										label='Status'
										icon='Flag'
										accent='warning'
										index={2}
										span='third'>
										<Badge color={statusBadgeColor(detailToken.status)} isLight>
											{detailToken.status}
										</Badge>
									</TokenDetailFieldCard>
									<TokenDetailFieldCard
										label='Completed'
										icon='TaskAlt'
										accent='success'
										index={3}
										span='third'>
										{formatDate(detailToken.completed_at)}
									</TokenDetailFieldCard>
									<TokenDetailFieldCard
										label='Cancelled'
										icon='Cancel'
										accent='danger'
										index={4}
										span='third'>
										{formatDate(detailToken.cancelled_at)}
									</TokenDetailFieldCard>
									<TokenDetailFieldCard
										label='Wait time'
										icon='HourglassEmpty'
										accent='secondary'
										index={5}>
										{displayOrDash(detailToken.wait_time)}
									</TokenDetailFieldCard>
									<TokenDetailFieldCard
										label='Service time'
										icon='Timer'
										accent='info'
										index={6}>
										{displayOrDash(detailToken.service_time)}
									</TokenDetailFieldCard>
									{detailToken.parent_token != null && (
										<TokenDetailFieldCard
											label='Parent token'
											icon='AccountTree'
											accent='warning'
											index={7}>
											{formatParentTokenField(detailToken)}
										</TokenDetailFieldCard>
									)}
									<TokenDetailFieldCard
										label='Notes'
										icon='Notes'
										accent='secondary'
										index={8}
										span='full'>
										{detailToken.notes != null && detailToken.notes !== ''
											? detailToken.notes
											: '—'}
									</TokenDetailFieldCard>
								</div>
							</div>

							{detailToken.token_user && (
								<div
									id='token-modal-subpanel-user'
									role='tabpanel'
									aria-labelledby='token-modal-subtab-user'
									hidden={detailsSubTab !== 'user'}
									className={detailsSubTab === 'user' ? undefined : 'd-none'}>
									<div className='row g-3 schedule-detail-hover-grid'>
										<TokenDetailFieldCard
											label='Name'
											icon='Person'
											accent='primary'
											index={0}>
											{displayOrDash(detailToken.token_user.name)}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='Email'
											icon='Email'
											accent='info'
											index={1}>
											{displayOrDash(detailToken.token_user.email)}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='Phone'
											icon='Phone'
											accent='primary'
											index={2}
											span='third'>
											{displayOrDash(detailToken.token_user.phone)}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='Age'
											icon='Cake'
											accent='warning'
											index={3}
											span='third'>
											{detailToken.token_user.age != null &&
											detailToken.token_user.age !== ''
												? String(detailToken.token_user.age)
												: '—'}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='Place'
											icon='Place'
											accent='success'
											index={4}
											span='third'>
											{displayOrDash(detailToken.token_user.place)}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='Remarks'
											icon='Notes'
											accent='info'
											index={5}
											span='full'>
											{detailToken.token_user.remarks != null &&
											detailToken.token_user.remarks !== ''
												? detailToken.token_user.remarks
												: '—'}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='User created at'
											icon='EventAvailable'
											accent='secondary'
											index={6}>
											{formatDate(detailToken.token_user.created_at)}
										</TokenDetailFieldCard>
										<TokenDetailFieldCard
											label='User updated at'
											icon='Update'
											accent='secondary'
											index={7}>
											{formatDate(detailToken.token_user.updated_at)}
										</TokenDetailFieldCard>
									</div>
								</div>
							)}
						</div>

						{/* Parent tokens panel — hidden for now; uncomment to restore
						<div
							id='token-modal-panel-parents'
							role='tabpanel'
							aria-labelledby='token-modal-tab-parents'
							hidden={activeTab !== 'parents'}
							className={activeTab === 'parents' ? undefined : 'd-none'}>
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
																<Badge color={statusBadgeColor(String(p.status))} isLight>
																	{p.status}
																</Badge>
															</td>
															<td className='text-nowrap'>{formatDate(p.created_at)}</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</CardBody>
							</Card>
						</div>
						*/}

						<div
							id='token-modal-panel-serving'
							role='tabpanel'
							aria-labelledby='token-modal-tab-serving'
							hidden={activeTab !== 'serving'}
							className={activeTab === 'serving' ? undefined : 'd-none'}>
							<div className='rounded-4 border border-secondary border-opacity-25 overflow-hidden bg-body'>
								<div className='d-flex align-items-center justify-content-between gap-2 flex-wrap px-3 py-3 border-bottom border-secondary border-opacity-25 bg-body-secondary'>
									<div className='d-flex align-items-center gap-2'>
										<span
											className='d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0'
											style={{
												width: 36,
												height: 36,
												backgroundColor:
													'color-mix(in srgb, var(--bs-primary) 12%, #ffffff)',
											}}>
											<Icon icon='Timeline' color='primary' size='sm' />
										</span>
										<span className='fw-semibold'>Serving history</span>
										{servingHistoryCount > 0 ? (
											<span className='badge bg-info bg-opacity-25 text-info rounded-pill'>
												{servingHistoryCount}
											</span>
										) : null}
									</div>
								</div>
								<div className='p-3'>
									<TokenServingHistoryTimeline
										history={servingHistoryRows}
										queueName={servingHistoryQueueName}
										scheduleLabel={servingHistoryScheduleLabel}
										emptyText='No serving history yet.'
										emptyHelpText='Visits to counters will appear here once recorded.'
									/>
								</div>
							</div>
						</div>
					</div>
				)}
			</ModalBody>
			<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
				<Button color='secondary' isLight onClick={closeModal} isDisable={loading}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default TokenDetailModal;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardBody } from '../../bootstrap/Card';
import Badge from '../../bootstrap/Badge';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import ServingPointModal from '../../PageComponents/ServingPoints/ServingPointModal';
import ServingPointStatusModal from '../../PageComponents/ServingPoints/ServingPointStatusModal';
import StatusBadge from '../../BadgeWithIcon.jsx';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	type ScheduleServingPoint,
	type ServingPoint,
	eventsApi,
	queuesApi,
	scheduleServingPointsApi,
} from '../../../services/queueManagementApi';
import {
	formatDate,
	getNextAllowedServingPointStatuses,
	servingPointQueueIds,
} from '../QueueManagement/queueManagementUtils';
import QueueEventsTimelineCard from '../QueueManagement/QueueEventsTimelineCard';
import ServingPointWindowsCalendar from './ServingPointWindowsCalendar';
import ServingPointCurrentServingCard from './ServingPointCurrentServingCard';
import usePermissions from '../../../hooks/usePermissions';

type FieldCardAccent = 'primary' | 'info' | 'success' | 'warning' | 'secondary';

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
};

const SpDetailFieldCard: React.FC<{
	label: string;
	icon: string;
	accent?: FieldCardAccent;
	index?: number;
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
				delay: reduceMotion ? 0 : Math.min(index, 8) * 0.04,
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
					<div className='fw-semibold text-break'>{children}</div>
				</div>
			</div>
		</motion.div>
	);
};

type ServingPointDetailWorkspaceProps = {
	onServingPointNameChange?: (name: string | null) => void;
};

const ServingPointDetailWorkspace: React.FC<ServingPointDetailWorkspaceProps> = ({
	onServingPointNameChange,
}) => {
	const { servingPointId } = useParams<{ servingPointId: string }>();
	const navigate = useNavigate();
	const id = Number(servingPointId);

	const [loading, setLoading] = useState(true);
	const [servingPoint, setServingPoint] = useState<ServingPoint | null>(null);
	const [windows, setWindows] = useState<ScheduleServingPoint[]>([]);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [tokenCardRefreshKey, setTokenCardRefreshKey] = useState(0);
	const { can } = usePermissions();
	const canWrite = can('serving_point_write');
	const canReadSchedules = can('schedules_read');

	const { showErrorNotification } = useToasterNotification();
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
			const pointRes = await queuesApi.getServingPoint(id);
			setServingPoint(pointRes);

			const windowsRes = await scheduleServingPointsApi.list({
				serving_point: id,
			});
			setWindows(windowsRes.results ?? []);
		} catch (err) {
			errorNotifierRef.current(err);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!onServingPointNameChange) return;
		onServingPointNameChange(servingPoint?.name ?? null);
	}, [onServingPointNameChange, servingPoint?.name]);

	const handleWindowClick = useCallback(
		(row: ScheduleServingPoint) => {
			if (!row?.id) return;
			navigate(`/serving-points/${id}/windows/${row.id}`, {
				state: {
					from: 'serving-point',
					servingPointPath: `/serving-points/${id}`,
					servingPointName: servingPoint?.name,
				},
			});
		},
		[id, navigate, servingPoint?.name],
	);

	const queueLabel = useMemo(() => {
		const named = (servingPoint as (ServingPoint & { queue_name?: string }) | null)?.queue_name;
		if (named) return named;
		const ids = servingPoint ? servingPointQueueIds(servingPoint) : [];
		return ids.length ? ids.map((qid) => `Queue #${qid}`).join(', ') : '—';
	}, [servingPoint]);

	const assignedUsersLabel = useMemo(() => {
		const users = (
			servingPoint as
				| (ServingPoint & {
						assigned_user?: Array<{ username?: string; id?: number } | string>;
				  })
				| null
		)?.assigned_user;
		if (!users || users.length === 0) return '—';
		return users
			.map((u) =>
				typeof u === 'string' ? u : u.username || (u.id != null ? `User #${u.id}` : 'User'),
			)
			.join(', ');
	}, [servingPoint]);

	if (!id || Number.isNaN(id)) {
		return <div className='alert alert-warning'>Invalid serving point.</div>;
	}

	return (
		<div className='d-grid gap-4'>
			<Card className='border-0 shadow-sm rounded-4 overflow-visible'>
				<CardBody className='p-0'>
					<div className='p-4'>
						<div className='d-flex align-items-start justify-content-between gap-3 flex-wrap mb-1'>
							<div className='d-flex align-items-start gap-3 min-w-0'>
								<div
									className='d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0'
									style={{
										width: 48,
										height: 48,
										backgroundColor: 'color-mix(in srgb, var(--bs-primary) 12%, #ffffff)',
									}}>
									<Icon icon='Monitor' color='primary' />
								</div>
								<div className='min-w-0'>
									<div className='text-muted small text-uppercase fw-semibold mb-1'>
										Serving point
									</div>
									<h4 className='fw-bold mb-2 lh-sm'>
										{servingPoint?.name || `Serving point #${id}`}
									</h4>
									<div className='d-inline-flex align-items-start gap-2 text-muted small px-3 py-2 rounded-3 border border-secondary border-opacity-25 bg-body-secondary'>
										<Icon icon='Notes' size='sm' color='primary' className='flex-shrink-0 mt-1' />
										<span>
											{servingPoint?.description?.trim() || 'No description provided.'}
										</span>
									</div>
								</div>
							</div>
							<div className='d-flex flex-wrap gap-2 align-items-center'>
								{canWrite &&
									servingPoint &&
									getNextAllowedServingPointStatuses(servingPoint.status).length > 0 && (
										<Button
											color='primary'
											isLight
											icon='TrackChanges'
											onClick={() => setShowStatusModal(true)}>
											Change status
										</Button>
									)}
								{canWrite && servingPoint && (
									<Button
										color='primary'
										isLight
										icon='Edit'
										onClick={() => setShowEditModal(true)}>
										Edit
									</Button>
								)}
								<Button
									color='dark'
									isLight
									icon='ArrowBack'
									onClick={() => navigate('/serving-points')}>
									Back to list
								</Button>
							</div>
						</div>

						<div className='row g-3 schedule-detail-hover-grid mt-3'>
							<SpDetailFieldCard label='Queue' icon='Queue' accent='info' index={0}>
								{queueLabel}
							</SpDetailFieldCard>
							<SpDetailFieldCard
								label='Assigned users'
								icon='Group'
								accent='primary'
								index={1}>
								{assignedUsersLabel}
							</SpDetailFieldCard>
							<SpDetailFieldCard
								label='Counter status'
								icon='TrackChanges'
								accent='success'
								index={2}
								span='third'>
								<StatusBadge
									status={servingPoint?.status}
									isAvailable={servingPoint?.is_available}
								/>
							</SpDetailFieldCard>
							<SpDetailFieldCard
								label='Listing'
								icon='CheckCircle'
								accent='success'
								index={3}
								span='third'>
								<Badge color={servingPoint?.is_active ? 'success' : 'secondary'} isLight>
									{servingPoint?.is_active ? 'Active' : 'Inactive'}
								</Badge>
							</SpDetailFieldCard>
							<SpDetailFieldCard
								label='Windows'
								icon='CalendarMonth'
								accent='warning'
								index={4}
								span='third'>
								{windows.length}
							</SpDetailFieldCard>
							<SpDetailFieldCard
								label='Created'
								icon='EventAvailable'
								accent='secondary'
								index={5}>
								{formatDate(servingPoint?.created_at)}
							</SpDetailFieldCard>
							<SpDetailFieldCard
								label='Updated'
								icon='Update'
								accent='secondary'
								index={6}>
								{formatDate(
									(servingPoint as (ServingPoint & { updated_at?: string }) | null)
										?.updated_at,
								)}
							</SpDetailFieldCard>
						</div>
					</div>
				</CardBody>
			</Card>

			<ServingPointCurrentServingCard
				servingPointId={id}
				refreshKey={tokenCardRefreshKey}
				onServingPointUpdated={(updated) => setServingPoint(updated)}
			/>

			{loading ? (
				<div className='text-center text-muted py-5'>Loading serving windows…</div>
			) : (
				<ServingPointWindowsCalendar
					servingPointName={servingPoint?.name}
					windows={windows}
					onWindowClick={handleWindowClick}
				/>
			)}

			{canReadSchedules && (
				<QueueEventsTimelineCard
					queryId={id}
					loadEvents={(spId, date) => eventsApi.byServingPoint(spId, date)}
					captionOverride={servingPoint?.name ?? null}
					getCaptionFromEvents={(ev) =>
						(ev[0]?.serving_point_name && String(ev[0].serving_point_name).trim()) || null
					}
					subtitleFallback='Timeline of queue and schedule activity for this serving point.'
					emptyText='No events found for this serving point'
					emptyHelpText='Status changes, tokens, and other activity involving this counter will show up here.'
				/>
			)}

			<ServingPointModal
				isOpen={showEditModal}
				setIsOpen={setShowEditModal}
				mode='edit'
				servingPoint={servingPoint}
				onSuccess={(updated) => {
					setServingPoint(updated);
					setTokenCardRefreshKey((k) => k + 1);
				}}
			/>

			<ServingPointStatusModal
				isOpen={showStatusModal}
				setIsOpen={setShowStatusModal}
				servingPoint={servingPoint}
				onSuccess={(updated) => {
					setServingPoint(updated);
					setTokenCardRefreshKey((k) => k + 1);
				}}
			/>
		</div>
	);
};

export default ServingPointDetailWorkspace;

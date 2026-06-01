import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, dayjsLocalizer, Views, type View as TView } from 'react-big-calendar';
import Card, { CardActions, CardBody, CardHeader, CardTitle } from '../../../bootstrap/Card';
import Button from '../../../bootstrap/Button';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../../bootstrap/Dropdown';
import { CalendarTodayButton, getLabel, getUnitType } from '../../../extras/calendarHelper';
import Icon from '../../../icon/Icon';
import Tooltips from '../../../bootstrap/Tooltips';
import type { QueueSchedule } from '../../../../services/queueManagementApi';
import { schedulesApi } from '../../../../services/queueManagementApi';
import ScheduleFormModal, {
	isScheduleMetadataEditable,
	toDateTimeLocalValue,
} from '../../../PageComponents/Schedules/ScheduleFormModal';
import usePermissions from '../../../../hooks/usePermissions';

const localizer = dayjsLocalizer(dayjs);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueueScheduleEvent {
	id: number | string;
	title?: string;
	start: Date;
	end: Date;
	description?: string;
	token_limit?: number;
	queue_id?: number;
	status?: 'scheduled' | 'running' | 'onhold' | 'completed' | 'canceled';
	token_counts?: {
		active?: number;
		waiting?: number;
		completed?: number;
		total?: number;
	};
}

interface ScheduleCalendarProps {
	/** Label shown in the card header alongside the icon */
	queueName?: string;
	/** Queue id used to fetch schedules and create new ones via the API */
	queueId: number;
	/** Called after a schedule is successfully created/updated via the API */
	onScheduleCreated?: () => void | Promise<void>;
	/** Called when the user clicks an existing schedule event */
	onEventClick?: (event: QueueScheduleEvent) => void;
	/** Called when the user selects an empty slot (month or day view) */
	onSlotSelect?: (start: Date, end: Date) => void;
}

function hasScheduleWindow(s: QueueSchedule): s is QueueSchedule & { from_datetime: string; to_datetime: string } {
	return Boolean(s.from_datetime && s.to_datetime);
}

export function mapQueueScheduleToCalendarEvent(
	s: QueueSchedule & { from_datetime: string; to_datetime: string },
): QueueScheduleEvent {
	const statusLower = (s.status || '').toLowerCase();
	let normalized: QueueScheduleEvent['status'] = 'scheduled';
	if (statusLower === 'running') normalized = 'running';
	else if (statusLower === 'onhold' || statusLower === 'on_hold') normalized = 'onhold';
	else if (statusLower === 'completed') normalized = 'completed';
	else if (statusLower === 'canceled' || statusLower === 'cancelled') normalized = 'canceled';
	else if (statusLower === 'scheduled') normalized = 'scheduled';

	return {
		id: s.id,
		title: s.description?.trim() || s.queue_name || `Schedule ${s.id}`,
		start: new Date(s.from_datetime),
		end: new Date(s.to_datetime),
		description: s.description,
		token_limit: s.limit,
		queue_id: s.queue,
		status: normalized,
	};
}

// ---------------------------------------------------------------------------
// Status badge colours
// ---------------------------------------------------------------------------

const STATUS_COLOURS: Record<string, string> = {
	scheduled: 'var(--bs-primary)',
	running: 'var(--bs-success)',
	onhold: 'var(--bs-warning)',
	completed: 'var(--bs-info)',
	canceled: 'var(--bs-danger)',
};

function toLocalDate(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** True when the calendar day of `d` is strictly before today (local). */
function isPastCalendarDay(d: Date) {
	return dayjs(d).startOf('day').isBefore(dayjs().startOf('day'));
}

function isWithinDayRange(eventStart: Date, eventEnd: Date, selectedDate: Date) {
	const dayStart = dayjs(selectedDate).startOf('day');
	const dayEnd = dayjs(selectedDate).endOf('day');
	const start = dayjs(eventStart);
	const end = dayjs(eventEnd);
	return start.isBefore(dayEnd) && end.isAfter(dayStart);
}

function formatTimeRange(start: Date, end: Date) {
	return `${dayjs(start).format('hh:mm A')} - ${dayjs(end).format('hh:mm A')}`;
}

function formatDateTimeRange(start: Date, end: Date) {
	return `${dayjs(start).format('DD MMM YYYY, hh:mm A')} - ${dayjs(end).format('DD MMM YYYY, hh:mm A')}`;
}

function getScheduleName(event: QueueScheduleEvent) {
	return event.title?.trim() || event.description?.trim() || 'Schedule';
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
	queueName,
	queueId,
	onScheduleCreated,
	onEventClick,
	onSlotSelect,
}) => {
	const { can } = usePermissions();
	const canWrite = can('schedules_write');
	const canReadSchedule = can('schedules_read');

	const [viewMode, setViewMode] = useState<TView>(Views.MONTH);
	const [date, setDate] = useState<Date>(() => toLocalDate(new Date()));
	const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
	const [scheduleModalMode, setScheduleModalMode] = useState<'create' | 'edit'>('create');
	const [editingScheduleRecord, setEditingScheduleRecord] = useState<QueueSchedule | null>(null);
	const [createInitialStart, setCreateInitialStart] = useState<string | undefined>();
	const [createInitialEnd, setCreateInitialEnd] = useState<string | undefined>();

	const [scheduleRecords, setScheduleRecords] = useState<QueueSchedule[]>([]);

	const monthKey = `${dayjs(date).year()}-${String(dayjs(date).month()).padStart(2, '0')}`;

	const fetchSchedulesForMonth = useCallback(
		async (monthDate: Date) => {
			if (!canReadSchedule) {
				setScheduleRecords([]);
				return;
			}
			const start = dayjs(monthDate).startOf('month');
			const end = dayjs(monthDate).endOf('month');
			try {
				const res = await schedulesApi.list({
					queue: queueId,
					from_datetime__lte: end.toISOString(),
					to_datetime__gte: start.toISOString(),
				});
				setScheduleRecords(res.results || []);
			} catch {
				// silently ignore fetch errors for schedule calendar
			}
		},
		[canReadSchedule, queueId],
	);

	// Re-fetch when the viewed month or queue changes
	useEffect(() => {
		if (!canReadSchedule) return;
		void fetchSchedulesForMonth(date);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canReadSchedule, fetchSchedulesForMonth, monthKey]);

	const events = useMemo(
		() => (scheduleRecords || []).filter(hasScheduleWindow).map(mapQueueScheduleToCalendarEvent),
		[scheduleRecords],
	);

	const unitType = getUnitType(viewMode);
	const calendarDateLabel = getLabel(date, viewMode);

	const eventsForCalendar =
		viewMode === Views.DAY
			? events.filter((ev) => isWithinDayRange(ev.start, ev.end, date))
			: events;

	const closeScheduleModal = () => {
		setScheduleModalOpen(false);
		setEditingScheduleRecord(null);
		setCreateInitialStart(undefined);
		setCreateInitialEnd(undefined);
	};

	const openEditScheduleModal = (scheduleId: number) => {
		const rec = scheduleRecords?.find((s) => s.id === scheduleId);
		if (!rec || !isScheduleMetadataEditable(rec.status)) return;
		setScheduleModalMode('edit');
		setEditingScheduleRecord(rec);
		setCreateInitialStart(undefined);
		setCreateInitialEnd(undefined);
		setScheduleModalOpen(true);
	};

	const handleDrillDown = (targetDate: Date) => {
		setDate(toLocalDate(targetDate));
		setViewMode(Views.DAY);
	};

	const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
		if (!canWrite) return;

		const selectedStart = slotInfo.start;
		if (isPastCalendarDay(selectedStart)) {
			return;
		}
		const selectedEnd = slotInfo.end > slotInfo.start ? slotInfo.end : dayjs(slotInfo.start).add(1, 'hour').toDate();

		if (viewMode === Views.MONTH) {
			setDate(toLocalDate(selectedStart));
			setViewMode(Views.DAY);
		}

		setScheduleModalMode('create');
		setEditingScheduleRecord(null);
		setCreateInitialStart(toDateTimeLocalValue(selectedStart));
		setCreateInitialEnd(toDateTimeLocalValue(selectedEnd));
		setScheduleModalOpen(true);

		onSlotSelect?.(selectedStart, selectedEnd);
	};

	const openCreateModalForCurrentDate = () => {
		if (isPastCalendarDay(date)) {
			return;
		}
		const start = dayjs(date).hour(9).minute(0).second(0).millisecond(0).toDate();
		const end = dayjs(start).add(1, 'hour').toDate();
		setScheduleModalMode('create');
		setEditingScheduleRecord(null);
		setCreateInitialStart(toDateTimeLocalValue(start));
		setCreateInitialEnd(toDateTimeLocalValue(end));
		setScheduleModalOpen(true);
	};

	const ScheduleEventContent = ({
		event,
		title,
		actions,
	}: {
		event: QueueScheduleEvent;
		title?: string;
		actions?: React.ReactNode;
	}) => {
		const counts = event.token_counts || {};
		const tooltipCard = (
			<div className='queue-schedule-tooltip-card'>
				<div className='queue-schedule-tooltip-title'>Schedule</div>
				<div className='queue-schedule-tooltip-time'>{formatTimeRange(event.start, event.end)}</div>
				<div className='queue-schedule-tooltip-status text-capitalize'>
					Status: {event.status ?? 'unknown'}
				</div>
				<div className='queue-schedule-tooltip-stats'>
					<span>Active: {counts.active ?? 0}</span>
					<span>Waiting: {counts.waiting ?? 0}</span>
					<span>Completed: {counts.completed ?? 0}</span>
					<span>Total: {counts.total ?? 0}</span>
				</div>
			</div>
		);

		return (
			<div className='d-flex align-items-center justify-content-between gap-1 w-100 min-w-0'>
				<Tooltips title={tooltipCard} className='queue-schedule-tooltip flex-grow-1 min-w-0' placement='top'>
					<span className='queue-schedule-event-title text-truncate d-block'>
						{title || getScheduleName(event)}
					</span>
				</Tooltips>
				{actions}
			</div>
		);
	};

	if (!canReadSchedule) {
		return null;
	}

	return (
		<Card>
			<CardHeader className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
				<div className='d-flex align-items-center gap-2'>
					<Icon icon='CalendarMonth' color='primary' size='lg' />
					<CardTitle tag='h5' className='mb-0'>
						{queueName ? `${queueName} — Schedules` : 'Queue Schedules'}
					</CardTitle>
				</div>

				<div className='d-flex align-items-center gap-2 flex-wrap'>
					{/* Prev / Today / Next */}
					<CardActions>
						<CalendarTodayButton
							unitType={unitType}
							date={date}
							setDate={(d) => setDate(toLocalDate(d as Date))}
							viewMode={viewMode}
						/>
					</CardActions>

					{/* Current date label */}
					<CardActions>
						<Button color='light' size='sm'>
							{calendarDateLabel}
						</Button>
					</CardActions>

					{/* Month / Day switcher */}
					<CardActions>
						<Dropdown>
							<DropdownToggle>
								<Button
									color='primary'
									isLight
									size='sm'
									icon={
										viewMode === Views.MONTH
											? 'calendar_view_month'
											: 'calendar_view_day'
									}>
									{viewMode === Views.MONTH ? 'Month' : 'Day'}
								</Button>
							</DropdownToggle>
							<DropdownMenu isAlignmentEnd>
								<Button
									color='link'
									icon='calendar_view_month'
									isActive={viewMode === Views.MONTH}
									onClick={() => setViewMode(Views.MONTH)}>
									Month
								</Button>
								<Button
									color='link'
									icon='calendar_view_day'
									isActive={viewMode === Views.DAY}
									onClick={() => setViewMode(Views.DAY)}>
									Day
								</Button>
							</DropdownMenu>
						</Dropdown>
					</CardActions>
					{canWrite && (
						<CardActions>
							<Button
								color='primary'
								icon='Add'
								size='sm'
								isDisable={isPastCalendarDay(date)}
								title={
									isPastCalendarDay(date)
										? 'Schedules cannot be created for past dates.'
										: undefined
								}
								onClick={openCreateModalForCurrentDate}>
								Create Schedule
							</Button>
						</CardActions>
					)}
				</div>
			</CardHeader>

			<CardBody>
				{/* Legend */}
				<div className='d-flex align-items-center gap-3 mb-3 flex-wrap small text-muted'>
					<span className='d-flex align-items-center gap-1'>
						<span
							style={{
								display: 'inline-block',
								width: 10,
								height: 10,
								borderRadius: 3,
								background: STATUS_COLOURS.scheduled,
							}}
						/>
						Scheduled
					</span>
					<span className='d-flex align-items-center gap-1'>
						<span
							style={{
								display: 'inline-block',
								width: 10,
								height: 10,
								borderRadius: 3,
								background: STATUS_COLOURS.running,
							}}
						/>
						Running
					</span>
					<span className='d-flex align-items-center gap-1'>
						<span
							style={{
								display: 'inline-block',
								width: 10,
								height: 10,
								borderRadius: 3,
								background: STATUS_COLOURS.onhold,
							}}
						/>
						On Hold
					</span>
					<span className='d-flex align-items-center gap-1'>
						<span
							style={{
								display: 'inline-block',
								width: 10,
								height: 10,
								borderRadius: 3,
								background: STATUS_COLOURS.completed,
							}}
						/>
						Completed
					</span>
					<span className='d-flex align-items-center gap-1'>
						<span
							style={{
								display: 'inline-block',
								width: 10,
								height: 10,
								borderRadius: 3,
								background: STATUS_COLOURS.canceled,
							}}
						/>
						Canceled
					</span>
				</div>

				<div style={{ height: 480 }}>
					<Calendar
						selectable={canWrite}
						toolbar={false}
						localizer={localizer}
						events={eventsForCalendar}
						defaultView={Views.MONTH}
						views={['month', 'day']}
						view={viewMode}
						date={date}
						onNavigate={(nextDate) => setDate(toLocalDate(nextDate))}
						onDrillDown={handleDrillDown}
						onSelectSlot={handleSlotSelect}
						dayPropGetter={(day) =>
							isPastCalendarDay(day)
								? { className: 'queue-schedule-day-past', style: { opacity: 0.55 } }
								: {}
						}
						scrollToTime={new Date(1970, 1, 1, 8)}
						min={new Date(1970, 1, 1, 7)}
						max={new Date(1970, 1, 1, 20)}
						titleAccessor={(event) => {
							const ev = event as QueueScheduleEvent;
							// Display date + time range (avoid showing auto-generated schedule names).
							return formatDateTimeRange(ev.start, ev.end);
						}}
						tooltipAccessor={() => ''}
						components={{
							event: ({ event, title }) => {
								const ev = event as QueueScheduleEvent;
								const sid = Number(ev.id);
								const rec = scheduleRecords?.find((s) => s.id === sid);
								const showEdit =
									canWrite &&
									rec != null &&
									isScheduleMetadataEditable(rec.status);
								return (
									<ScheduleEventContent
										event={ev}
										title={String(title || '')}
										actions={
											showEdit ? (
												<button
													type='button'
													className='btn btn-link btn-sm p-0 ms-1 flex-shrink-0 text-white shadow-none border-0 lh-1'
													title='Edit schedule'
													aria-label='Edit schedule'
													onMouseDown={(e) => {
														e.preventDefault();
														e.stopPropagation();
													}}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														openEditScheduleModal(sid);
													}}>
													<Icon icon='Edit' />
												</button>
											) : undefined
										}
									/>
								);
							},
						}}
						{...(canReadSchedule && onEventClick
							? {
									onSelectEvent: (event: object) =>
										onEventClick(event as QueueScheduleEvent),
								}
							: {})}
						eventPropGetter={(event) => {
							const ev = event as QueueScheduleEvent;
							const bg = STATUS_COLOURS[ev.status ?? 'scheduled'] ?? STATUS_COLOURS['scheduled'];
							return {
								style: {
									backgroundColor: bg,
									borderColor: bg,
									color: '#fff',
									borderRadius: 6,
								},
							};
						}}
						style={{ height: '100%' }}
					/>
				</div>
			</CardBody>

			<ScheduleFormModal
				isOpen={scheduleModalOpen}
				setIsOpen={(open) => {
					if (!open) closeScheduleModal();
					else setScheduleModalOpen(true);
				}}
				mode={scheduleModalMode}
				queueId={queueId}
				scheduleId={scheduleModalMode === 'edit' ? editingScheduleRecord?.id ?? null : null}
				editingSchedule={scheduleModalMode === 'edit' ? editingScheduleRecord : null}
				initialStart={scheduleModalMode === 'create' ? createInitialStart : undefined}
				initialEnd={scheduleModalMode === 'create' ? createInitialEnd : undefined}
				onSaved={() => {
					void fetchSchedulesForMonth(date);
					void onScheduleCreated?.();
				}}
			/>
		</Card>
	);
};

export default ScheduleCalendar;

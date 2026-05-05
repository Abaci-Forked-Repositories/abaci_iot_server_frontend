import React, { FormEvent, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, dayjsLocalizer, Views, type View as TView } from 'react-big-calendar';
import Card, { CardActions, CardBody, CardHeader, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../bootstrap/Dropdown';
import { CalendarTodayButton, getLabel, getUnitType } from '../../extras/calendarHelper';
import Icon from '../../icon/Icon';
import Tooltips from '../../bootstrap/Tooltips';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Spinner from '../../bootstrap/Spinner';
import type { QueueSchedule } from '../../../services/queueManagementApi';
import { schedulesApi } from '../../../services/queueManagementApi';
import { getErrorMessage } from './queueManagementUtils';

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
		reported?: number;
		completed?: number;
		total?: number;
	};
}

interface ScheduleCalendarProps {
	/** Label shown in the card header alongside the icon */
	queueName?: string;
	/** API schedule records rendered in calendar. */
	scheduleRecords?: QueueSchedule[];
	/** Queue id for POST /api/queues/schedules/ — when set, create persists to the API */
	queueId?: number;
	/** Called after a schedule is successfully created via the API */
	onScheduleCreated?: () => void | Promise<void>;
	/** Called when the user clicks an existing schedule event */
	onEventClick?: (event: QueueScheduleEvent) => void;
	/** Called when the user selects an empty slot (month or day view) */
	onSlotSelect?: (start: Date, end: Date) => void;
}

interface CreateScheduleForm {
	description: string;
	start: string;
	end: string;
	token_from: string;
	token_to: string;
	/** Maps to API `limit` (max tokens for this schedule). */
	token_limit: string;
}

export function mapQueueScheduleToCalendarEvent(s: QueueSchedule): QueueScheduleEvent {
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

function toDateTimeLocalValue(value: Date) {
	return dayjs(value).format('YYYY-MM-DDTHH:mm');
}

function getScheduleName(event: QueueScheduleEvent) {
	return event.title?.trim() || event.description?.trim() || 'Schedule';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
	queueName,
	scheduleRecords,
	queueId,
	onScheduleCreated,
	onEventClick,
	onSlotSelect,
}) => {
	const [viewMode, setViewMode] = useState<TView>(Views.MONTH);
	const [date, setDate] = useState<Date>(() => toLocalDate(new Date()));
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [createError, setCreateError] = useState('');
	const [savingSchedule, setSavingSchedule] = useState(false);
	const [scheduleForm, setScheduleForm] = useState<CreateScheduleForm>({
		description: '',
		start: toDateTimeLocalValue(new Date()),
		end: toDateTimeLocalValue(dayjs().add(1, 'hour').toDate()),
		token_from: '1',
		token_to: '100',
		token_limit: '100',
	});

	const events = useMemo(
		() => (scheduleRecords || []).map(mapQueueScheduleToCalendarEvent),
		[scheduleRecords],
	);

	const unitType = getUnitType(viewMode);
	const calendarDateLabel = getLabel(date, viewMode);

	const eventsForCalendar =
		viewMode === Views.DAY
			? events.filter((ev) => isWithinDayRange(ev.start, ev.end, date))
			: events;

	const handleDrillDown = (targetDate: Date) => {
		setDate(toLocalDate(targetDate));
		setViewMode(Views.DAY);
	};

	const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
		const selectedStart = slotInfo.start;
		if (isPastCalendarDay(selectedStart)) {
			return;
		}
		const selectedEnd = slotInfo.end > slotInfo.start ? slotInfo.end : dayjs(slotInfo.start).add(1, 'hour').toDate();

		if (viewMode === Views.MONTH) {
			setDate(toLocalDate(selectedStart));
			setViewMode(Views.DAY);
		}

		setScheduleForm((prev) => ({
			...prev,
			start: toDateTimeLocalValue(selectedStart),
			end: toDateTimeLocalValue(selectedEnd),
		}));
		setCreateError('');
		setShowCreateModal(true);

		if (onSlotSelect) {
			onSlotSelect(selectedStart, selectedEnd);
		}
	};

	const openCreateModalForCurrentDate = () => {
		if (isPastCalendarDay(date)) {
			return;
		}
		const start = dayjs(date).hour(9).minute(0).second(0).millisecond(0).toDate();
		const end = dayjs(start).add(1, 'hour').toDate();
		setScheduleForm((prev) => ({
			...prev,
			start: toDateTimeLocalValue(start),
			end: toDateTimeLocalValue(end),
		}));
		setCreateError('');
		setShowCreateModal(true);
	};

	const handleCreateSchedule = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setCreateError('');

		const startDate = new Date(scheduleForm.start);
		const endDate = new Date(scheduleForm.end);
		if (Number.isNaN(startDate.getTime())) {
			setCreateError('Start date and time is required.');
			return;
		}
		if (Number.isNaN(endDate.getTime())) {
			setCreateError('End date and time is required.');
			return;
		}
		if (endDate <= startDate) {
			setCreateError('End date and time must be later than start date and time.');
			return;
		}
		if (startDate.getTime() < Date.now()) {
			setCreateError('Start date and time cannot be in the past.');
			return;
		}

		const tokenFromNum = scheduleForm.token_from ? Number(scheduleForm.token_from) : undefined;
		const tokenToNum = scheduleForm.token_to ? Number(scheduleForm.token_to) : undefined;
		if (tokenFromNum != null && Number.isNaN(tokenFromNum)) {
			setCreateError('Token from must be a valid number.');
			return;
		}
		if (tokenToNum != null && Number.isNaN(tokenToNum)) {
			setCreateError('Token to must be a valid number.');
			return;
		}
		if (tokenFromNum != null && tokenFromNum < 1) {
			setCreateError('Token from must be 1 or greater.');
			return;
		}
		if (tokenToNum != null && tokenToNum < 1) {
			setCreateError('Token to must be 1 or greater.');
			return;
		}
		if (tokenFromNum != null && tokenToNum != null && tokenFromNum > tokenToNum) {
			setCreateError('Token from must be less than or equal to token to.');
			return;
		}

		const tokenLimitRaw = scheduleForm.token_limit.trim();
		const tokenLimitNum = tokenLimitRaw ? Number(tokenLimitRaw) : undefined;
		if (tokenLimitRaw && Number.isNaN(tokenLimitNum!)) {
			setCreateError('Token limit must be a valid number.');
			return;
		}
		if (tokenLimitNum != null && (!Number.isInteger(tokenLimitNum) || tokenLimitNum < 1)) {
			setCreateError('Token limit must be a whole number of 1 or greater.');
			return;
		}

		if (!queueId) return;

		setSavingSchedule(true);
		try {
			await schedulesApi.create({
				queue: queueId,
				from_datetime: startDate.toISOString(),
				to_datetime: endDate.toISOString(),
				description: scheduleForm.description.trim() || undefined,
				token_from: tokenFromNum,
				token_to: tokenToNum,
				...(tokenLimitNum != null ? { limit: tokenLimitNum } : {}),
			});
			setShowCreateModal(false);
			await onScheduleCreated?.();
		} catch (err) {
			setCreateError(getErrorMessage(err));
		} finally {
			setSavingSchedule(false);
		}
	};

	const ScheduleEventContent = ({
		event,
		title,
	}: {
		event: QueueScheduleEvent;
		title?: string;
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
					<span>Reported: {counts.reported ?? 0}</span>
					<span>Completed: {counts.completed ?? 0}</span>
					<span>Total: {counts.total ?? 0}</span>
				</div>
			</div>
		);

		return (
			<Tooltips title={tooltipCard} className='queue-schedule-tooltip' placement='top'>
				<span className='queue-schedule-event-title'>{title || getScheduleName(event)}</span>
			</Tooltips>
		);
	};

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
						selectable
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
							event: ({ event, title }) => (
								<ScheduleEventContent
									event={event as QueueScheduleEvent}
									title={String(title || '')}
								/>
							),
						}}
						onSelectEvent={(event) => onEventClick?.(event as QueueScheduleEvent)}
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

			<Modal isOpen={showCreateModal} setIsOpen={setShowCreateModal} isCentered size='lg' isAnimation={false}>
				<ModalHeader setIsOpen={setShowCreateModal}>
					<ModalTitle id='create-schedule-modal'>Create Schedule</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleCreateSchedule}>
					<ModalBody>
						{createError && <div className='alert alert-danger mb-3'>{createError}</div>}
						<div className='row g-3'>
							<div className='col-md-6'>
								<label className='form-label fw-semibold' htmlFor='schedule-start'>
									Start Date & Time
								</label>
								<input
									id='schedule-start'
									type='datetime-local'
									className='form-control'
									min={toDateTimeLocalValue(new Date())}
									value={scheduleForm.start}
									onChange={(e) =>
										setScheduleForm((prev) => ({ ...prev, start: e.target.value }))
									}
									required
								/>
							</div>
							<div className='col-md-6'>
								<label className='form-label fw-semibold' htmlFor='schedule-end'>
									End Date & Time
								</label>
								<input
									id='schedule-end'
									type='datetime-local'
									className='form-control'
									value={scheduleForm.end}
									onChange={(e) =>
										setScheduleForm((prev) => ({ ...prev, end: e.target.value }))
									}
									required
								/>
							</div>
							<div className='col-md-6'>
								<label className='form-label fw-semibold' htmlFor='schedule-token-from'>
									Token from
								</label>
								<input
									id='schedule-token-from'
									type='number'
									min={1}
									className='form-control'
									value={scheduleForm.token_from}
									onChange={(e) =>
										setScheduleForm((prev) => ({ ...prev, token_from: e.target.value }))
									}
								/>
							</div>
							<div className='col-md-6'>
								<label className='form-label fw-semibold' htmlFor='schedule-token-to'>
									Token to
								</label>
								<input
									id='schedule-token-to'
									type='number'
									min={1}
									className='form-control'
									value={scheduleForm.token_to}
									onChange={(e) =>
										setScheduleForm((prev) => ({ ...prev, token_to: e.target.value }))
									}
								/>
							</div>
							<div className='col-12 col-md-6'>
								<label className='form-label fw-semibold' htmlFor='schedule-token-limit'>
									Token limit
								</label>
								<input
									id='schedule-token-limit'
									type='number'
									min={1}
									step={1}
									className='form-control'
									value={scheduleForm.token_limit}
									onChange={(e) =>
										setScheduleForm((prev) => ({ ...prev, token_limit: e.target.value }))
									}
									placeholder='Optional — maps to schedule limit'
								/>
							</div>
							<div className='col-12'>
								<label className='form-label fw-semibold' htmlFor='schedule-description'>
									Description
								</label>
								<textarea
									id='schedule-description'
									className='form-control'
									rows={3}
									value={scheduleForm.description}
									onChange={(e) =>
										setScheduleForm((prev) => ({ ...prev, description: e.target.value }))
									}
									placeholder='Optional notes for this schedule'
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color='light' isLight onClick={() => setShowCreateModal(false)}>
							Cancel
						</Button>
						<Button color='primary' type='submit' isDisable={savingSchedule}>
							{savingSchedule ? (
								<>
									<Spinner isSmall inButton />
									Saving…
								</>
							) : (
								'Create Schedule'
							)}
						</Button>
					</ModalFooter>
				</form>
			</Modal>
		</Card>
	);
};

export default ScheduleCalendar;

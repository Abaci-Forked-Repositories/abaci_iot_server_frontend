import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import Card, { CardActions, CardBody, CardHeader } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import SearchComponent from '../../SearchComponent';
import type { QueueSchedule } from '../../../services/queueManagementApi';
import { schedulesApi } from '../../../services/queueManagementApi';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { getErrorMessage } from '../QueueManagement/queueManagementUtils';
import QueueManagementSkeleton from '../../CustomComponent/Skeleton/QueueManagementSkeleton';
import ScheduleCardTile from './ScheduleCardTile';

const SchedulesListWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const [schedules, setSchedules] = useState<QueueSchedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [searchApplied, setSearchApplied] = useState('');
	const { showErrorNotification } = useToasterNotification();
	/** Hook returns new function identities each render; ref avoids an infinite fetch loop from useEffect([load]). */
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		void (async () => {
			try {
				const res = await schedulesApi.list({
					ordering: '-from_datetime',
					page_size: 200,
					search: searchApplied || undefined,
				});
				if (!cancelled) setSchedules(res.results || []);
			} catch (err) {
				if (!cancelled) {
					showErrorRef.current(getErrorMessage(err));
					setSchedules([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [searchApplied]);

	const runSearch = useCallback(() => {
		const next = search.trim();
		setSearchApplied((prev) => (prev === next ? prev : next));
	}, [search]);

	const handleOpenSchedule = useCallback((row: QueueSchedule) => {
		const qid = row.queue;
		navigate(`/queue-management/schedules/${row.id}`, {
			state:
				qid != null
					? {
							queueId: qid,
							queueName: row.queue_name,
							queueDetailPath: `/queue-management/${qid}`,
						}
					: undefined,
		});
	}, [navigate]);

	return (
		<Card stretch>
			<CardHeader>
				<div className='d-flex align-items-center gap-3'>
					<div className='media-files-title-text d-flex align-items-center gap-2'>
						<Icon icon='Event' color='primary' size='2x' />
						<span>Schedules</span>
					</div>
				</div>
				<CardActions>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<SearchComponent
							handleChange={setSearch}
							value={search}
							placeholder='Search schedules'
							className='app-search-modern me-0'
							inputClassName='app-search-modern__input'
							iconColor='primary'
							iconSize='2x'
							withDefaultMargin={false}
							onKeyDown={(ev) => {
								if (ev.key === 'Enter') runSearch();
							}}
							onBlur={runSearch}
						/>
						
					</div>
				</CardActions>
			</CardHeader>
			<CardBody>
				{loading ? (
					<QueueManagementSkeleton count={8} />
				) : (
					<div className='queue-cards-scroll'>
						<Row className='g-3 mx-0'>
							{schedules.map((sch) => (
								<Col xs={12} sm={6} lg={4} xl={3} className='px-2' key={sch.id}>
									<ScheduleCardTile schedule={sch} onSelect={handleOpenSchedule} />
								</Col>
							))}
							{!schedules.length && (
								<Col xs={12} className='text-center text-muted py-4'>
									No schedules found.
								</Col>
							)}
						</Row>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default SchedulesListWorkspace;

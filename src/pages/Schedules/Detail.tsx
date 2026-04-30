import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import ScheduleDetailWorkspace from '../../components/MasterComponents/Schedules/ScheduleDetailWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const ScheduleDetailPage: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Schedule details', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: 'Schedule Details', path: location.pathname },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname]);

	return (
		<PageWrapper title='Schedule detail'>
			<Page container='fluid'>
				<ScheduleDetailWorkspace />
			</Page>
		</PageWrapper>
	);
};

export default ScheduleDetailPage;


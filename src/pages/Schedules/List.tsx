import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import SchedulesListWorkspace from '../../components/MasterComponents/Schedules/SchedulesListWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const SchedulesListPage: React.FC = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Schedules', isEditable: false }));
		dispatch(setBreadcrumbs([]));
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch]);

	return (
		<PageWrapper title='Schedules'>
			<Page container='fluid'>
				<SchedulesListWorkspace />
			</Page>
		</PageWrapper>
	);
};

export default SchedulesListPage;

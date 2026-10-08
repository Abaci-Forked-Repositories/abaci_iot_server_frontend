import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import MainDashboardMonitor from '../../components/MasterComponents/Dashboard/MainDashboardMonitor';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const Dashboard = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Dashboard', isEditable: false }));
		dispatch(setBreadcrumbs([]));
	}, [dispatch]);

	return (
		<PageWrapper title='Dashboard'>
			<Page container='fluid'>
				<div className='pb-4'>
					<MainDashboardMonitor />
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Dashboard;

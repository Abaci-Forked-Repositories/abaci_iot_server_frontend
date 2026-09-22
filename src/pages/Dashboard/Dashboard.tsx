import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
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
				<Card stretch>
					<CardBody className='d-flex align-items-center justify-content-center'>
						<h2 className='mb-0 fw-bold text-muted'>Main Dashboard</h2>
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default Dashboard;

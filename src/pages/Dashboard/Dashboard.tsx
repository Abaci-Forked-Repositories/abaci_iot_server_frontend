import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import { Player } from '@lottiefiles/react-lottie-player';
import pendingLottie from '../../assets/Lottie/No-Data.json';

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
					<CardHeader>
						<CardLabel icon='Dashboard'>
							<CardTitle tag='h4'>Dashboard</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody className='d-flex flex-column align-items-center justify-content-center py-5'>
						<Player
							src={pendingLottie}
							autoplay
							loop
							style={{ width: 360, height: 200 }}
						/>
						<p className='h5 text-muted mt-4 mb-1'>Pending</p>
						<p className='text-muted text-center px-3'>
							Content will load here after the backend is connected.
						</p>
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default Dashboard;

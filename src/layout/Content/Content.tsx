import React,{ Suspense } from 'react';
import Card, { CardBody } from '../../components/bootstrap/Card';
import PageWrapper from '../PageWrapper/PageWrapper';
import Page from '../Page/Page';
import SubHeader from '../SubHeader/SubHeader';
import ContentRoutes from './ContentRoutes';
// import WebsocketProvider from '../../WebsocketWrapper/WebSocket';
import AbaciLoader from '../../components/AbaciLoader/AbaciLoader';


const Content = () => {
	return (
		<main className='content'>
			<Suspense fallback={<AbaciLoader />}>
				<ContentRoutes />
			</Suspense>
		</main>
	);
};

export default Content;

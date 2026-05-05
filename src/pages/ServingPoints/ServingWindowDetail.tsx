import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import ServingWindowDetailWorkspace from '../../components/MasterComponents/ServingPoints/ServingWindowDetailWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const ServingWindowDetailPage: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const { servingPointId } = useParams<{ servingPointId: string }>();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Serving Window', isEditable: false }));
		const parentPointPath =
			servingPointId && !Number.isNaN(Number(servingPointId))
				? `/serving-points/${servingPointId}`
				: '/serving-points';
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: 'Serving Points', path: '/serving-points' },
				{ label: 'Serving point', path: parentPointPath },
				{ label: 'Serving window', path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname, location.search, servingPointId]);

	return (
		<PageWrapper title='Serving Window'>
			<Page container='fluid'>
				<ServingWindowDetailWorkspace />
			</Page>
		</PageWrapper>
	);
};

export default ServingWindowDetailPage;

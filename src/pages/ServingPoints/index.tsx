import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import ServingPointsWorkspace from '../../components/MasterComponents/ServingPoints/ServingPointsWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const ServingPointsPage: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Serving Points', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: 'Serving Points', path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname, location.search]);

	return (
		<PageWrapper title='Serving Points'>
			<Page container='fluid'>
				<ServingPointsWorkspace />
			</Page>
		</PageWrapper>
	);
};

export default ServingPointsPage;


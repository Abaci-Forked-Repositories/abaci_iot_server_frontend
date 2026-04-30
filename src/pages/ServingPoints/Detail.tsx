import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import ServingPointDetailWorkspace from '../../components/MasterComponents/ServingPoints/ServingPointDetailWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const ServingPointDetailPage: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Serving Point Detail', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: 'Serving Points', path: '/serving-points' },
				{ label: 'Serving Point Detail', path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname, location.search]);

	return (
		<PageWrapper title='Serving Point Detail'>
			<Page container='fluid'>
				<ServingPointDetailWorkspace />
			</Page>
		</PageWrapper>
	);
};

export default ServingPointDetailPage;

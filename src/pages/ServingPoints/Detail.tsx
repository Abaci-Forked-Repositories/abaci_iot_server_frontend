import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import ServingPointDetailWorkspace from '../../components/MasterComponents/ServingPoints/ServingPointDetailWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';

const ServingPointDetailPage: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const initialNameFromState =
		(location.state as { servingPointName?: string } | null)?.servingPointName?.trim() ||
		null;
	const [servingPointName, setServingPointName] = useState<string | null>(initialNameFromState);

	useEffect(() => {
		setServingPointName(initialNameFromState);
	}, [initialNameFromState, location.pathname]);

	const detailLabel = useMemo(() => {
		if (servingPointName?.trim()) return servingPointName.trim();
		return 'Serving Point Detail';
	}, [servingPointName]);

	useEffect(() => {
		dispatch(setHeaderTitle({ name: detailLabel, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Queue Management', path: '/queue-management' },
				{ label: 'Serving Points', path: '/serving-points' },
				{ label: detailLabel, path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [detailLabel, dispatch, location.pathname, location.search]);

	return (
		<PageWrapper title={detailLabel}>
			<Page container='fluid'>
				<ServingPointDetailWorkspace onServingPointNameChange={setServingPointName} />
			</Page>
		</PageWrapper>
	);
};

export default ServingPointDetailPage;

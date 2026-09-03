import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import KnowledgeWorkspace from '../../components/MasterComponents/Knowledge/KnowledgeWorkspace';

const KnowledgePage: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Knowledge', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Knowledge', path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname, location.search]);

	return (
		<PageWrapper title='Knowledge'>
			<Page container='fluid'>
				<KnowledgeWorkspace />
			</Page>
		</PageWrapper>
	);
};

export default KnowledgePage;

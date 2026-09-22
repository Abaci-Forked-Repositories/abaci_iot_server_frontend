import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import usePermissions from '../../hooks/usePermissions';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import DeviceListTab from './DeviceListTab';
import DeviceGroupsTab from './DeviceGroupsTab';

type DevicesTab = 'list' | 'groups';

const Devices: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<DevicesTab>('list');
	const { can } = usePermissions();
	const canWrite = can('devices_write');

	useEffect(() => {
		dispatch(setHeaderTitle({ name: 'Devices', isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Devices', path: location.pathname + location.search },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, location.pathname, location.search]);

	return (
		<PageWrapper title='Devices'>
			<Page container='fluid'>
				<Card stretch>
					<CardHeader>
						<div className='d-flex align-items-center gap-2'>
							<Button
								color={activeTab === 'list' ? 'primary' : undefined}
								isLight={activeTab !== 'list'}
								size='sm'
								onClick={() => setActiveTab('list')}>
								Device List
							</Button>
							<Button
								color={activeTab === 'groups' ? 'primary' : undefined}
								isLight={activeTab !== 'groups'}
								size='sm'
								onClick={() => setActiveTab('groups')}>
								Device Groups
							</Button>
						</div>
					</CardHeader>
					<CardBody>
						{activeTab === 'list' && <DeviceListTab canWrite={canWrite} />}
						{activeTab === 'groups' && <DeviceGroupsTab canWrite={canWrite} />}
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default Devices;

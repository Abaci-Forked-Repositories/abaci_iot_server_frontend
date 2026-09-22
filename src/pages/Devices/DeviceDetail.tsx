import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Button from '../../components/bootstrap/Button';
import DashboardWorkspace from '../../components/MasterComponents/Dashboard/DashboardWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import { DUMMY_DEVICES } from './devicesDummyData';

const DeviceDetail: React.FC = () => {
	const { deviceId } = useParams<{ deviceId: string }>();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const device = useMemo(() => {
		const id = Number(deviceId);
		return DUMMY_DEVICES.find((d) => d.id === id) ?? null;
	}, [deviceId]);

	useEffect(() => {
		const title = device ? device.name : 'Device Dashboard';
		dispatch(setHeaderTitle({ name: title, isEditable: false }));
		dispatch(
			setBreadcrumbs([
				{ label: 'Devices', path: '/devices' },
				{ label: title, path: `/devices/${deviceId}` },
			]),
		);
		return () => {
			dispatch(setBreadcrumbs([]));
		};
	}, [dispatch, device, deviceId]);

	if (!device) {
		return (
			<PageWrapper title='Device Not Found'>
				<Page container='fluid'>
					<div className='d-flex flex-column align-items-center justify-content-center gap-3 py-5'>
						<p className='text-muted mb-0'>Device not found.</p>
						<Button color='primary' icon='ArrowBack' onClick={() => navigate('/devices')}>
							Back to Devices
						</Button>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={device.name}>
			<Page container='fluid'>
				<div className='d-flex align-items-center gap-2 mb-3'>
					<Button
						color='light'
						size='sm'
						icon='ArrowBack'
						onClick={() => navigate('/devices')}>
						Back
					</Button>
					<span className='text-muted small'>
						{device.site} · {device.status}
					</span>
				</div>
				<DashboardWorkspace deviceName={device.name} />
			</Page>
		</PageWrapper>
	);
};

export default DeviceDetail;

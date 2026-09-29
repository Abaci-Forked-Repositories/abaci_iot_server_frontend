import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Button from '../../components/bootstrap/Button';
import DashboardWorkspace from '../../components/MasterComponents/Dashboard/DashboardWorkspace';
import { setBreadcrumbs, setHeaderTitle } from '../../store/uiSlice';
import useToasterNotification from '../../hooks/useToasterNotification';
import { getDeviceById, type Device } from '../../api/devices/devices';

const DeviceDetail: React.FC = () => {
	const { deviceId } = useParams<{ deviceId: string }>();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { showErrorNotification } = useToasterNotification();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['device', deviceId],
		queryFn: () => getDeviceById(deviceId!),
		enabled: !!deviceId,
	});

	const device: Device | null = data ?? null;

	useEffect(() => {
		if (isError && error) {
			showErrorNotification(error);
		}
	}, [isError, error, showErrorNotification]);

	useEffect(() => {
		const title = device?.name ?? 'Device Dashboard';
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

	if (isLoading) {
		return (
			<PageWrapper title='Loading Device'>
				<Page container='fluid'>
					<div className='text-center text-muted py-5'>Loading device…</div>
				</Page>
			</PageWrapper>
		);
	}

	if (isError || !device?.id) {
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
						{[device.description, device.firmware_version]
							.filter(Boolean)
							.join(' · ') || '—'}
					</span>
				</div>
				<div className='pb-4'>
					<DashboardWorkspace deviceId={device.id} deviceName={device.name} />
				</div>
			</Page>
		</PageWrapper>
	);
};

export default DeviceDetail;

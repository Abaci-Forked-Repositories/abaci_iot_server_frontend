import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import { screensApi, type Screen } from '../../../services/screensManagementApi';
import ScreenTvPreview from './ScreenTvPreview';
import ScreenDetailPanel from './ScreenDetailPanel';
import { FALLBACK_SCREENS } from './screensFallbackData';

const toMessage = (error: unknown) => {
	const typed = error as { response?: { data?: { detail?: string } } };
	return typed.response?.data?.detail || 'Failed to fetch screen detail.';
};

const ScreenDetailWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const screenId = Number(id);

	const [screen, setScreen] = useState<Screen | null>(null);
	const [loading, setLoading] = useState(false);
	const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
	const [offlineMode, setOfflineMode] = useState(false);
	const [message, setMessage] = useState('');

	const loadScreen = useCallback(async () => {
		if (!Number.isFinite(screenId)) return;
		setLoading(true);
		setMessage('');
		try {
			const response = await screensApi.get(screenId);
			setScreen(response);
			setOfflineMode(false);
		} catch (error) {
			setScreen(FALLBACK_SCREENS.find((item) => item.id === screenId) || FALLBACK_SCREENS[0] || null);
			setOfflineMode(true);
			setMessage(toMessage(error));
		} finally {
			setLoading(false);
		}
	}, [screenId]);

	useEffect(() => {
		loadScreen();
	}, [loadScreen]);

	const runAction = async (
		key: string,
		action: () => Promise<unknown>,
		fallbackUpdater?: (current: Screen) => Screen,
	) => {
		if (!screen) return;
		setActionLoadingKey(key);
		setMessage('');
		try {
			await action();
			await loadScreen();
		} catch (error) {
			if (fallbackUpdater) {
				setScreen((current) => (current ? fallbackUpdater(current) : current));
				setOfflineMode(true);
			}
			setMessage(toMessage(error));
		} finally {
			setActionLoadingKey(null);
		}
	};

	const handleActivateToggle = (target: Screen) => {
		const key = `screen-active-${target.id}`;
		const apiAction = () =>
			target.is_active ? screensApi.deactivate(target.id) : screensApi.activate(target.id);
		runAction(key, apiAction, (current) => ({ ...current, is_active: !Boolean(current.is_active) }));
	};

	const handleAudioToggle = (target: Screen) => {
		const key = `screen-audio-${target.id}`;
		runAction(key, () => screensApi.toggleAudio(target.id), (current) => ({
			...current,
			enable_audio: !Boolean(current.enable_audio),
		}));
	};

	const handleHeartbeat = (target: Screen) => {
		const key = `screen-heartbeat-${target.id}`;
		runAction(key, () => screensApi.heartbeat(target.id), (current) => ({
			...current,
			is_online: true,
			last_heartbeat: new Date().toISOString(),
		}));
	};

	return (
		<Card stretch className='screens-workspace-card'>
			<CardHeader>
				<CardLabel icon='SmartScreen'>
					<CardTitle tag='h4'>Screen Detail</CardTitle>
				</CardLabel>
				<CardActions>
					<Button color='light' icon='ArrowBack' onClick={() => navigate('/screens')}>
						Back to Screens
					</Button>
				</CardActions>
			</CardHeader>
			<CardBody className='screens-body'>
		
				{message && <div className='alert alert-warning mb-3'>{message}</div>}
				{loading ? (
					<div className='text-center text-muted py-5'>Loading screen detail...</div>
				) : (
					<div className='screens-layout-detail-only'>
						<ScreenTvPreview screen={screen} />
						<ScreenDetailPanel
							screen={screen}
							actionLoadingKey={actionLoadingKey}
							onActivateToggle={handleActivateToggle}
							onAudioToggle={handleAudioToggle}
							onHeartbeat={handleHeartbeat}
						/>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default ScreenDetailWorkspace;


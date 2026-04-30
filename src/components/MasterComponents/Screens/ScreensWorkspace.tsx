import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Badge from '../../bootstrap/Badge';
import ScreenCardTile from './ScreenCardTile';
import { screensApi, type Screen } from '../../../services/screensManagementApi';
import { FALLBACK_SCREENS } from './screensFallbackData';

const toMessage = (error: unknown) => {
	const typed = error as { response?: { data?: { detail?: string } } };
	return typed.response?.data?.detail || 'Failed to fetch screens.';
};

const ScreensWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const [screens, setScreens] = useState<Screen[]>([]);
	const [loading, setLoading] = useState(false);
	const [offlineMode, setOfflineMode] = useState(false);
	const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
	const [search, setSearch] = useState('');
	const [message, setMessage] = useState('');

	const displayedScreens = useMemo(() => {
		return screens.filter((item) => {
			const statusMatch =
				statusFilter === 'all' ||
				(statusFilter === 'online' ? Boolean(item.is_online) : !Boolean(item.is_online));

			const searchMatch =
				search.trim() === '' ||
				item.name.toLowerCase().includes(search.toLowerCase()) ||
				(item.location || '').toLowerCase().includes(search.toLowerCase());

			return statusMatch && searchMatch;
		});
	}, [screens, statusFilter, search]);

	const loadScreens = useCallback(async () => {
		setLoading(true);
		setMessage('');
		try {
			const response = await screensApi.list({ page_size: 100, ordering: 'name' });
			const data = response.results || [];
			setScreens(data);
			setOfflineMode(false);
		} catch (error) {
			setScreens(FALLBACK_SCREENS);
			setOfflineMode(true);
			setMessage(toMessage(error));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadScreens();
	}, [loadScreens]);

	return (
		<Card stretch className='screens-workspace-card'>
			<CardHeader>
				<CardLabel icon='SmartScreen'>
					<CardTitle tag='h4'>Screen Management</CardTitle>
				</CardLabel>
				<CardActions>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<select
							className='form-select form-select-sm screens-filter'
							value={statusFilter}
							onChange={(event) =>
								setStatusFilter(event.target.value as 'all' | 'online' | 'offline')
							}>
							<option value='all'>All</option>
							<option value='online'>Online</option>
							<option value='offline'>Offline</option>
						</select>
						<input
							className='form-control form-control-sm screens-search'
							placeholder='Search screens'
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<Button color='light' icon='Refresh' isDisable={loading} onClick={loadScreens}>
							Refresh
						</Button>
					</div>
				</CardActions>
			</CardHeader>
			<CardBody className='screens-body'>
				{message && <div className='alert alert-warning mb-3'>{message}</div>}

				<div className='screens-layout-list-only'>
					<div className='screens-grid-panel'>
						<div className='screens-grid-header'>
							<span className='fw-semibold'>Groups</span>
						</div>
						<p className='screens-empty-groups'>
							No screen groups yet. Create a group once you have screens to organize.
						</p>
					</div>
					<div className='screens-grid-panel'>
						<div className='screens-grid-header'>
							<span className='fw-semibold'>Ungrouped Screens</span>
							<Badge color='secondary' isLight>
								{displayedScreens.length}
							</Badge>
						</div>
						{loading ? (
							<div className='text-center text-muted py-5'>Loading screens...</div>
						) : (
							<div className='screens-grid'>
								{displayedScreens.map((screen) => (
									<ScreenCardTile
										key={screen.id}
										screen={screen}
										onOpen={(item) => navigate(`/screens/${item.id}`)}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default ScreensWorkspace;

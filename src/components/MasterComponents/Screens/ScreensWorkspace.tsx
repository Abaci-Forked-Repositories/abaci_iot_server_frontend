import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import Badge from '../../bootstrap/Badge';
import DropDownFilter from '../../CustomComponent/DropDown/DropDownFilter';
import ScreenCardTile from './ScreenCardTile';
import ScreenCreateModal from './ScreenCreateModal';
import { screensApi, type CreateScreenPayload, type Screen } from '../../../services/screensManagementApi';
import { FALLBACK_SCREENS } from './screensFallbackData';
import { swalFire } from '../../../helpers/swalHelper';

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
	const [screenDisplayMode, setScreenDisplayMode] = useState<'grouped' | 'ungrouped'>('ungrouped');
	const [search, setSearch] = useState('');
	const [message, setMessage] = useState('');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);

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

	const handleCreateScreen = async (payload: CreateScreenPayload) => {
		try {
			await screensApi.create(payload);
			setMessage('');
			await loadScreens();
		} catch (error) {
			setMessage(toMessage(error));
			throw error;
		}
	};

	const handleDeleteScreen = async (screen: Screen) => {
		const result = await swalFire({
			title: 'Delete screen?',
			text: `Delete "${screen.name}"? This cannot be undone.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			reverseButtons: true,
		});
		if (!result.isConfirmed) return;

		setDeletingId(screen.id);
		setMessage('');
		try {
			await screensApi.remove(screen.id);
			setScreens((prev) => prev.filter((item) => item.id !== screen.id));
		} catch (error) {
			setMessage(toMessage(error));
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<>
			<ScreenCreateModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreateScreen}
			/>
			<Card stretch className='screens-workspace-card'>
			<CardHeader>
				<CardLabel icon='SmartScreen'>
					<CardTitle tag='h4'>Screen Management</CardTitle>
				</CardLabel>
				<CardActions>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<DropDownFilter
							options={[
								{ label: 'All', value: 'all' as const },
								{ label: 'Online', value: 'online' as const },
								{ label: 'Offline', value: 'offline' as const },
							]}
							onChange={(option: { value: 'all' | 'online' | 'offline' }) =>
								setStatusFilter(option.value)
							}
							selectedOption={
								statusFilter === 'online'
									? { label: 'Online', value: 'online' as const }
									: statusFilter === 'offline'
										? { label: 'Offline', value: 'offline' as const }
										: { label: 'All', value: 'all' as const }
							}
							color='primary'
							labelField='label'
							direction='down'
							icon='FilterAlt'
							buttonClassName='app-control-btn'
						/>
						<input
							className='form-control form-control-sm screens-search'
							placeholder='Search screens'
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<DropDownFilter
							options={[
								{ label: 'Grouped Screens', value: 'grouped' as const },
								{ label: 'Ungrouped Screens', value: 'ungrouped' as const },
							]}
							onChange={(option: { value: 'grouped' | 'ungrouped' }) =>
								setScreenDisplayMode(option.value)
							}
							selectedOption={
								screenDisplayMode === 'grouped'
									? { label: 'Grouped Screens', value: 'grouped' as const }
									: { label: 'Ungrouped Screens', value: 'ungrouped' as const }
							}
							color='primary'
							labelField='label'
							direction='down'
							icon='FilterAlt'
							buttonClassName='app-control-btn'
						/>
						<Button
							color='primary'
							icon='Add'
							onClick={() => {
								setMessage('');
								setShowCreateModal(true);
							}}>
							Add Screen
						</Button>
					</div>
				</CardActions>
			</CardHeader>
			<CardBody className='screens-body'>
				{message && <div className='alert alert-warning mb-3'>{message}</div>}

				<div className='screens-layout-list-only'>
					{screenDisplayMode === 'grouped' && (
						<div className='screens-grid-panel'>
							<div className='screens-grid-header'>
								<span className='fw-semibold'>Grouped Screens</span>
								<Badge color='secondary' isLight>
									0
								</Badge>
							</div>
							<p className='screens-empty-groups'>
								No grouped screens yet. Create groups once grouping is configured.
							</p>
						</div>
					)}
					{screenDisplayMode === 'ungrouped' && (
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
											deleting={deletingId === screen.id}
											onOpen={(item) => navigate(`/screens/${item.id}`)}
											onDelete={handleDeleteScreen}
										/>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</CardBody>
		</Card>
		</>
	);
};

export default ScreensWorkspace;

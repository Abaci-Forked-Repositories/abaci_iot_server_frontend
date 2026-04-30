import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';
import ThumbnailSizeControl from '../../CustomComponent/ThumbnailSizeControl';
import { templatesApi, type CreateTemplatePayload, type Template } from '../../../services/templatesApi';
import { swalFire } from '../../../helpers/swalHelper';
import TemplateCardTile from './TemplateCardTile';
import TemplateCreateModal from './TemplateCreateModal';

const THUMB_KEY = 'templateThumbSize';
const THUMB_DEFAULT = 138;
const THUMB_MIN = 115;
const THUMB_MAX = 250;
const THUMB_STEP = 12;

const DUMMY_TEMPLATES: Template[] = [
	{
		id: 1001,
		template_name: 'Lobby Welcome Board',
		orientation: 'Landscape',
		resolution_width: 1920,
		resolution_height: 1080,
		thumbnail: null,
	},
	{
		id: 1002,
		template_name: 'Queue Counter Display',
		orientation: 'Landscape',
		resolution_width: 1280,
		resolution_height: 720,
		thumbnail: null,
	},
	{
		id: 1003,
		template_name: 'Vertical Promo Screen',
		orientation: 'Portrait',
		resolution_width: 1080,
		resolution_height: 1920,
		thumbnail: null,
	},
];

const getStoredThumb = () => {
	const saved = Number(localStorage.getItem(THUMB_KEY));
	return saved >= THUMB_MIN && saved <= THUMB_MAX ? saved : THUMB_DEFAULT;
};

const TemplatesWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [error, setError] = useState('');
	const [thumbSize, setThumbSize] = useState(getStoredThumb);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const saveThumb = (v: number) => {
		const clamped = Math.min(THUMB_MAX, Math.max(THUMB_MIN, v));
		setThumbSize(clamped);
		localStorage.setItem(THUMB_KEY, String(clamped));
	};

	const loadTemplates = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const res = await templatesApi.list({ search: search || undefined, limit: 60 });
			const fetched = res.results || [];
			setTemplates(fetched.length ? fetched : DUMMY_TEMPLATES);
		} catch {
			setTemplates(DUMMY_TEMPLATES);
			setError('No API templates found. Showing dummy templates.');
		} finally {
			setLoading(false);
		}
	}, [search]);

	useEffect(() => {
		void loadTemplates();
	}, [loadTemplates]);

	const handleCreate = async (payload: CreateTemplatePayload) => {
		const created = await templatesApi.create(payload);
		setTemplates((prev) => [created, ...prev]);
		navigate(`/templates/${created.id}`, { state: created });
	};

	const handleDelete = async (tpl: Template) => {
		const result = await swalFire({
			title: 'Delete Template?',
			text: `Delete "${tpl.template_name}"? This cannot be undone.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			reverseButtons: true,
		});
		if (!result.isConfirmed) return;
		try {
			await templatesApi.delete(tpl.id);
			setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
		} catch {
			setError('Failed to delete template.');
		}
	};

	const displayed = templates.filter((t) =>
		!search || t.template_name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<>
			<TemplateCreateModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreate}
			/>

			<Card stretch className='tpl-workspace-card'>
				<CardHeader>
					<CardLabel icon='ViewCompact'>
						<CardTitle tag='h4'>Templates</CardTitle>
					</CardLabel>
					<CardActions>
						<div className='d-flex align-items-center gap-2 flex-wrap'>
							<ThumbnailSizeControl
								value={thumbSize}
								min={THUMB_MIN}
								max={THUMB_MAX}
								step={THUMB_STEP}
								onIncrease={() => saveThumb(thumbSize + THUMB_STEP)}
								onDecrease={() => saveThumb(thumbSize - THUMB_STEP)}
								onChange={(value) => saveThumb(value)}
							/>
							<input
								className='form-control form-control-sm tpl-search'
								placeholder='Search templates…'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							{/* <Button color='light' icon='Refresh' isDisable={loading} onClick={loadTemplates}>
								Refresh
							</Button> */}
							<Button color='primary' icon='Add' onClick={() => setShowCreateModal(true)}>
								New Template
							</Button>
						</div>
					</CardActions>
				</CardHeader>

				<CardBody className='tpl-body'>
					<div className='tpl-content'>
						{loading ? (
							<div className='tpl-empty'>
								<span className='text-muted'>Loading templates…</span>
							</div>
						) : displayed.length === 0 ? (
							<div className='tpl-empty'>
								<div className='tpl-empty-icon'>
									<svg width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.2'>
										<rect x='3' y='3' width='18' height='18' rx='2' />
										<path d='M3 9h18M9 21V9' />
									</svg>
								</div>
								<h6 className='tpl-empty-title'>No templates found</h6>
								<p className='tpl-empty-sub'>Try a different search term.</p>
							</div>
						) : (
							<div className='tpl-grid'>
								{displayed.map((tpl) => (
									<TemplateCardTile
										key={tpl.id}
										template={tpl}
										thumbSize={thumbSize}
										onOpen={(t) => navigate(`/templates/${t.id}`, { state: t })}
										onDelete={handleDelete}
									/>
								))}
							</div>
						)}
					</div>
				</CardBody>
			</Card>
		</>
	);
};

export default TemplatesWorkspace;

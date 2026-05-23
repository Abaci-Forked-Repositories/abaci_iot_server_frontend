import React, { useEffect, useState } from 'react';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import type { CreateTemplatePayload } from '../../../services/templatesApi';

const RESOLUTIONS = [
	{ val: 1 as const, getLabel: (land: boolean) => (land ? '1920 × 1080' : '1080 × 1920'), tag: 'Full HD' },
	{ val: 2 as const, getLabel: (land: boolean) => (land ? '1280 × 720' : '720 × 1280'), tag: 'HD' },
	{ val: 3 as const, getLabel: () => 'Custom', tag: null },
];

const ZONE_GRADIENTS = [
	'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
	'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
	'linear-gradient(135deg, #10b981 0%, #047857 100%)',
	'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
];

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateTemplatePayload) => Promise<void>;
}

const TemplateCreateModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [isLandscape, setIsLandscape] = useState(true);
	const [width, setWidth] = useState(1920);
	const [height, setHeight] = useState(1080);
	const [resolution, setResolution] = useState<1 | 2 | 3>(1);
	const [description, setDescription] = useState('');
	const [previewW, setPreviewW] = useState(290);
	const [previewH, setPreviewH] = useState(163);
	const [border, setBorder] = useState(10);
	const [radius, setRadius] = useState(20);

	useEffect(() => {
		const w = Number(width);
		const h = Number(height);
		setIsLandscape(w >= h);
		const MAX = 280;
		const scale = MAX / Math.max(w, h);
		setPreviewW(Math.round(scale * w));
		setPreviewH(Math.round(scale * h));
		setBorder(Math.round(scale * 10));
		setRadius(Math.round(scale * 20));
	}, [width, height]);

	const switchOrientation = (toLandscape: boolean) => {
		if (toLandscape === isLandscape) return;
		setWidth(height);
		setHeight(width);
	};

	const pickResolution = (val: 1 | 2 | 3) => {
		setResolution(val);
		if (val === 1) {
			setWidth(isLandscape ? 1920 : 1080);
			setHeight(isLandscape ? 1080 : 1920);
		} else if (val === 2) {
			setWidth(isLandscape ? 1280 : 720);
			setHeight(isLandscape ? 720 : 1280);
		}
	};

	const handleClose = () => {
		setName('');
		setResolution(1);
		setWidth(1920);
		setHeight(1080);
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) return;
		setLoading(true);
		try {
			await onSubmit({
				name: name.trim(),
				description: description.trim(),
				// orientation: isLandscape ? 'landscape' : 'portrait',
				// resolution_width: Number(width),
				// resolution_height: Number(height),
			});
			handleClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='xl' isCentered>
			<ModalHeader setIsOpen={handleClose}>
				<ModalTitle id='new-template-modal'>New Template</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<div className='tpl-modal-body'>
					<div className='tpl-modal-form'>
						<header className='tpl-modal-intro'>
							{/* <h5 className='tpl-modal-intro-title'>Template setup</h5> */}
							{/* <p className='tpl-modal-intro-sub'>
								Name your layout, pick orientation and resolution, then refine zones in the editor.
							</p> */}
						</header>

						<div className='tpl-field-group'>
							<label className='tpl-field-label' htmlFor='tpl-name'>
								Template name
							</label>
							<input
								id='tpl-name'
								className='form-control'
								type='text'
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder='e.g. Main lobby display'
								autoFocus
								autoComplete='off'
							/>
						</div>
						<div className='tpl-field-group'>
							<label className='tpl-field-label' htmlFor='tpl-description'>
								Description
							</label>
							<textarea
								id='tpl-description'
								className='form-control'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder='Optional notes'
							/>
						</div>

						{/* <div className='tpl-field-group'>
							<label className='tpl-field-label'>Screen orientation</label>
							<div className='tpl-orient-row'>
								<button
									type='button'
									className={`tpl-orient-btn${isLandscape ? ' tpl-orient-btn--active' : ''}`}
									onClick={() => switchOrientation(true)}>
									<span className='tpl-orient-icon tpl-orient-icon--landscape' />
									Landscape
								</button>
								<button
									type='button'
									className={`tpl-orient-btn${!isLandscape ? ' tpl-orient-btn--active' : ''}`}
									onClick={() => switchOrientation(false)}>
									<span className='tpl-orient-icon tpl-orient-icon--portrait' />
									Portrait
								</button>
							</div>
						</div> */}

						{/* <div className='tpl-field-group'>
							<label className='tpl-field-label'>Screen resolution</label>
							<div className='tpl-res-list'>
								{RESOLUTIONS.map(({ val, getLabel, tag }) => (
									<button
										key={val}
										type='button'
										className={`tpl-res-btn${resolution === val ? ' tpl-res-btn--active' : ''}`}
										onClick={() => pickResolution(val)}>
										<span>{getLabel(isLandscape)}</span>
										{tag && <span className='tpl-res-tag'>{tag}</span>}
									</button>
								))}
							</div>
						</div> */}

						{resolution === 3 && (
							<div className='tpl-field-group'>
								<label className='tpl-field-label'>Custom size (px)</label>
								<div className='tpl-custom-res-row'>
									<div className='tpl-custom-res-field'>
										<label className='tpl-custom-field-label' htmlFor='tpl-width'>Width</label>
										<input
											id='tpl-width'
											className='form-control'
											type='number'
											min={480}
											value={width}
											onChange={(e) => setWidth(Number(e.target.value))}
										/>
									</div>
									<span className='tpl-custom-sep'>×</span>
									<div className='tpl-custom-res-field'>
										<label className='tpl-custom-field-label' htmlFor='tpl-height'>Height</label>
										<input
											id='tpl-height'
											className='form-control'
											type='number'
											min={480}
											value={height}
											onChange={(e) => setHeight(Number(e.target.value))}
										/>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* <div className='tpl-modal-preview'>
						<div className='tpl-preview-inner'>
							<div
								className='tpl-screen'
								style={{
									width: previewW + border,
									height: previewH + border,
									borderRadius: radius,
								}}>
								<div
									className='tpl-screen-content'
									style={{ width: previewW, height: previewH, borderWidth: border }}>
									{ZONE_GRADIENTS.map((grad, i) => (
										<div key={i} className={`tpl-zone-${i}`}>
											<div className='tpl-zone-fill' style={{ background: grad }}>
												<span className='tpl-zone-label'>Zone {i + 1}</span>
											</div>
										</div>
									))}
								</div>
							</div>
							<div className='tpl-screen-badge'>
								<span className='tpl-screen-badge-dot' />
								<span className='tpl-screen-badge-text'>
									{isLandscape ? 'Landscape' : 'Portrait'}&nbsp;·&nbsp;
									{width} × {height}
								</span>
							</div>
						</div>
					</div> */}
				</div>
			</ModalBody>
			<ModalFooter>
				<Button
					color='primary'
					isDisable={!name.trim() || loading}
					onClick={handleSubmit}>
					{loading ? <Spinner isSmall /> : 'Create Template'}
				</Button>
				<Button color='light' onClick={handleClose}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default TemplateCreateModal;

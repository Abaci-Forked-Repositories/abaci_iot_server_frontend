/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { SketchPicker, type ColorResult } from 'react-color';
import { templatesApi, type Template } from '../../../services/templatesApi';
import PreviewTvFrame from '../../StandardTvFrame/PreviewTvFrame';
import Spinner from '../../bootstrap/Spinner';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZoneProps {
	containerName: string;
	containerZIndex: number;
	width: number;
	height: number;
	left: number;
	top: number;
	color: string;
	radius: number;
	borderColor: string;
}

const BLANK_PROPS: ZoneProps = {
	containerName: '',
	containerZIndex: 0,
	width: 0,
	height: 0,
	left: 0,
	top: 0,
	color: 'rgba(255,255,255,0)',
	radius: 0,
	borderColor: 'rgba(255,255,255,0)',
};

function randomHex(): string {
	return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

// ─── Component ────────────────────────────────────────────────────────────────

const TemplateDetailWorkspace: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const routeTemplate = (location.state as Template | null) ?? null;

	const [templateDetails, setTemplateDetails] = useState<Template | null>(routeTemplate);
	const [loading, setLoading] = useState(!routeTemplate);
	const [saving, setSaving] = useState(false);

	// Fabric state
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<any>(null); // fabric.Canvas instance
	const [scalingFactor, setScalingFactor] = useState(1);
	const [canvasWidth, setCanvasWidth] = useState(0);
	const [canvasHeight, setCanvasHeight] = useState(0);
	const [canvasObjects, setCanvasObjects] = useState<any[]>([]);
	const [selectedObject, setSelectedObject] = useState<any>(null);

	// Zone properties panel
	const [zoneProps, setZoneProps] = useState<ZoneProps>(BLANK_PROPS);
	const [fillColor, setFillColor] = useState('white');
	const [showFillPicker, setShowFillPicker] = useState(false);
	const [nameError, setNameError] = useState(false);

	const applyFillColor = useCallback(
		(nextColor: string) => {
			setFillColor(nextColor);
			if (!fabricRef.current) return;
			const fc = fabricRef.current;
			const active = fc.getActiveObject?.();
			const target = active ?? selectedObject;
			if (!target) return;
			if (target.type === 'activeSelection' && Array.isArray(target._objects)) {
				target._objects.forEach((obj: any) => obj.set('fill', nextColor));
			} else {
				target.set('fill', nextColor);
			}
			setZoneProps((s) => ({ ...s, color: nextColor }));
			fc.requestRenderAll?.();
			fc.renderAll();
		},
		[selectedObject],
	);

	const getPickerColorString = (color: ColorResult) => {
		const rawAlpha = color.rgb.a ?? 1;
		const alpha = rawAlpha > 1 ? rawAlpha / 100 : rawAlpha;
		return alpha >= 1 ? color.hex : `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${alpha})`;
	};

	// ─── Load template ───────────────────────────────────────────────────────
	// If the list page already passed the template via router state we skip the
	// API call entirely; this avoids hanging on dummy / offline templates.

	useEffect(() => {
		if (routeTemplate) return; // already have it from navigation state
		if (!id) return;
		setLoading(true);
		templatesApi
			.get(Number(id))
			.then((data) => setTemplateDetails(data))
			.catch(() =>
				setTemplateDetails({
					id: Number(id),
					template_name: 'Template',
					orientation: 'Landscape',
					resolution_width: 1920,
					resolution_height: 1080,
				}),
			)
			.finally(() => setLoading(false));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// ─── Build fabric canvas when templateDetails arrive ─────────────────────

	useEffect(() => {
		if (!templateDetails || !canvasRef.current) return;

		// Destroy previous canvas if any
		if (fabricRef.current) {
			fabricRef.current.dispose();
			fabricRef.current = null;
		}

		const isLandscape = templateDetails.orientation === 'Landscape';
		const sf = isLandscape
			? window.innerWidth / templateDetails.resolution_width / 2.3
			: window.innerWidth / templateDetails.resolution_height / 4;

		const cw = templateDetails.resolution_width * sf;
		const ch = templateDetails.resolution_height * sf;

		setScalingFactor(sf);
		setCanvasWidth(cw);
		setCanvasHeight(ch);

		// Dynamically import fabric — v7 exports classes directly (no { fabric } namespace)
		import('fabric').then(({ Canvas }) => {
			const fc = new Canvas('tpl-detail-canvas', {
				height: ch,
				width: cw,
				backgroundColor: 'white',
				selection: true,
				renderOnAddRemove: true,
				preserveObjectStacking: true,
			});

			fc.on('selection:created', (e: any) => setSelectedObject(e?.selected?.[0] ?? null));
			fc.on('selection:updated', (e: any) =>
				setSelectedObject(e?.selected?.[0] ?? e?.target ?? null),
			);
			fc.on('selection:cleared', () => {
				setSelectedObject(null);
				setZoneProps(BLANK_PROPS);
				setFillColor('white');
			});
			fc.on('object:added', () => setCanvasObjects(fc.getObjects()));
			fc.on('object:modified', (e: any) => {
				borderGuard(e.target, fc);
				setSelectedObject(null);
				setSelectedObject(e.target);
				setCanvasObjects(fc.getObjects());
			});
			fc.on('object:removed', () => setCanvasObjects(fc.getObjects()));

			fabricRef.current = fc;
		});

		return () => {
			fabricRef.current?.dispose();
			fabricRef.current = null;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateDetails]);

	// ─── Keep zone-props panel in sync with selectedObject ────────────────────

	useEffect(() => {
		if (!selectedObject) return;
		setNameError(false);
		setFillColor(selectedObject.fill ?? 'white');
		setZoneProps({
			containerName: selectedObject.name ?? '',
			containerZIndex: canvasObjects.indexOf(selectedObject),
			width: Math.round(selectedObject.width / scalingFactor),
			height: Math.round(selectedObject.height / scalingFactor),
			left: Math.round(selectedObject.left / scalingFactor),
			top: Math.round(selectedObject.top / scalingFactor),
			color: selectedObject.fill ?? 'white',
			radius: Math.round((selectedObject.rx ?? 0) / scalingFactor),
			borderColor: selectedObject.stroke ?? 'rgba(255,255,255,0)',
		});
	}, [selectedObject, scalingFactor, canvasObjects]);

	// ─── Sync fill colour back to canvas ─────────────────────────────────────

	useEffect(() => {
		if (!selectedObject || !fabricRef.current) return;
		selectedObject.set({ fill: fillColor });
		setZoneProps((s) => ({ ...s, color: fillColor }));
		fabricRef.current.requestRenderAll?.();
		fabricRef.current.renderAll();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fillColor]);

	// ─── Delete key handler ───────────────────────────────────────────────────

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Delete' && selectedObject && fabricRef.current) {
				fabricRef.current.remove(fabricRef.current.getActiveObject());
				setSelectedObject(null);
				setZoneProps(BLANK_PROPS);
			}
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [selectedObject]);

	// ─── Helpers ─────────────────────────────────────────────────────────────

	const borderGuard = (obj: any, fc: any) => {
		const b = obj.getBoundingRect();
		if (b.top < 0) obj.top = 0;
		if (b.left < 0) obj.left = 0;
		if (b.left + b.width > fc.width) obj.left = fc.width - b.width + 1;
		if (b.top + b.height > fc.height) obj.top = fc.height - b.height + 1;
		obj.setCoords();
	};

	const nudge = useCallback(
		(type: keyof ZoneProps, delta: number) => {
			if (!selectedObject || !fabricRef.current) return;
			const fc = fabricRef.current;
			const sf = scalingFactor;
			switch (type) {
				case 'width': {
					const cur = selectedObject.width * (selectedObject.scaleX ?? 1);
					selectedObject.set({ width: cur + delta * sf, scaleX: 1 });
					break;
				}
				case 'height': {
					const cur = selectedObject.height * (selectedObject.scaleY ?? 1);
					selectedObject.set({ height: cur + delta * sf, scaleY: 1 });
					break;
				}
				case 'left':
					selectedObject.set('left', selectedObject.left + delta * sf);
					break;
				case 'top':
					selectedObject.set('top', selectedObject.top + delta * sf);
					break;
				case 'radius': {
					const nr = ((zoneProps.radius ?? 0) + delta) * sf;
					selectedObject.set({ rx: nr, ry: nr });
					break;
				}
			}
			selectedObject.setCoords?.();
			fc.renderAll();
			setZoneProps((s) => ({ ...s, [type]: (s[type] as number) + delta }));
		},
		[selectedObject, scalingFactor, zoneProps.radius],
	);

	const arrangeLayer = useCallback(
		(action: 'forward' | 'backward' | 'front' | 'back') => {
			const fc = fabricRef.current;
			if (!fc) return;
			const activeObject = fc.getActiveObject?.() ?? selectedObject;
			if (!activeObject) return;

			const moveByIndex = (nextIndex: number) => {
				const objects: any[] = fc.getObjects?.() ?? [];
				const bounded = Math.max(0, Math.min(objects.length - 1, nextIndex));
				if (typeof fc.moveObjectTo === 'function') {
					fc.moveObjectTo(activeObject, bounded);
					return;
				}
				if (typeof activeObject.moveTo === 'function') {
					activeObject.moveTo(bounded);
				}
			};

			const objects: any[] = fc.getObjects?.() ?? [];
			const currentIndex = objects.indexOf(activeObject);

			if (action === 'forward') {
				if (typeof fc.bringObjectForward === 'function') fc.bringObjectForward(activeObject, true);
				else if (typeof fc.bringForward === 'function') fc.bringForward(activeObject, true);
				else if (currentIndex >= 0) moveByIndex(currentIndex + 1);
			}
			if (action === 'backward') {
				if (typeof fc.sendObjectBackwards === 'function') fc.sendObjectBackwards(activeObject, true);
				else if (typeof fc.sendBackwards === 'function') fc.sendBackwards(activeObject, true);
				else if (currentIndex >= 0) moveByIndex(currentIndex - 1);
			}
			if (action === 'front') {
				if (typeof fc.bringObjectToFront === 'function') fc.bringObjectToFront(activeObject);
				else if (typeof fc.bringToFront === 'function') fc.bringToFront(activeObject);
				else moveByIndex((objects.length || 1) - 1);
			}
			if (action === 'back') {
				if (typeof fc.sendObjectToBack === 'function') fc.sendObjectToBack(activeObject);
				else if (typeof fc.sendToBack === 'function') fc.sendToBack(activeObject);
				else moveByIndex(0);
			}

			fc.requestRenderAll?.();
			fc.renderAll();
			setCanvasObjects(fc.getObjects());
			setSelectedObject(activeObject);
		},
		[selectedObject],
	);

	const handleForwardLayer = (e: React.MouseEvent<HTMLButtonElement>) => {
		arrangeLayer(e.shiftKey ? 'front' : 'forward');
	};

	const handleBackwardLayer = (e: React.MouseEvent<HTMLButtonElement>) => {
		arrangeLayer(e.shiftKey ? 'back' : 'backward');
	};

	// ─── Add zone ─────────────────────────────────────────────────────────────

	const addZone = useCallback(() => {
		if (!fabricRef.current || !templateDetails) return;
		import('fabric').then(({ Rect }) => {
			const fc = fabricRef.current;
			const sf = scalingFactor || 1;
			const maxLogicalSide = Math.min(templateDetails.resolution_width, templateDetails.resolution_height);
			const zoneLogicalSize = Math.max(80, Math.min(220, Math.round(maxLogicalSide * 0.25)));
			const zoneCanvasSize = Math.max(28, zoneLogicalSize * sf);
			const startLeft = Math.max(0, (fc.width - zoneCanvasSize) / 2);
			const startTop = Math.max(0, (fc.height - zoneCanvasSize) / 2);

			const rect = new Rect({
				id: nanoid(),
				name: '',
				width: zoneCanvasSize,
				height: zoneCanvasSize,
				left: startLeft,
				top: startTop,
				fill: randomHex(),
				stroke: 'black',
				strokeUniform: true,
				lockScalingFlip: true,
				hasRotatingPoint: false,
				noScaleCache: false,
			});
			rect.setControlsVisibility?.({ tl: false, tr: false, br: false, bl: false, mtr: false });
			rect.on('scaling', function (this: any) {
				this.set({ width: this.width * this.scaleX, height: this.height * this.scaleY, scaleX: 1, scaleY: 1 });
			});
			rect.on('deselected', () => {
				setSelectedObject(null);
				setZoneProps(BLANK_PROPS);
			});
			fc.add(rect);
			borderGuard(rect, fc);
			fc.setActiveObject(rect);
			fc.renderAll();
		});
	}, [templateDetails, scalingFactor]);

	// ─── Save ─────────────────────────────────────────────────────────────────

	const saveTemplate = useCallback(async () => {
		const fc = fabricRef.current;
		if (!fc || !templateDetails) return;

		const objs: any[] = fc.getObjects();

		if (objs.length === 0) {
			alert('Please add at least one zone before saving.');
			return;
		}

		const unnamed = objs.find((o) => !o.name?.trim());
		if (unnamed) {
			fc.setActiveObject(unnamed);
			fc.renderAll();
			setSelectedObject(unnamed);
			setNameError(true);
			return;
		}

		setSaving(true);
		try {
			const sf = scalingFactor;
			const divs = objs.map((obj, idx) => ({
				div_name: obj.name,
				position: 'absolute',
				marginTop: Math.round(obj.top / sf),
				marginLeft: Math.round(obj.left / sf),
				height: Math.round(obj.height / sf),
				width: Math.round(obj.width / sf),
				backgroundColor: obj.fill,
				border: obj.stroke === null ? 0 : 1,
				borderRadius: Math.round((obj.rx ?? 0) / sf),
				borderColor: obj.stroke ?? 'rgba(255,255,255,0)',
				zIndex: idx,
				template: templateDetails.id,
			}));

			const png = fc.toDataURL({ format: 'png' });
			const blob = await (await fetch(png)).blob();
			const form = new FormData();
			form.append('thumbnail', blob, `template${templateDetails.id}.png`);
			form.append('data', JSON.stringify(divs));
			form.append('template_id', String(templateDetails.id));

			const { authAxios } = await import('../../../axiosInstance');
			await authAxios.post('api/signage/divs', form, {
				headers: { 'content-type': 'multipart/form-data' },
			});
			navigate('/templates');
		} catch {
			alert('Save failed. Please try again.');
		} finally {
			setSaving(false);
		}
	}, [templateDetails, scalingFactor, navigate]);

	// ─── Stepper widget ───────────────────────────────────────────────────────

	const Stepper = ({ label, value, propKey }: { label: string; value: number; propKey: keyof ZoneProps }) => (
		<div className='tdc-stepper-group'>
			<span className='tdc-stepper-label'>{label}</span>
			<div className='tdc-stepper'>
				<button className='tdc-step-btn' onClick={() => nudge(propKey, -1)}>−</button>
				<span className='tdc-step-val'>{value}</span>
				<button className='tdc-step-btn' onClick={() => nudge(propKey, 1)}>+</button>
			</div>
		</div>
	);

	// ─── Render ───────────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className='tdc-backdrop'>
				<div className='tdc-loading'>
					<Spinner size='3rem' />
					<p>Loading template…</p>
				</div>
			</div>
		);
	}

	const isPortrait = templateDetails?.orientation === 'Portrait';

	return (
		<div className='tdc-backdrop'>
			{/* Small-screen warning */}
			<div className='tdc-small-screen-warning'>
				<h4>Please use a higher-resolution device to view the template editor.</h4>
			</div>

			{/* Main editor shell */}
			<div className='tdc-main-container'>

				{/* ── Toolbar ── */}
				<div className='tdc-toolbar'>
					<button className='tdc-back-btn' onClick={() => navigate('/templates')}>
						<Icon icon='ArrowBack' size='sm' />
						Back
					</button>

					<div className='tdc-toolbar-center'>
						<div className='tdc-toolbar-title'>
							{templateDetails?.template_name || 'Template Creator'}
						</div>
						{templateDetails && (
							<div className='tdc-toolbar-subtitle'>
								{templateDetails.orientation}&nbsp;·&nbsp;
								{templateDetails.resolution_width}&nbsp;×&nbsp;
								{templateDetails.resolution_height}
							</div>
						)}
					</div>

					<div className='tdc-toolbar-actions'>
						<Button color='light' size='sm' icon='AddBox' onClick={addZone}>
							Add Zone
						</Button>
						<Button
							color='primary'
							size='sm'
							icon='Save'
							onClick={saveTemplate}
							isDisable={saving}>
							{saving ? <><Spinner size='sm' isSmall /> Saving…</> : 'Save Template'}
						</Button>
					</div>
				</div>

				{/* ── Canvas stage + properties panel ── */}
				<div className='tdc-body'>

					{/* Canvas area */}
					<div className='tdc-canvas-area'>
						<PreviewTvFrame
							className='tdc-tv-frame'
							monitorWidth={canvasWidth + 18}
							monitorHeight={canvasHeight + 35}
							screenWidth={canvasWidth}
							screenHeight={canvasHeight}
							portrait={isPortrait}
							flicker>
							<canvas id='tpl-detail-canvas' ref={canvasRef} />
						</PreviewTvFrame>
					</div>

					{/* Properties panel */}
					<aside className='tdc-panel'>
						<div className='tdc-panel-header'>
							<span className='tdc-panel-title'>Zone Properties</span>
							{selectedObject && (
								<span className='tdc-panel-sub'>
									{zoneProps.containerName || 'Unnamed Zone'}
								</span>
							)}
						</div>

						{selectedObject ? (
							<div className='tdc-props-scroll'>

								{/* Zone name */}
								<div className='tdc-prop-section'>
									<div className='tdc-prop-section-label'>Zone Name</div>
									<input
										className={`tdc-prop-input${nameError && !zoneProps.containerName?.trim() ? ' tdc-prop-input--error' : ''}`}
										placeholder='Enter zone name…'
										value={zoneProps.containerName}
										onChange={(e) => {
											setNameError(false);
											const name = e.target.value;
											setZoneProps((s) => ({ ...s, containerName: name }));
											selectedObject.set({ name });
										}}
									/>
									{nameError && !zoneProps.containerName?.trim() && (
										<div className='tdc-name-error'>Zone name is required</div>
									)}
								</div>

								{/* Dimensions */}
								<div className='tdc-prop-section'>
									<div className='tdc-prop-section-label'>Dimensions</div>
									<div className='tdc-prop-row2'>
										<Stepper label='Width (px)' value={zoneProps.width} propKey='width' />
										<Stepper label='Height (px)' value={zoneProps.height} propKey='height' />
									</div>
								</div>

								{/* Position */}
								<div className='tdc-prop-section'>
									<div className='tdc-prop-section-label'>Position</div>
									<div className='tdc-prop-row2'>
										<Stepper label='Left / X' value={zoneProps.left} propKey='left' />
										<Stepper label='Top / Y' value={zoneProps.top} propKey='top' />
									</div>
								</div>

								{/* Appearance */}
								<div className='tdc-prop-section'>
									<div className='tdc-prop-section-label'>Appearance</div>
									<div className='tdc-color-row'>
										<span className='tdc-color-label'>Fill Color</span>
										<button
											type='button'
											className='tdc-color-toggle'
											onClick={() => setShowFillPicker((p) => !p)}>
											<span
												className='tdc-color-swatch'
												style={{ background: zoneProps.color }}
											/>
										</button>
									</div>
									{showFillPicker && (
										<div className='tdc-picker-popover'>
											<div
												className='tdc-picker-overlay'
												onClick={() => setShowFillPicker(false)}
											/>
											<div className='tdc-picker-panel'>
												<SketchPicker
													color={fillColor}
													onChange={(c) => applyFillColor(getPickerColorString(c))}
													onChangeComplete={(c) => applyFillColor(getPickerColorString(c))}
												/>
											</div>
										</div>
									)}

									<div className='tdc-stepper-group' style={{ marginTop: '0.6rem' }}>
										<span className='tdc-stepper-label'>Border Radius</span>
										<div className='tdc-stepper'>
											<button className='tdc-step-btn' onClick={() => nudge('radius', -1)}>−</button>
											<span className='tdc-step-val'>{zoneProps.radius}</span>
											<button className='tdc-step-btn' onClick={() => nudge('radius', 1)}>+</button>
										</div>
									</div>
								</div>

								{/* Layer order */}
								{canvasObjects.length > 1 && (
									<div className='tdc-prop-section'>
										<div className='tdc-prop-section-label'>Layer Order</div>
										<div className='tdc-layer-btns'>
											<button
												className='tdc-layer-btn'
												type='button'
												title='Forward (Shift+Click: To Front)'
												onClick={handleForwardLayer}>
												<Icon icon='ArrowUpward' size='sm' /> Forward
											</button>
											<button
												className='tdc-layer-btn'
												type='button'
												title='Backward (Shift+Click: To Back)'
												onClick={handleBackwardLayer}>
												<Icon icon='ArrowDownward' size='sm' /> Backward
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className='tdc-empty'>
								<div className='tdc-empty-icon'>
									{canvasObjects.length === 0 ? '⊞' : '↖'}
								</div>
								<div className='tdc-empty-title'>
									{canvasObjects.length === 0 ? 'No zones yet' : 'Select a zone'}
								</div>
								<div className='tdc-empty-desc'>
									{canvasObjects.length === 0
										? 'Click "Add Zone" in the toolbar to start building.'
										: 'Click a zone on the canvas to edit its properties.'}
								</div>
							</div>
						)}

						<div className='tdc-dim-note'>
							<p>* All dimensions are in pixels</p>
							{canvasObjects.length === 0 && (
								<p>* Add at least one zone before saving</p>
							)}
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default TemplateDetailWorkspace;

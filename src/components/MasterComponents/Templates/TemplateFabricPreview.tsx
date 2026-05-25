/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import PreviewTvFrame from '../../StandardTvFrame/PreviewTvFrame';
import {
	clampZoneGeometryToCanvas,
	enrichParsedZonesWithConfiguration,
	ensureFabricRectLeftTopOrigin,
	normalizeFabricRectToCanvas,
	normalizeZoneGeometryForCanvas,
	parseQueueRefsFromAttribute,
	parseTemplateLayoutFromHtml,
	toFabricZoneGeometry,
} from '../../../utils/parseTemplateZones';
import type { PublicQueueStatus } from '../../../services/publicScreenApi';

const ZONE_LABEL_KEY = 'isZoneQueueLabel';
const ZONE_LABEL_FOR_KEY = 'zoneLabelFor';

export interface TemplateFabricPreviewProps {
	htmlContent: string;
	configuration?: Record<string, unknown> | string | null;
	orientation?: 'landscape' | 'portrait';
	queuesByUuid?: Record<string, PublicQueueStatus>;
	flicker?: boolean;
	className?: string;
	/** Public signage view: fill the host, no TV bezel frame. Default keeps PreviewTvFrame. */
	fullScreen?: boolean;
}

function isZoneRect(obj: any): boolean {
	return obj?.type === 'rect' && !obj?.[ZONE_LABEL_KEY];
}

function getZoneRects(fc: any): any[] {
	return (fc.getObjects?.() ?? []).filter(isZoneRect);
}

function resolveQueueForRect(
	rect: any,
	queuesByUuid: Record<string, PublicQueueStatus>,
): PublicQueueStatus | null {
	const allQueues = Object.values(queuesByUuid);

	const uuids: string[] = Array.isArray(rect.queueUuids) ? rect.queueUuids : [];
	for (const uuid of uuids) {
		const queue = queuesByUuid[uuid];
		if (queue) return queue;
	}

	const attr = rect.dataQueueIdsAttr as string | undefined;
	if (attr) {
		const { uuids: parsedUuids, ids: parsedIds } = parseQueueRefsFromAttribute(attr);
		for (const uuid of parsedUuids) {
			const queue = queuesByUuid[uuid];
			if (queue) return queue;
		}
		for (const id of parsedIds) {
			const queue = allQueues.find((q) => q.id === id);
			if (queue) return queue;
		}
	}

	const chipName = Array.isArray(rect.queueChipNames) ? rect.queueChipNames[0]?.trim() : '';
	if (chipName) {
		const byName = allQueues.find((q) => q.name === chipName);
		if (byName) return byName;
	}

	return null;
}

function resolveQueueForParsedZone(
	zone: {
		queueUuids: string[];
		queueIds: number[];
		queueChipNames: string[];
		name: string;
	},
	queuesByUuid: Record<string, PublicQueueStatus>,
): PublicQueueStatus | null {
	const allQueues = Object.values(queuesByUuid);

	for (const uuid of zone.queueUuids) {
		const queue = queuesByUuid[uuid];
		if (queue) return queue;
	}

	for (const id of zone.queueIds) {
		const queue = allQueues.find((q) => q.id === id);
		if (queue) return queue;
	}

	const chipName = zone.queueChipNames[0]?.trim();
	if (chipName) {
		const byName = allQueues.find((q) => q.name === chipName);
		if (byName) return byName;
	}

	return null;
}

function removeLiveOverlay(fc: any, rectId: string) {
	(fc.getObjects?.() ?? [])
		.filter((o: any) => o[ZONE_LABEL_FOR_KEY] === rectId)
		.forEach((o: any) => fc.remove(o));
}

/** Visual box of a zone rect on the Fabric canvas (canvas pixel space). */
function getZoneCanvasBounds(rect: any): {
	left: number;
	top: number;
	width: number;
	height: number;
	cx: number;
	cy: number;
} {
	rect.setCoords?.();

	const tl = rect.aCoords?.tl;
	const br = rect.aCoords?.br;
	let left: number;
	let top: number;
	let width: number;
	let height: number;

	if (tl && br) {
		left = Math.min(tl.x, br.x);
		top = Math.min(tl.y, br.y);
		width = Math.abs(br.x - tl.x);
		height = Math.abs(br.y - tl.y);
	} else {
		const bound = rect.getBoundingRect?.() ?? {
			left: rect.left ?? 0,
			top: rect.top ?? 0,
			width: rect.width ?? 0,
			height: rect.height ?? 0,
		};
		left = bound.left;
		top = bound.top;
		width = bound.width;
		height = bound.height;
	}

	const center =
		typeof rect.getCenterPoint === 'function' ? rect.getCenterPoint() : null;

	return {
		left,
		top,
		width,
		height,
		cx: center?.x ?? left + width / 2,
		cy: center?.y ?? top + height / 2,
	};
}

function syncLiveZoneOverlay(
	fc: any,
	rect: any,
	queuesByUuid: Record<string, PublicQueueStatus>,
) {
	import('fabric').then(({ Text }) => {
		removeLiveOverlay(fc, rect.id);

		const { left, top, width, height, cx, cy } = getZoneCanvasBounds(rect);

		const queue = resolveQueueForRect(rect, queuesByUuid);
		const queueName =
			queue?.name ??
			(Array.isArray(rect.queueChipNames) ? rect.queueChipNames[0] : undefined) ??
			rect.name ??
			'Queue';
		const statusLabel = queue?.status ?? 'inactive';
		const tokenDisplay = queue?.current_token?.token_display ?? '—';

		const minSide = Math.min(width, height);

		const nameSize = Math.max(14, Math.min(56, Math.round(minSide * 0.1)));
		const statusSize = Math.max(11, Math.min(32, Math.round(minSide * 0.065)));
		const tokenSize = Math.max(18, Math.min(96, Math.round(minSide * 0.18)));
		const gap = Math.max(6, Math.round(minSide * 0.03));

		const lines: { text: string; fontSize: number; fontWeight?: string }[] = [
			{ text: String(queueName), fontSize: nameSize, fontWeight: 'bold' },
			{ text: String(statusLabel), fontSize: statusSize },
			{ text: String(tokenDisplay), fontSize: tokenSize, fontWeight: 'bold' },
		];

		const blockHeight =
			lines.reduce((sum, line) => sum + line.fontSize, 0) + gap * (lines.length - 1);

		// Place each line directly at the zone center (no Fabric Group — groups were
		// shifting labels toward the seam between adjacent zones).
		let cursorY = cy - blockHeight / 2;

		lines.forEach((line) => {
			const obj = new Text(line.text, {
				left: cx,
				top: cursorY + line.fontSize / 2,
				originX: 'center',
				originY: 'center',
				fontSize: line.fontSize,
				fontWeight: line.fontWeight ?? 'normal',
				fill: '#ffffff',
				fontFamily: 'system-ui, sans-serif',
				textAlign: 'center',
				selectable: false,
				evented: false,
			});
			(obj as any)[ZONE_LABEL_KEY] = true;
			(obj as any)[ZONE_LABEL_FOR_KEY] = rect.id;
			fc.add(obj);
			if (typeof fc.bringObjectToFront === 'function') fc.bringObjectToFront(obj);
			cursorY += line.fontSize + gap;
		});

		fc.renderAll();
	});
}

function parseConfiguration(
	configuration?: Record<string, unknown> | string | null,
): Record<string, unknown> | null {
	if (!configuration) return null;
	if (typeof configuration === 'string') {
		try {
			return JSON.parse(configuration) as Record<string, unknown>;
		} catch {
			return null;
		}
	}
	return configuration;
}

/**
 * Read-only Fabric canvas preview — same rendering path as TemplateDetailWorkspace.
 */
const TemplateFabricPreview: React.FC<TemplateFabricPreviewProps> = ({
	htmlContent,
	configuration = null,
	orientation = 'landscape',
	queuesByUuid = {},
	flicker = false,
	className = '',
	fullScreen = false,
}) => {
	const reactId = useId().replace(/:/g, '');
	const canvasId = `tpl-fabric-preview-${reactId}`;
	const hostRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<any>(null);

	const htmlLayout = useMemo(
		() => parseTemplateLayoutFromHtml(htmlContent),
		[htmlContent],
	);
	const logicalW = htmlLayout?.width ?? 1920;
	const logicalH = htmlLayout?.height ?? 1080;
	const isPortrait = orientation === 'portrait';

	const [canvasSize, setCanvasSize] = useState({ cw: logicalW, ch: logicalH, sf: 1 });

	/** Overlay bounds: clamp only — normalize would expand valid half-width columns to full canvas. */
	const overlayZones = useMemo(() => {
		if (!htmlLayout?.zones.length) return [];
		const enriched = enrichParsedZonesWithConfiguration(htmlLayout.zones, configuration);
		return enriched.map((zone) => {
			const geom = clampZoneGeometryToCanvas(
				{
					left: zone.left,
					top: zone.top,
					width: zone.width,
					height: zone.height,
				},
				logicalW,
				logicalH,
			);
			return { ...zone, ...geom };
		});
	}, [htmlLayout, configuration, logicalW, logicalH]);

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return undefined;

		const update = () => {
			const bezelPadW = fullScreen ? 0 : 18;
			const bezelPadH = fullScreen ? 0 : 35;
			const availW = Math.max(200, host.clientWidth - bezelPadW);
			const availH = Math.max(120, host.clientHeight - bezelPadH);
			const sf = Math.min(availW / logicalW, availH / logicalH);
			setCanvasSize({
				sf,
				cw: Math.round(logicalW * sf),
				ch: Math.round(logicalH * sf),
			});
		};

		update();
		const observer = new ResizeObserver(update);
		observer.observe(host);
		return () => observer.disconnect();
	}, [logicalW, logicalH, fullScreen]);

	useEffect(() => {
		if (!canvasRef.current || !htmlLayout?.zones.length) return undefined;

		let cancelled = false;

		import('fabric').then(({ Canvas, Rect }) => {
			if (cancelled) return;

			if (fabricRef.current) {
				fabricRef.current.dispose();
				fabricRef.current = null;
			}

			const sf = canvasSize.sf || 1;
			const cw = canvasSize.cw;
			const ch = canvasSize.ch;

			const fc = new Canvas(canvasId, {
				width: cw,
				height: ch,
				backgroundColor: 'white',
				selection: false,
				renderOnAddRemove: true,
				preserveObjectStacking: true,
			});

			fabricRef.current = fc;

			const finishLoad = () => {
				getZoneRects(fc).forEach((rect) => {
					ensureFabricRectLeftTopOrigin(rect);
					rect.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });
					rect.setCoords?.();
				});
				// Fullscreen public display uses HTML overlays (flex center) — Fabric text
				// misaligns on adjacent zone columns.
				if (!fullScreen) {
					getZoneRects(fc).forEach((rect) => syncLiveZoneOverlay(fc, rect, queuesByUuid));
				}
				fc.renderAll();
			};

			const config = parseConfiguration(configuration);
			const fabricJson = config?.fabric_json;

			const loadZoneRects = (
				zones: {
					name?: string;
					queueUuids?: string[];
					queueChipNames?: string[];
					left: number;
					top: number;
					width: number;
					height: number;
					fill: string;
					stroke?: string | null;
					rx?: number;
					dataQueueIdsAttr?: string;
				}[],
			) => {
				zones.forEach((zone) => {
					const fabricGeom = toFabricZoneGeometry(
						{
							left: zone.left,
							top: zone.top,
							width: zone.width,
							height: zone.height,
						},
						logicalW,
						logicalH,
						sf,
					);
					const rect = new Rect({
						id: nanoid(),
						name: zone.name ?? '',
						queueUuids: zone.queueUuids ?? [],
						queueChipNames: zone.queueChipNames ?? [],
						dataQueueIdsAttr: zone.dataQueueIdsAttr,
						originX: 'left',
						originY: 'top',
						left: fabricGeom.left,
						top: fabricGeom.top,
						width: fabricGeom.width,
						height: fabricGeom.height,
						fill: zone.fill,
						stroke: zone.stroke ?? undefined,
						strokeUniform: true,
						rx: (zone.rx ?? 0) * sf,
						ry: (zone.rx ?? 0) * sf,
						selectable: false,
						evented: false,
					});
					fc.add(rect);
				});
				finishLoad();
			};

			const savedZones = config?.zones;

			const mapSavedZones = () =>
				loadZoneRects(
					(savedZones as any[]).map((zone: any) => {
						const geom = normalizeZoneGeometryForCanvas(
							{
								left: zone.left ?? 0,
								top: zone.top ?? 0,
								width: zone.width ?? 0,
								height: zone.height ?? 0,
							},
							logicalW,
							logicalH,
						);
						return {
							name: zone.name,
							queueUuids: zone.queue_uuids ?? [],
							queueChipNames: zone.queue_names ?? [],
							...geom,
							fill: zone.backgroundColor ?? '#ffffff',
							stroke: zone.border ? zone.borderColor ?? 'black' : null,
							rx: zone.borderRadius ?? 0,
						};
					}),
				);

			if (htmlLayout.zones.length > 0) {
				const enrichedZones = enrichParsedZonesWithConfiguration(
					htmlLayout.zones,
					configuration,
				);
				loadZoneRects(
					enrichedZones.map((zone) => {
						const queueIdsAttr =
							zone.queueUuids.length > 0
								? zone.queueUuids.join(',')
								: zone.queueIds.join(',');
						const geom = fullScreen
							? clampZoneGeometryToCanvas(
									{
										left: zone.left,
										top: zone.top,
										width: zone.width,
										height: zone.height,
									},
									logicalW,
									logicalH,
								)
							: normalizeZoneGeometryForCanvas(
									{
										left: zone.left,
										top: zone.top,
										width: zone.width,
										height: zone.height,
									},
									logicalW,
									logicalH,
								);
						return {
							name: zone.name,
							queueUuids: zone.queueUuids.slice(0, 1),
							queueChipNames: zone.queueChipNames.slice(0, 1),
							dataQueueIdsAttr: queueIdsAttr,
							...geom,
							fill: zone.backgroundColor,
							stroke: zone.border ? zone.borderColor : null,
							rx: zone.borderRadius,
						};
					}),
				);
				return;
			}

			if (Array.isArray(savedZones) && savedZones.length > 0) {
				mapSavedZones();
				return;
			}

			// Do not load fabric_json when html_content defines zones (stale state breaks layout).
			if (fabricJson && !htmlContent.includes('queue-zone')) {
				fc.loadFromJSON(fabricJson, () => {
					getZoneRects(fc).forEach((rect) => {
						rect.setCoords?.();
						normalizeFabricRectToCanvas(rect, sf, logicalW, logicalH);
					});
					finishLoad();
				});
				return;
			}
		});

		return () => {
			cancelled = true;
			fabricRef.current?.dispose();
			fabricRef.current = null;
		};
	}, [htmlContent, configuration, canvasId, canvasSize, htmlLayout, fullScreen, queuesByUuid]);

	useEffect(() => {
		const fc = fabricRef.current;
		if (!fc || fullScreen) return;
		getZoneRects(fc).forEach((rect) => {
			rect.setCoords?.();
			syncLiveZoneOverlay(fc, rect, queuesByUuid);
		});
	}, [queuesByUuid, fullScreen]);

	if (!htmlLayout?.zones.length) {
		return <div className='screen-public-fallback'>No template zones configured</div>;
	}

	const hostClassName = [
		'template-fabric-preview-host',
		fullScreen ? 'template-fabric-preview-host--fullscreen' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	if (fullScreen) {
		const sf = canvasSize.sf || 1;

		return (
			<div ref={hostRef} className={hostClassName}>
				<div
					className={`template-fabric-preview-canvas-wrap${flicker ? ' template-fabric-preview-canvas-wrap--live' : ''}`}
					style={{ width: canvasSize.cw, height: canvasSize.ch }}>
					<canvas id={canvasId} ref={canvasRef} />
					{overlayZones.map((zone, index) => {
						const queue = resolveQueueForParsedZone(zone, queuesByUuid);
						const queueLabel =
							queue?.name ??
							zone.queueChipNames[0] ??
							zone.name ??
							'Queue';
						const statusLabel = queue?.status ?? 'inactive';
						const tokenDisplay = queue?.current_token?.token_display ?? '—';
						const overlayW = Math.max(1, Math.round(zone.width * sf));
						const overlayH = Math.max(1, Math.round(zone.height * sf));
						const minSide = Math.min(overlayW, overlayH);
						const nameSize = Math.max(14, Math.min(56, Math.round(minSide * 0.1)));
						const statusSize = Math.max(11, Math.min(32, Math.round(minSide * 0.065)));
						const tokenSize = Math.max(18, Math.min(96, Math.round(minSide * 0.18)));

						return (
							<div
								key={`${zone.name}-${index}`}
								className='screen-zone-live-overlay'
								style={{
									left: Math.round(zone.left * sf),
									top: Math.round(zone.top * sf),
									width: overlayW,
									height: overlayH,
								}}>
								<div className='screen-zone-live-overlay__content'>
									<div
										className='screen-zone-live-overlay__queue'
										style={{ fontSize: nameSize }}>
										{queueLabel}
									</div>
									{tokenDisplay === '—' ? (
										<span
											className='screen-zone-live-overlay__token-bar'
											style={{ width: Math.max(24, Math.round(minSide * 0.2)) }}
										/>
									) : (
										<div
											className='screen-zone-live-overlay__token'
											style={{ fontSize: tokenSize }}>
											{tokenDisplay}
										</div>
									)}
									<div
										className='screen-zone-live-overlay__status'
										style={{ fontSize: statusSize }}>
										{statusLabel}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div ref={hostRef} className={hostClassName}>
			<PreviewTvFrame
				className='template-fabric-preview-frame'
				monitorWidth={canvasSize.cw + 18}
				monitorHeight={canvasSize.ch + 35}
				screenWidth={canvasSize.cw}
				screenHeight={canvasSize.ch}
				portrait={isPortrait}
				flicker={flicker}>
				<canvas id={canvasId} ref={canvasRef} />
			</PreviewTvFrame>
		</div>
	);
};

export default TemplateFabricPreview;

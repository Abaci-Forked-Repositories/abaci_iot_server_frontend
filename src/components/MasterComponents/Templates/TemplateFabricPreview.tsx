/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import PreviewTvFrame from '../../StandardTvFrame/PreviewTvFrame';
import {
	normalizeZoneGeometryForCanvas,
	parseQueueRefsFromAttribute,
	parseTemplateLayoutFromHtml,
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

function removeLiveOverlay(fc: any, rectId: string) {
	(fc.getObjects?.() ?? [])
		.filter((o: any) => o[ZONE_LABEL_FOR_KEY] === rectId)
		.forEach((o: any) => fc.remove(o));
}

function syncLiveZoneOverlay(
	fc: any,
	rect: any,
	queuesByUuid: Record<string, PublicQueueStatus>,
) {
	import('fabric').then(({ Text, Group }) => {
		removeLiveOverlay(fc, rect.id);

		rect.setCoords?.();
		const bound = rect.getBoundingRect?.() ?? {
			left: rect.left ?? 0,
			top: rect.top ?? 0,
			width: rect.width ?? 0,
			height: rect.height ?? 0,
		};

		const queue = resolveQueueForRect(rect, queuesByUuid);
		const queueName =
			queue?.name ??
			(Array.isArray(rect.queueChipNames) ? rect.queueChipNames[0] : undefined) ??
			rect.name ??
			'Queue';
		const statusLabel = queue?.status ?? 'inactive';
		const tokenDisplay = queue?.current_token?.token_display ?? '—';

		const cx = bound.left + bound.width / 2;
		const cy = bound.top + bound.height / 2;
		const minSide = Math.min(bound.width, bound.height);

		const nameSize = Math.max(14, Math.min(56, Math.round(minSide * 0.1)));
		const statusSize = Math.max(11, Math.min(32, Math.round(minSide * 0.065)));
		const tokenSize = Math.max(18, Math.min(96, Math.round(minSide * 0.18)));
		const gap = Math.max(6, Math.round(minSide * 0.03));

		const lines: { text: string; fontSize: number; fontWeight?: string }[] = [
			{ text: queueName, fontSize: nameSize, fontWeight: 'bold' },
			{ text: statusLabel, fontSize: statusSize },
			{ text: tokenDisplay, fontSize: tokenSize, fontWeight: 'bold' },
		];

		const blockHeight =
			lines.reduce((sum, line) => sum + line.fontSize, 0) + gap * (lines.length - 1);
		let cursorY = cy - blockHeight / 2;

		const textObjects = lines.map((line) => {
			const obj = new Text(line.text, {
				left: cx,
				top: cursorY + line.fontSize / 2,
				originX: 'center',
				originY: 'center',
				fontSize: line.fontSize,
				fontWeight: line.fontWeight ?? 'normal',
				fill: '#ffffff',
				fontFamily: 'system-ui, sans-serif',
				selectable: false,
				evented: false,
			});
			(obj as any)[ZONE_LABEL_KEY] = true;
			cursorY += line.fontSize + gap;
			return obj;
		});

		const overlay = new Group(textObjects, {
			left: cx,
			top: cy,
			originX: 'center',
			originY: 'center',
			selectable: false,
			evented: false,
		});
		(overlay as any)[ZONE_LABEL_KEY] = true;
		(overlay as any)[ZONE_LABEL_FOR_KEY] = rect.id;

		fc.add(overlay);
		if (typeof fc.bringObjectToFront === 'function') fc.bringObjectToFront(overlay);
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

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return undefined;

		const update = () => {
			const bezelPadW = 18;
			const bezelPadH = 35;
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
	}, [logicalW, logicalH]);

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
					rect.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });
					rect.setCoords?.();
				});
				getZoneRects(fc).forEach((rect) => syncLiveZoneOverlay(fc, rect, queuesByUuid));
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
					const rect = new Rect({
						id: nanoid(),
						name: zone.name ?? '',
						queueUuids: zone.queueUuids ?? [],
						queueChipNames: zone.queueChipNames ?? [],
						dataQueueIdsAttr: zone.dataQueueIdsAttr,
						left: zone.left * sf,
						top: zone.top * sf,
						width: Math.max(8, zone.width * sf),
						height: Math.max(8, zone.height * sf),
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
			if (Array.isArray(savedZones) && savedZones.length > 0) {
				loadZoneRects(
					savedZones.map((zone: any) => {
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
				return;
			}

			if (fabricJson) {
				fc.loadFromJSON(fabricJson, finishLoad);
				return;
			}

			loadZoneRects(
				htmlLayout.zones.map((zone) => {
					const queueIdsAttr =
						zone.queueUuids.length > 0
							? zone.queueUuids.join(',')
							: zone.queueIds.join(',');
					const geom = normalizeZoneGeometryForCanvas(
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
		});

		return () => {
			cancelled = true;
			fabricRef.current?.dispose();
			fabricRef.current = null;
		};
	}, [htmlContent, configuration, canvasId, canvasSize, htmlLayout]);

	useEffect(() => {
		const fc = fabricRef.current;
		if (!fc) return;
		getZoneRects(fc).forEach((rect) => {
			rect.setCoords?.();
			syncLiveZoneOverlay(fc, rect, queuesByUuid);
		});
	}, [queuesByUuid]);

	if (!htmlLayout?.zones.length) {
		return <div className='screen-public-fallback'>No template zones configured</div>;
	}

	return (
		<div ref={hostRef} className={`template-fabric-preview-host ${className}`.trim()}>
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

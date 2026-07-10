import React, { useEffect, useRef } from 'react';
import type { PageSnapshot } from './paperFlipPageFace';
import {
	drawPaperFlipCurlFrame,
	PAPER_FLIP_CANVAS_CURL_MS,
} from './paperFlipCanvasCurlEngine';
import { renderPaperFlipPageCanvas } from './paperFlipCanvasPage';

export interface PaperFlipCanvasCurlProps {
	from: PageSnapshot;
	to: PageSnapshot;
	flipSeq: number;
	stageWidth: number;
	stageHeight: number;
	onReady: () => void;
	onComplete: () => void;
}

const PaperFlipCanvasCurl: React.FC<PaperFlipCanvasCurlProps> = ({
	from,
	to,
	flipSeq,
	stageWidth,
	stageHeight,
	onReady,
	onComplete,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		const canvas = canvasRef.current;

		if (!canvas || stageWidth < 1 || stageHeight < 1) {
			return undefined;
		}

		const width = stageWidth;
		const height = stageHeight;

		const underCanvas = renderPaperFlipPageCanvas(to, width, height);
		const overCanvas = renderPaperFlipPageCanvas(from, width, height);

		const dpr = Math.min(window.devicePixelRatio || 1, 3);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			onComplete();
			return undefined;
		}

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		// Paint the first frame before revealing the canvas overlay.
		drawPaperFlipCurlFrame(ctx, underCanvas, overCanvas, width, height, 0);
		onReady();

		const start = performance.now();

		const tick = (now: number) => {
			if (cancelled) return;
			const raw = Math.min(1, (now - start) / PAPER_FLIP_CANVAS_CURL_MS);
			drawPaperFlipCurlFrame(ctx, underCanvas, overCanvas, width, height, raw);
			if (raw < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				onComplete();
			}
		};

		rafRef.current = requestAnimationFrame(tick);

		return () => {
			cancelled = true;
			if (rafRef.current != null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [flipSeq, from, to, stageWidth, stageHeight, onReady, onComplete]);

	return <canvas ref={canvasRef} className='tdc-pf-canvas-curl' aria-hidden='true' />;
};

export default PaperFlipCanvasCurl;

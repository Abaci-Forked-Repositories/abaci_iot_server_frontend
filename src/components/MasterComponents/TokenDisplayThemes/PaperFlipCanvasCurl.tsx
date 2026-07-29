import React, { useLayoutEffect, useRef } from 'react';
import type { PageSnapshot } from './paperFlipPageFace';
import {
	drawPaperFlipCurlFrame,
	PAPER_FLIP_CANVAS_CURL_MS,
} from './paperFlipCanvasCurlEngine';
import {
	renderPaperFlipPageCanvas,
	setupPaperFlipCanvasSize,
} from './paperFlipCanvasPage';

export interface PaperFlipCanvasCurlProps {
	from: PageSnapshot;
	to: PageSnapshot;
	flipSeq: number;
	stageWidth: number;
	stageHeight: number;
	onComplete: () => void;
}

const PaperFlipCanvasCurl: React.FC<PaperFlipCanvasCurlProps> = ({
	from,
	to,
	flipSeq,
	stageWidth,
	stageHeight,
	onComplete,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef<number | null>(null);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	useLayoutEffect(() => {
		let cancelled = false;
		const canvas = canvasRef.current;

		if (!canvas || stageWidth < 1 || stageHeight < 1) {
			return undefined;
		}

		const width = Math.round(stageWidth);
		const height = Math.round(stageHeight);

		const underCanvas = renderPaperFlipPageCanvas(to, width, height);
		const overCanvas = renderPaperFlipPageCanvas(from, width, height);

		const ctx = setupPaperFlipCanvasSize(canvas, width, height);
		if (!ctx) {
			onCompleteRef.current();
			return undefined;
		}

		drawPaperFlipCurlFrame(ctx, underCanvas, overCanvas, width, height, 0);

		const start = performance.now();

		const tick = (now: number) => {
			if (cancelled) return;
			const raw = Math.min(1, (now - start) / PAPER_FLIP_CANVAS_CURL_MS);
			drawPaperFlipCurlFrame(ctx, underCanvas, overCanvas, width, height, raw);
			if (raw < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				onCompleteRef.current();
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
	}, [flipSeq, from, to, stageWidth, stageHeight]);

	return <canvas ref={canvasRef} className='tdc-pf-canvas-curl' aria-hidden='true' />;
};

export default PaperFlipCanvasCurl;

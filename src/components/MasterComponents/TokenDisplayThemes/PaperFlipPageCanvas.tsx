import React, { useLayoutEffect, useRef } from 'react';
import type { PageSnapshot } from './paperFlipPageFace';
import {
	paintPaperFlipPageToCanvas,
	setupPaperFlipCanvasSize,
} from './paperFlipCanvasPage';

export interface PaperFlipPageCanvasProps {
	page: PageSnapshot;
	width: number;
	height: number;
}

/** Static Paper Flip page — same canvas renderer used by the curl animation. */
const PaperFlipPageCanvas: React.FC<PaperFlipPageCanvasProps> = ({
	page,
	width,
	height,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || width < 1 || height < 1) return;

		const ctx = setupPaperFlipCanvasSize(canvas, width, height);
		if (!ctx) return;

		paintPaperFlipPageToCanvas(ctx, page, width, height);
	}, [page, width, height]);

	return (
		<canvas
			ref={canvasRef}
			className='tdc-pf-page-canvas'
			aria-hidden='true'
		/>
	);
};

export default PaperFlipPageCanvas;

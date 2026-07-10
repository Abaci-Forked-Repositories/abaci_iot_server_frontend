export const PAPER_FLIP_CANVAS_CURL_MS = 1250;

const PAPER_BACK = '#ebe4d8';
const PAPER_BACK_LINE = 'rgba(0, 0, 0, 0.06)';

function clamp01(v: number): number {
	return Math.min(1, Math.max(0, v));
}

function easeInOutCubic(t: number): number {
	const p = clamp01(t);
	return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function drawPaperBack(ctx: CanvasRenderingContext2D, width: number, height: number) {
	ctx.fillStyle = PAPER_BACK;
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = PAPER_BACK_LINE;
	ctx.lineWidth = 1;
	const step = Math.max(10, height * 0.05);
	for (let y = step; y < height; y += step) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

/**
 * Corner-hinged page turn from the fixed top-right point (width, 0).
 *
 * Previous geometry drew a crease from (width, 0) to (width·(1−p), height·p).
 * At p≈0.5 that crease crosses the page centre, so the fold looked like it was
 * happening in the middle of the token instead of peeling from the corner.
 *
 * This version rotates the entire old page around the top-right hinge with a
 * light skew so the motion reads as a corner peel, not a centre split.
 */
export function drawPaperFlipCurlFrame(
	ctx: CanvasRenderingContext2D,
	bottom: CanvasImageSource,
	top: CanvasImageSource,
	width: number,
	height: number,
	rawProgress: number,
) {
	const progress = easeInOutCubic(rawProgress);
	const p = clamp01(progress);

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(bottom, 0, 0, width, height);

	if (p < 0.001) {
		ctx.drawImage(top, 0, 0, width, height);
		return;
	}

	// Soft shadow on the newly revealed page, radiating from the top-right hinge.
	if (p > 0.02) {
		const alpha = Math.min(0.42, 0.06 + p * 0.34);
		const grad = ctx.createRadialGradient(width, 0, 0, width, 0, width * 0.92);
		grad.addColorStop(0, `rgba(10, 6, 3, ${alpha})`);
		grad.addColorStop(0.45, `rgba(10, 6, 3, ${alpha * 0.35})`);
		grad.addColorStop(1, 'rgba(10, 6, 3, 0)');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, width, height);
	}

	const angle = Math.pow(p, 0.9) * (Math.PI / 2);
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	ctx.save();

	// Hinge locked at top-right corner.
	ctx.translate(width, 0);
	ctx.scale(Math.max(0.04, cos), 1 - sin * 0.1);
	ctx.transform(1, sin * 0.16, 0, 1, 0, 0);
	ctx.translate(-width, 0);

	if (angle > Math.PI * 0.5) {
		drawPaperBack(ctx, width, height);
	} else {
		ctx.drawImage(top, 0, 0, width, height);
	}

	// Leading edge shadow on the curling sheet.
	if (p > 0.05 && angle <= Math.PI * 0.5) {
		const edgeX = width * (1 - cos);
		const edgeGrad = ctx.createLinearGradient(edgeX - 18, 0, edgeX + 6, 0);
		edgeGrad.addColorStop(0, 'rgba(8, 5, 2, 0)');
		edgeGrad.addColorStop(1, `rgba(8, 5, 2, ${0.22 * p})`);
		ctx.fillStyle = edgeGrad;
		ctx.fillRect(Math.max(0, edgeX - 20), 0, 26, height);
	}

	ctx.restore();
}

export function paperFlipCanvasCurlEase(raw: number): number {
	return easeInOutCubic(raw);
}

export const PAPER_FLIP_CANVAS_CURL_MS = 1400;

const PAPER_BACK = '#ebe4d8';
const PAPER_BACK_DEEP = '#d9cfbf';

type Pt = { x: number; y: number };

function clamp01(v: number): number {
	return Math.min(1, Math.max(0, v));
}

function clamp(v: number, lo: number, hi: number): number {
	return Math.max(lo, Math.min(hi, v));
}

function easeInOutCubic(t: number): number {
	const p = clamp01(t);
	return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** Two-phase ease: slow dog-ear lift, then fuller page sweep. */
function curlEase(raw: number): number {
	const t = clamp01(raw);
	if (t < 0.22) {
		return easeInOutCubic(t / 0.22) * 0.12;
	}
	return 0.12 + easeInOutCubic((t - 0.22) / 0.78) * 0.88;
}

function reflectPoint(p: Pt, a: Pt, b: Pt): Pt {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len2 = dx * dx + dy * dy || 1;
	const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
	const projX = a.x + t * dx;
	const projY = a.y + t * dy;
	return { x: 2 * projX - p.x, y: 2 * projY - p.y };
}

/**
 * Fold-line endpoints for a bottom-right page turn.
 * `d` travels along the bottom then left (point A) and right then top (point B).
 */
function foldEndpoints(w: number, h: number, d: number): { a: Pt; b: Pt } {
	const travel = Math.max(0, d);

	const a: Pt =
		travel <= w
			? { x: w - travel, y: h }
			: { x: 0, y: clamp(h - (travel - w), 0, h) };

	const b: Pt =
		travel <= h
			? { x: w, y: h - travel }
			: { x: clamp(w - (travel - h), 0, w), y: 0 };

	return { a, b };
}

function drawPaperBack(ctx: CanvasRenderingContext2D, width: number, height: number) {
	ctx.fillStyle = PAPER_BACK;
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
	ctx.lineWidth = 1;
	const step = Math.max(10, height * 0.08);
	for (let y = step; y < height; y += step) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

/**
 * Bottom-right corner curl → full page turn.
 *
 * Phase 1: small dog-ear peel from the BR corner (matches the static fold cue).
 * Phase 2: fold line sweeps across the sheet, revealing the next page underneath.
 */
export function drawPaperFlipCurlFrame(
	ctx: CanvasRenderingContext2D,
	bottom: CanvasImageSource,
	top: CanvasImageSource,
	width: number,
	height: number,
	rawProgress: number,
) {
	const p = curlEase(rawProgress);

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(bottom, 0, 0, width, height);

	if (p < 0.001) {
		ctx.drawImage(top, 0, 0, width, height);
		return;
	}

	if (p >= 0.995) {
		return;
	}

	const maxTravel = width + height;
	const d = Math.max(8, p * maxTravel * 1.02);
	const { a, b } = foldEndpoints(width, height, d);
	const corner: Pt = { x: width, y: height };
	const tip = reflectPoint(corner, a, b);

	// Shadow cast onto the newly revealed page under the curling flap.
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(corner.x, corner.y);
	ctx.lineTo(b.x, b.y);
	ctx.closePath();
	ctx.clip();
	const shadowAlpha = Math.min(0.38, 0.08 + p * 0.34);
	const midX = (a.x + b.x + tip.x) / 3;
	const midY = (a.y + b.y + tip.y) / 3;
	const grad = ctx.createRadialGradient(
		midX,
		midY,
		0,
		midX,
		midY,
		Math.max(width, height) * 0.55,
	);
	grad.addColorStop(0, `rgba(10, 6, 3, ${shadowAlpha})`);
	grad.addColorStop(0.55, `rgba(10, 6, 3, ${shadowAlpha * 0.35})`);
	grad.addColorStop(1, 'rgba(10, 6, 3, 0)');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, width, height);
	ctx.restore();

	// Remaining flat portion of the old page (page rect minus peeled BR region).
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0, 0);
	if (b.y <= 0.5) {
		ctx.lineTo(b.x, b.y);
	} else {
		ctx.lineTo(width, 0);
		ctx.lineTo(b.x, b.y);
	}
	ctx.lineTo(a.x, a.y);
	if (a.x <= 0.5) {
		ctx.lineTo(0, a.y);
	} else {
		ctx.lineTo(0, height);
	}
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(top, 0, 0, width, height);
	ctx.restore();

	// Curling flap — underside of the peeled corner (paper back + soft cylinder).
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(tip.x, tip.y);
	ctx.lineTo(b.x, b.y);
	ctx.closePath();
	ctx.clip();

	const flapMinX = Math.min(a.x, b.x, tip.x) - 4;
	const flapMinY = Math.min(a.y, b.y, tip.y) - 4;
	const flapMaxX = Math.max(a.x, b.x, tip.x) + 4;
	const flapMaxY = Math.max(a.y, b.y, tip.y) + 4;

	const flapGrad = ctx.createLinearGradient(a.x, a.y, tip.x, tip.y);
	flapGrad.addColorStop(0, PAPER_BACK_DEEP);
	flapGrad.addColorStop(0.28, PAPER_BACK);
	flapGrad.addColorStop(0.55, '#f6efe6');
	flapGrad.addColorStop(0.82, PAPER_BACK);
	flapGrad.addColorStop(1, PAPER_BACK_DEEP);
	ctx.fillStyle = flapGrad;
	ctx.fillRect(flapMinX, flapMinY, flapMaxX - flapMinX, flapMaxY - flapMinY);

	// Soft cylinder shade along the fold (reads as paper thickness).
	const creaseGrad = ctx.createLinearGradient(a.x, a.y, tip.x, tip.y);
	creaseGrad.addColorStop(0, 'rgba(28, 20, 10, 0.22)');
	creaseGrad.addColorStop(0.18, 'rgba(28, 20, 10, 0.06)');
	creaseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
	creaseGrad.addColorStop(1, 'rgba(28, 20, 10, 0.1)');
	ctx.fillStyle = creaseGrad;
	ctx.fillRect(flapMinX, flapMinY, flapMaxX - flapMinX, flapMaxY - flapMinY);

	// Faint ruled lines on the underside for paper feel.
	ctx.strokeStyle = 'rgba(28, 25, 23, 0.06)';
	ctx.lineWidth = 1;
	const step = Math.max(10, height * 0.06);
	for (let y = flapMinY; y < flapMaxY; y += step) {
		ctx.beginPath();
		ctx.moveTo(flapMinX, y);
		ctx.lineTo(flapMaxX, y);
		ctx.stroke();
	}
	ctx.restore();

	// Fold crease + leading-edge highlight.
	ctx.save();
	ctx.strokeStyle = `rgba(28, 20, 10, ${0.18 + p * 0.2})`;
	ctx.lineWidth = Math.max(1, width * 0.0015);
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.stroke();

	ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + (1 - p) * 0.2})`;
	ctx.lineWidth = Math.max(1, width * 0.0012);
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(tip.x, tip.y);
	ctx.lineTo(b.x, b.y);
	ctx.stroke();
	ctx.restore();
}

export function paperFlipCanvasCurlEase(raw: number): number {
	return curlEase(raw);
}

/** @deprecated kept for callers that still paint a solid back face */
export function drawPaperFlipPaperBack(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
) {
	drawPaperBack(ctx, width, height);
}

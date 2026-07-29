import type { PageSnapshot } from './paperFlipPageFace';

const PAPER = '#faf6ee';
const INK = '#1c1917';
const INK_SUB = 'rgba(28, 25, 23, 0.58)';
const RULE = 'rgba(28, 25, 23, 0.1)';

const STATUS_COLORS: Record<string, string> = {
	serving: '#166534',
	waiting: '#92400e',
	completed: '#1d4ed8',
	cancelled: '#991b1b',
	'no-show': '#991b1b',
};

const SERIF =
	"'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', serif";

export function setupPaperFlipCanvasSize(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
): CanvasRenderingContext2D | null {
	const w = Math.round(width);
	const h = Math.round(height);
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = Math.round(w * dpr);
	canvas.height = Math.round(h * dpr);
	canvas.style.width = `${w}px`;
	canvas.style.height = `${h}px`;

	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	return ctx;
}

/** Single source of truth — paints the Paper Flip page to any canvas. */
export function paintPaperFlipPageToCanvas(
	ctx: CanvasRenderingContext2D,
	page: PageSnapshot,
	width: number,
	height: number,
) {
	const w = Math.round(width);
	const h = Math.round(height);
	ctx.clearRect(0, 0, w, h);

	// Paper base
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, w, h);

	// Soft paper grain
	const grain = ctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, w * 0.8);
	grain.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
	grain.addColorStop(1, 'transparent');
	ctx.fillStyle = grain;
	ctx.fillRect(0, 0, w, h);

	// Ruled notebook lines
	ctx.strokeStyle = 'rgba(28, 25, 23, 0.055)';
	ctx.lineWidth = 1;
	const lineStep = Math.max(14, h * 0.09);
	for (let y = lineStep; y < h; y += lineStep) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
		ctx.stroke();
	}

	// Spine shadow (left edge)
	const spine = ctx.createLinearGradient(0, 0, w * 0.04, 0);
	spine.addColorStop(0, 'rgba(0, 0, 0, 0.12)');
	spine.addColorStop(1, 'transparent');
	ctx.fillStyle = spine;
	ctx.fillRect(0, 0, w * 0.04, h);

	// Red margin line
	const marginX = w * 0.08;
	ctx.strokeStyle = 'rgba(185, 70, 55, 0.28)';
	ctx.beginPath();
	ctx.moveTo(marginX, 0);
	ctx.lineTo(marginX, h);
	ctx.stroke();

	// Header rule + serving point (left) + status (right)
	const headerH = h * 0.14;
	const headerPadX = w * 0.1;
	const headerY = headerH * 0.52;
	ctx.strokeStyle = RULE;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, headerH);
	ctx.lineTo(w, headerH);
	ctx.stroke();

	const metaSize = Math.max(9, w * 0.032);
	ctx.font = `600 ${metaSize}px ${SERIF}`;
	ctx.textBaseline = 'middle';

	if (page.subtitle) {
		ctx.fillStyle = INK_SUB;
		ctx.textAlign = 'left';
		ctx.fillText(page.subtitle.toUpperCase(), headerPadX, headerY, w * 0.5);
	}

	const statusColor = STATUS_COLORS[page.statusModifier] ?? INK_SUB;
	const statusSize = Math.max(9, w * 0.034);
	ctx.font = `600 ${statusSize}px ${SERIF}`;
	ctx.fillStyle = statusColor;

	const dotR = statusSize * 0.22;
	const label = page.statusLabel.toUpperCase();
	const labelW = ctx.measureText(label).width;
	const statusEndX = w - w * 0.06;
	const labelX = statusEndX - labelW;
	const dotX = labelX - statusSize * 0.35 - dotR;

	ctx.beginPath();
	ctx.arc(dotX, headerY, dotR, 0, Math.PI * 2);
	ctx.fill();

	ctx.textAlign = 'left';
	ctx.fillText(label, labelX, headerY);

	// Token
	const charCount = Math.max(1, page.token.length);
	const tokenSize = Math.min(
		w * 0.44,
		(w * 0.88) / (charCount * 0.52 + 0.55),
		h * 0.5,
	);
	ctx.fillStyle = INK;
	ctx.font = `700 ${tokenSize}px ${SERIF}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(page.token, w / 2, headerH + (h - headerH) * 0.5);

	// Soft dog-ear cue
	const ear = Math.min(w, h) * 0.05;
	ctx.beginPath();
	ctx.moveTo(w - ear, h);
	ctx.lineTo(w, h - ear);
	ctx.lineTo(w, h);
	ctx.closePath();
	const earGrad = ctx.createLinearGradient(w - ear, h - ear, w, h);
	earGrad.addColorStop(0, 'rgba(240, 234, 224, 0.5)');
	earGrad.addColorStop(1, 'rgba(218, 206, 188, 0.35)');
	ctx.fillStyle = earGrad;
	ctx.fill();
}

/** Offscreen page bitmap for the curl animation. */
export function renderPaperFlipPageCanvas(
	page: PageSnapshot,
	width: number,
	height: number,
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(width);
	canvas.height = Math.round(height);
	const ctx = canvas.getContext('2d');
	if (!ctx) return canvas;
	paintPaperFlipPageToCanvas(ctx, page, width, height);
	return canvas;
}

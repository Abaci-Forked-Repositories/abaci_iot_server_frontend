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

/** Paint a Paper Flip page snapshot to canvas — avoids html2canvas capture issues. */
export function renderPaperFlipPageCanvas(
	page: PageSnapshot,
	width: number,
	height: number,
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) return canvas;

	// Paper base + ruled lines
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, width, height);

	ctx.strokeStyle = 'rgba(28, 25, 23, 0.035)';
	ctx.lineWidth = 1;
	const lineStep = Math.max(12, height * 0.12);
	for (let y = lineStep; y < height; y += lineStep) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}

	// Spine shadow (left edge)
	const spine = ctx.createLinearGradient(0, 0, width * 0.06, 0);
	spine.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
	spine.addColorStop(1, 'transparent');
	ctx.fillStyle = spine;
	ctx.fillRect(0, 0, width * 0.06, height);

	// Header rule + subtitle
	const headerH = height * 0.14;
	ctx.strokeStyle = RULE;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, headerH);
	ctx.lineTo(width, headerH);
	ctx.stroke();

	if (page.subtitle) {
		ctx.fillStyle = INK_SUB;
		ctx.font = `600 ${Math.max(11, width * 0.042)}px ${SERIF}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(page.subtitle.toUpperCase(), width / 2, headerH * 0.52);
	}

	// Token — match DOM min(88cqw / (chars * 0.52 + 0.55), 44cqh) proportions
	const charCount = Math.max(1, page.token.length);
	const tokenSize = Math.min(
		width * 0.44,
		(width * 0.88) / (charCount * 0.52 + 0.55),
		height * 0.44,
	);
	ctx.fillStyle = INK;
	ctx.font = `700 ${tokenSize}px ${SERIF}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(page.token, width / 2, height * 0.5);

	// Footer rule + status
	const footerY = height * 0.86;
	ctx.strokeStyle = RULE;
	ctx.beginPath();
	ctx.moveTo(0, footerY);
	ctx.lineTo(width, footerY);
	ctx.stroke();

	const statusColor = STATUS_COLORS[page.statusModifier] ?? INK_SUB;
	const statusSize = Math.max(11, width * 0.045);
	ctx.font = `600 ${statusSize}px ${SERIF}`;
	ctx.fillStyle = statusColor;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const dotR = statusSize * 0.22;
	const label = page.statusLabel.toUpperCase();
	const labelW = ctx.measureText(label).width;
	const totalW = dotR * 2 + statusSize * 0.35 + labelW;
	const startX = width / 2 - totalW / 2;

	ctx.beginPath();
	ctx.arc(startX + dotR, footerY + height * 0.05, dotR, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = statusColor;
	ctx.textAlign = 'left';
	ctx.fillText(label, startX + dotR * 2 + statusSize * 0.35, footerY + height * 0.05);

	return canvas;
}

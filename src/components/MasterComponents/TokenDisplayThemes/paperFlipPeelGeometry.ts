export const PAPER_FLIP_PEEL_MS = 1200;

function clamp01(v: number): number {
	return Math.min(1, Math.max(0, v));
}

export function paperFlipPeelEase(t: number): number {
	const p = clamp01(t);
	return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/**
 * Single-sheet corner turn — hinge at top-right (100%, 0).
 * Positive rotateX / rotateY peel the page OUT toward the viewer (not inward).
 */
export function cornerPageTurnTransform(rawProgress: number) {
	const lift = Math.pow(paperFlipPeelEase(rawProgress), 0.9);
	return {
		rotateX: lift * 82,
		rotateY: lift * 78,
		rotateZ: -lift * 2,
		translateZ: lift * 28,
	};
}

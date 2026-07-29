import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import PaperFlipCanvasCurl from './PaperFlipCanvasCurl';
import PaperFlipPageCanvas from './PaperFlipPageCanvas';
import { PAPER_FLIP_CANVAS_CURL_MS } from './paperFlipCanvasCurlEngine';
import type { PageSnapshot } from './paperFlipPageFace';

/**
 * Page-turn animation for Paper Flip.
 * Uses canvas corner-curl (bottom-right dog-ear → full turn).
 * Set to `false` to show instant token updates with no animation.
 */
const PAPER_FLIP_PAGE_ANIMATION_ENABLED = true;

export interface PaperFlipPageStackProps {
	token: string;
	queueName?: string;
	subtitle?: string;
	statusLabel: string;
	statusModifier: string;
	className?: string;
	/** Template editor preview — animate even when OS reduced-motion is on. */
	previewMode?: boolean;
}

interface FlipState {
	from: PageSnapshot;
	to: PageSnapshot;
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldAnimate(previewMode?: boolean): boolean {
	if (!PAPER_FLIP_PAGE_ANIMATION_ENABLED) return false;
	if (previewMode) return true;
	return !prefersReducedMotion();
}

const PaperFlipPageStack: React.FC<PaperFlipPageStackProps> = ({
	token,
	queueName,
	subtitle,
	statusLabel,
	statusModifier,
	className = '',
	previewMode = false,
}) => {
	const snapshot = React.useMemo<PageSnapshot>(
		() => ({
			token,
			queueName,
			subtitle,
			statusLabel,
			statusModifier,
		}),
		[token, queueName, subtitle, statusLabel, statusModifier],
	);

	const mountedRef = useRef(false);
	const pendingSnapshotRef = useRef<PageSnapshot | null>(null);
	const flipRef = useRef<FlipState | null>(null);
	const displayedRef = useRef(snapshot);
	const finishTimerRef = useRef<number | null>(null);
	const flipRunRef = useRef(0);
	const stageRef = useRef<HTMLDivElement>(null);

	const [displayed, setDisplayed] = useState(snapshot);
	const [flip, setFlip] = useState<FlipState | null>(null);
	const [flipSeq, setFlipSeq] = useState(0);
	const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

	flipRef.current = flip;

	useLayoutEffect(() => {
		const el = stageRef.current;
		if (!el) return undefined;

		const measure = () => {
			const rect = el.getBoundingClientRect();
			const width = Math.max(0, Math.round(rect.width));
			const height = Math.max(0, Math.round(rect.height));
			setStageSize((prev) =>
				prev.width === width && prev.height === height ? prev : { width, height },
			);
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const clearFinishTimer = useCallback(() => {
		if (finishTimerRef.current != null) {
			window.clearTimeout(finishTimerRef.current);
			finishTimerRef.current = null;
		}
	}, []);

	const completeFlip = useCallback(() => {
		clearFinishTimer();

		const current = flipRef.current;
		if (!current) return;

		displayedRef.current = current.to;
		setDisplayed(current.to);

		const pending = pendingSnapshotRef.current;
		pendingSnapshotRef.current = null;

		if (pending && pending.token !== current.to.token) {
			flipRunRef.current += 1;
			setFlipSeq((seq) => seq + 1);
			setFlip({ from: current.to, to: pending });
			return;
		}

		setFlip(null);
	}, [clearFinishTimer]);

	const scheduleFinishFallback = useCallback(() => {
		clearFinishTimer();
		finishTimerRef.current = window.setTimeout(
			completeFlip,
			PAPER_FLIP_CANVAS_CURL_MS + 320,
		);
	}, [clearFinishTimer, completeFlip]);

	const beginFlip = useCallback(
		(from: PageSnapshot, to: PageSnapshot) => {
			flipRunRef.current += 1;
			setFlipSeq((seq) => seq + 1);
			setFlip({ from, to });
			scheduleFinishFallback();
		},
		[scheduleFinishFallback],
	);

	useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		if (token === displayedRef.current.token) {
			if (flipRef.current) {
				if (token !== flipRef.current.to.token) {
					pendingSnapshotRef.current = snapshot;
				}
				return;
			}
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		if (flipRef.current) {
			pendingSnapshotRef.current = snapshot;
			return;
		}

		if (!shouldAnimate(previewMode)) {
			displayedRef.current = snapshot;
			setDisplayed(snapshot);
			return;
		}

		beginFlip(displayedRef.current, snapshot);
	}, [token, snapshot, previewMode, beginFlip]);

	useEffect(() => () => clearFinishTimer(), [clearFinishTimer]);

	const ariaToken = flip?.to.token ?? displayed.token;
	const staticPage = flip?.from ?? displayed;
	const hasStage = stageSize.width > 1 && stageSize.height > 1;

	const handleCurlComplete = useCallback(() => {
		completeFlip();
	}, [completeFlip]);

	return (
		<div
			className={['tdc-pf-book', className].filter(Boolean).join(' ')}
			aria-live='polite'
			aria-label={`Token ${ariaToken}`}>
			<div className='tdc-pf-book__desk' aria-hidden='true' />
			<div className='tdc-pf-book__stack'>
				<div
					ref={stageRef}
					className={[
						'tdc-pf-stage',
						flip ? 'tdc-pf-stage--curling' : '',
					]
						.filter(Boolean)
						.join(' ')}>
					{hasStage ? (
						<div className='tdc-pf-page tdc-pf-page--base tdc-pf-page--surface tdc-pf-page--canvas'>
							<PaperFlipPageCanvas
								page={staticPage}
								width={stageSize.width}
								height={stageSize.height}
							/>
						</div>
					) : null}

					{flip && hasStage ? (
						<PaperFlipCanvasCurl
							key={`curl-${flipSeq}-${flipRunRef.current}`}
							flipSeq={flipSeq}
							from={flip.from}
							to={flip.to}
							stageWidth={stageSize.width}
							stageHeight={stageSize.height}
							onComplete={handleCurlComplete}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default PaperFlipPageStack;

export { PAPER_FLIP_CANVAS_CURL_MS as PAPER_FLIP_ANIMATION_MS };

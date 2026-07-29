import { useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../utils/zoneQueueResolution';

const DEFAULT_ROTATE_MS = 6000;

export interface RotatingQueueDisplayResult {
	active: AssignedQueueDisplay;
	activeIndex: number;
	queueCount: number;
}

function queueStructureSignature(queues: AssignedQueueDisplay[]): string {
	return queues.map((q) => q.queueName).join('\0');
}

/** First queue whose token changed (assignment order). */
function findChangedQueueIndex(
	prev: AssignedQueueDisplay[],
	next: AssignedQueueDisplay[],
): number | null {
	const limit = Math.min(prev.length, next.length);
	for (let i = 0; i < limit; i += 1) {
		if (prev[i].tokenDisplay !== next[i].tokenDisplay) return i;
	}
	return null;
}

export function useRotatingQueueDisplay(
	assignedQueues: AssignedQueueDisplay[],
	intervalMs = DEFAULT_ROTATE_MS,
): RotatingQueueDisplayResult {
	const queueCount = assignedQueues.length;
	const [activeIndex, setActiveIndex] = useState(0);
	const prevQueuesRef = useRef<AssignedQueueDisplay[]>([]);
	const initializedRef = useRef(false);

	useEffect(() => {
		const prev = prevQueuesRef.current;
		const structureChanged =
			prev.length !== assignedQueues.length ||
			queueStructureSignature(prev) !== queueStructureSignature(assignedQueues);

		if (!initializedRef.current || structureChanged) {
			initializedRef.current = true;
			prevQueuesRef.current = assignedQueues;
			setActiveIndex(0);
			return;
		}

		const changedIndex = findChangedQueueIndex(prev, assignedQueues);
		prevQueuesRef.current = assignedQueues;

		if (changedIndex != null) {
			setActiveIndex(changedIndex);
		}
	}, [assignedQueues]);

	useEffect(() => {
		if (queueCount <= 1) return undefined;
		const timer = window.setInterval(() => {
			setActiveIndex((current) => (current + 1) % queueCount);
		}, intervalMs);
		return () => window.clearInterval(timer);
	}, [queueCount, intervalMs]);

	const active = useMemo(() => {
		if (!assignedQueues.length) {
			return {
				queueName: 'Queue',
				servingPointName: '—',
				tokenDisplay: '—',
				statusLabel: 'Waiting',
				statusModifier: 'waiting',
				recentTokens: [],
			};
		}
		return assignedQueues[activeIndex % assignedQueues.length];
	}, [assignedQueues, activeIndex]);

	return { active, activeIndex, queueCount };
}

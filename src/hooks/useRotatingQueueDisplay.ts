import { useEffect, useMemo, useState } from 'react';
import type { AssignedQueueDisplay } from '../utils/zoneQueueResolution';

const DEFAULT_ROTATE_MS = 6000;

export interface RotatingQueueDisplayResult {
	active: AssignedQueueDisplay;
	activeIndex: number;
	queueCount: number;
}

export function useRotatingQueueDisplay(
	assignedQueues: AssignedQueueDisplay[],
	intervalMs = DEFAULT_ROTATE_MS,
): RotatingQueueDisplayResult {
	const queueCount = assignedQueues.length;
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		setActiveIndex(0);
	}, [queueCount, assignedQueues.map((q) => q.tokenDisplay).join('|')]);

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

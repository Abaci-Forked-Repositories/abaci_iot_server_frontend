import { useEffect, useRef } from 'react';
import type { PublicQueueStatus } from '../services/publicScreenApi';

interface TrackedQueueState {
	tokenDisplay: string;
	servingPointName: string;
}

const MAX_ANNOUNCEMENT_BACKLOG = 10;
const ANNOUNCEMENT_DEDUPE_MS = 15_000;
const ANNOUNCEMENT_GAP_MS = 300;

/**
 * Hospital-style token announcer using the browser Web Speech API.
 *
 * Watches `queuesByUuid` for changes in `current_token` or `serving_point_name`.
 * When either changes for any queue, it announces:
 *   "Token number: [token], Serving point: [point]"
 *
 * - Does NOT announce on the very first load (baseline capture only).
 * - Does nothing when `enableAudio` is false or browser lacks SpeechSynthesis.
 * - Queues announcements sequentially so they don't overlap.
 */
export function useAudioAnnouncer(
	queuesByUuid: Record<string, PublicQueueStatus>,
	enableAudio: boolean,
): void {
	const prevRef = useRef<Record<string, TrackedQueueState>>({});
	const initializedRef = useRef(false);
	const unlockedRef = useRef(false);
	const announcementQueueRef = useRef<string[]>([]);
	const isSpeakingRef = useRef(false);
	const lastQueuedAtRef = useRef<Record<string, number>>({});

	const processQueue = () => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		if (!unlockedRef.current) return;
		if (isSpeakingRef.current) return;
		if (document.visibilityState !== 'visible') return;
		const nextText = announcementQueueRef.current.shift();
		if (!nextText) return;

		isSpeakingRef.current = true;
		const utterance = new SpeechSynthesisUtterance(nextText);
		utterance.rate = 0.9;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;
		utterance.onend = () => {
			isSpeakingRef.current = false;
			window.setTimeout(processQueue, ANNOUNCEMENT_GAP_MS);
		};
		utterance.onerror = () => {
			isSpeakingRef.current = false;
			window.setTimeout(processQueue, ANNOUNCEMENT_GAP_MS);
		};
		window.speechSynthesis.speak(utterance);
		// window.speechSynthesis.speak(new SpeechSynthesisUtterance("audio test from chrome"));
	};

	const enqueueAnnouncement = (key: string, text: string) => {
		const now = Date.now();
		const lastQueuedAt = lastQueuedAtRef.current[key] ?? 0;
		if (now - lastQueuedAt < ANNOUNCEMENT_DEDUPE_MS) return;
		lastQueuedAtRef.current[key] = now;

		const queue = announcementQueueRef.current;
		if (queue.length >= MAX_ANNOUNCEMENT_BACKLOG) queue.shift();
		queue.push(text);
		processQueue();
	};

	useEffect(() => {
		if (!enableAudio) return;
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

		let cancelled = false;
		const unlock = () => {
			if (cancelled || unlockedRef.current) return;
			unlockedRef.current = true;
			processQueue();
		};

		// Best effort auto-unlock on page load.
		try {
			const probe = new SpeechSynthesisUtterance(' ');
			probe.volume = 0;
			probe.onstart = unlock;
			window.speechSynthesis.speak(probe);
		} catch {
			// Ignore and rely on interaction fallback below.
		}

		// Fallback for browsers that require a user gesture for audio.
		const onInteract = () => unlock();
		window.addEventListener('pointerdown', onInteract, { once: true });
		window.addEventListener('keydown', onInteract, { once: true });
		window.addEventListener('touchstart', onInteract, { once: true });
		const onVisibility = () => processQueue();
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			cancelled = true;
			window.removeEventListener('pointerdown', onInteract);
			window.removeEventListener('keydown', onInteract);
			window.removeEventListener('touchstart', onInteract);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [enableAudio]);

	useEffect(() => {
		if (!enableAudio) return;
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

		// First call: capture baseline without speaking.
		if (!initializedRef.current) {
			const baseline: Record<string, TrackedQueueState> = {};
			for (const [uuid, queue] of Object.entries(queuesByUuid)) {
				const tokenDisplay =
					queue.token_display?.trim() ||
					queue.current_token?.token_display?.trim() ||
					'';
				const servingPointName = queue.serving_point_name?.trim() || '';
				baseline[uuid] = { tokenDisplay, servingPointName };
			}
			prevRef.current = baseline;
			initializedRef.current = true;
			return;
		}

		const prev = prevRef.current;
		const textsToSpeak: string[] = [];

		for (const [uuid, queue] of Object.entries(queuesByUuid)) {
			const tokenDisplay =
				queue.token_display?.trim() ||
				queue.current_token?.token_display?.trim() ||
				'';
			const servingPointName = queue.serving_point_name?.trim() || '';

			// Only announce when both token and serving point are present.
			if (!tokenDisplay || !servingPointName) {
				prev[uuid] = { tokenDisplay, servingPointName };
				continue;
			}

			const prevState = prev[uuid];
			const tokenChanged = !prevState || prevState.tokenDisplay !== tokenDisplay;
			const pointChanged = !prevState || prevState.servingPointName !== servingPointName;

			if (tokenChanged || pointChanged) {
				textsToSpeak.push(
					`Token number: ${tokenDisplay}, Serving point: ${servingPointName}`,
				);
			}

			prev[uuid] = { tokenDisplay, servingPointName };
		}

		prevRef.current = { ...prev };

		for (const text of textsToSpeak) {
			enqueueAnnouncement(text, text);
		}
	}, [queuesByUuid, enableAudio]);
}

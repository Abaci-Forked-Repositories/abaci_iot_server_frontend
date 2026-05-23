import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import ScreenPublicDisplay from '../../components/PublicPages/ScreenPublicDisplay';
import {
	publicScreenApi,
	type PublicQueueStatus,
	type PublicScreenInfo,
	type PublicScreenTemplate,
} from '../../services/publicScreenApi';
import { collectQueueUuidsFromHtml } from '../../utils/parseTemplateZones';

const CYCLE_COOKIE_PREFIX = 'screen_display_start_';
const QUEUE_POLL_MS = 20_000;
const TICK_MS = 1_000;

function cycleCookieKey(screenUuid: string) {
	return `${CYCLE_COOKIE_PREFIX}${screenUuid}`;
}

function getOrCreateCycleStart(screenUuid: string): number {
	const key = cycleCookieKey(screenUuid);
	const existing = Cookies.get(key);
	if (existing) {
		const parsed = Number(existing);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}
	const now = Date.now();
	Cookies.set(key, String(now), { expires: 365 });
	return now;
}

function pickActiveTemplate(
	templates: PublicScreenTemplate[],
	startMs: number,
	nowMs: number,
): PublicScreenTemplate | null {
	const active = templates
		.filter((t) => t.is_active !== false)
		.sort((a, b) => a.order - b.order);
	if (!active.length) return null;

	const totalSeconds = active.reduce((sum, t) => sum + Math.max(1, t.interval || 1), 0);
	if (totalSeconds <= 0) return active[0];

	const elapsedSec = ((nowMs - startMs) / 1000) % totalSeconds;
	let cursor = 0;
	for (const template of active) {
		const duration = Math.max(1, template.interval || 1);
		cursor += duration;
		if (elapsedSec < cursor) return template;
	}
	return active[0];
}

const ScreenTokenStatusPage: React.FC = () => {
	const { uuid: screenUuid = '' } = useParams<{ uuid: string }>();

	const [screen, setScreen] = useState<PublicScreenInfo | null>(null);
	const [templates, setTemplates] = useState<PublicScreenTemplate[]>([]);
	const [queuesByUuid, setQueuesByUuid] = useState<Record<string, PublicQueueStatus>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [nowMs, setNowMs] = useState(Date.now());
	const [cycleStartMs, setCycleStartMs] = useState<number | null>(null);

	const sortedTemplates = useMemo(
		() => [...templates].sort((a, b) => a.order - b.order),
		[templates],
	);

	const activeTemplate = useMemo(() => {
		if (!cycleStartMs || !sortedTemplates.length) return null;
		return pickActiveTemplate(sortedTemplates, cycleStartMs, nowMs);
	}, [cycleStartMs, sortedTemplates, nowMs]);

	const allQueueUuids = useMemo(() => {
		const seen = new Set<string>();
		const uuids: string[] = [];
		sortedTemplates.forEach((template) => {
			collectQueueUuidsFromHtml(template.html_content).forEach((uuid) => {
				if (seen.has(uuid)) return;
				seen.add(uuid);
				uuids.push(uuid);
			});
		});
		return uuids;
	}, [sortedTemplates]);

	const fetchQueueStatus = useCallback(async (queueUuids: string[]) => {
		if (!queueUuids.length) {
			setQueuesByUuid({});
			return;
		}
		try {
			const response = await publicScreenApi.getQueueStatus(queueUuids);
			const map: Record<string, PublicQueueStatus> = {};
			for (const queue of response.queues ?? []) {
				map[queue.uuid] = queue;
			}
			setQueuesByUuid(map);
		} catch {
			// Keep last known queue data on transient failures.
		}
	}, []);

	const loadScreen = useCallback(async () => {
		if (!screenUuid) {
			setError('Missing screen identifier in URL.');
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const response = await publicScreenApi.getScreen(screenUuid);
			const sorted = [...(response.templates ?? [])].sort((a, b) => a.order - b.order);
			setScreen(response.screen);
			setTemplates(sorted);
			setCycleStartMs(getOrCreateCycleStart(screenUuid));

			const queueUuids = sorted.flatMap((t) => collectQueueUuidsFromHtml(t.html_content));
			const uniqueQueueUuids = Array.from(new Set(queueUuids));
			await fetchQueueStatus(uniqueQueueUuids);
		} catch (err: unknown) {
			const typed = err as { response?: { data?: { detail?: string } }; message?: string };
			setError(
				typed.response?.data?.detail || typed.message || 'Failed to load screen display.',
			);
		} finally {
			setLoading(false);
		}
	}, [screenUuid, fetchQueueStatus]);

	useEffect(() => {
		void loadScreen();
	}, [loadScreen]);

	useEffect(() => {
		const tick = window.setInterval(() => setNowMs(Date.now()), TICK_MS);
		return () => window.clearInterval(tick);
	}, []);

	useEffect(() => {
		if (!allQueueUuids.length) return undefined;
		const poll = window.setInterval(() => {
			void fetchQueueStatus(allQueueUuids);
		}, QUEUE_POLL_MS);
		return () => window.clearInterval(poll);
	}, [allQueueUuids, fetchQueueStatus]);

	return (
		<div className='screen-public-page'>
			{loading && (
				<div className='screen-public-page-message'>Loading screen display…</div>
			)}

			{!loading && error && (
				<div className='screen-public-page-message screen-public-page-message--error'>
					{error}
				</div>
			)}

			{!loading && !error && screen && (
				<ScreenPublicDisplay
					screen={screen}
					template={activeTemplate}
					queuesByUuid={queuesByUuid}
				/>
			)}
		</div>
	);
};

export default ScreenTokenStatusPage;

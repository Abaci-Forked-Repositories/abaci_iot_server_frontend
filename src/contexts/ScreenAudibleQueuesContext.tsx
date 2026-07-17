import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';

const QUEUE_UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ScreenAudibleQueuesContextValue {
	register: (zoneKey: string, queueUuids: string[]) => void;
}

const ScreenAudibleQueuesContext = createContext<ScreenAudibleQueuesContextValue | null>(
	null,
);

function collectAudibleUuids(zoneMap: Map<string, string[]>): Set<string> {
	const all = new Set<string>();
	zoneMap.forEach((uuids) => {
		uuids.forEach((uuid) => {
			const trimmed = uuid?.trim();
			if (trimmed && QUEUE_UUID_RE.test(trimmed)) all.add(trimmed);
		});
	});
	return all;
}

interface ScreenAudibleQueuesProviderProps {
	children: React.ReactNode;
	onAudibleQueuesChange: (uuids: ReadonlySet<string>) => void;
}

export function ScreenAudibleQueuesProvider({
	children,
	onAudibleQueuesChange,
}: ScreenAudibleQueuesProviderProps) {
	const onChangeRef = useRef(onAudibleQueuesChange);
	onChangeRef.current = onAudibleQueuesChange;
	const zoneMapRef = useRef(new Map<string, string[]>());

	const register = useCallback((zoneKey: string, queueUuids: string[]) => {
		if (!zoneKey) return;
		zoneMapRef.current.set(zoneKey, queueUuids);
		onChangeRef.current(collectAudibleUuids(zoneMapRef.current));
	}, []);

	const value = useMemo(() => ({ register }), [register]);

	return (
		<ScreenAudibleQueuesContext.Provider value={value}>
			{children}
		</ScreenAudibleQueuesContext.Provider>
	);
}

/** Register which queue UUIDs are currently visible for audio on the public screen. */
export function useRegisterAudibleQueues(
	zoneKey: string | undefined,
	queueUuids: string[],
	enabled: boolean,
) {
	const ctx = useContext(ScreenAudibleQueuesContext);
	const uuidsKey = queueUuids.join(',');

	useEffect(() => {
		if (!ctx || !enabled || !zoneKey) return undefined;
		ctx.register(zoneKey, queueUuids);
		return () => ctx.register(zoneKey, []);
	}, [ctx, enabled, zoneKey, uuidsKey]);
}

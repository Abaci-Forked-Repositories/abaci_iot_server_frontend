import React, { FC, useCallback, useEffect, useState } from 'react';
import OffCanvas, { OffCanvasBody, OffCanvasHeader, OffCanvasTitle } from '../../bootstrap/OffCanvas';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	getCloudSyncSystemLogs,
	SystemLogEntry,
} from '../../../api/administration/cloudSync.api';
import {
	formatPermissionDeniedMessage,
	isForbiddenPermissionError,
} from '../QueueManagement/queueManagementUtils';
import SystemLogHistoryList from './SystemLogHistoryList';

interface CloudSyncHistoryOffCanvasProps {
	isOpen: boolean;
	setOpen: (open: boolean) => void;
}

const CloudSyncHistoryOffCanvas: FC<CloudSyncHistoryOffCanvasProps> = ({ isOpen, setOpen }) => {
	const { showErrorNotification } = useToasterNotification();
	const [loading, setLoading] = useState(false);
	const [accessDenied, setAccessDenied] = useState<string | null>(null);
	const [logs, setLogs] = useState<SystemLogEntry[]>([]);

	const loadHistory = useCallback(async () => {
		setLoading(true);
		setAccessDenied(null);
		try {
			const data = await getCloudSyncSystemLogs();
			setLogs(data);
		} catch (err) {
			if (isForbiddenPermissionError(err)) {
				setAccessDenied(formatPermissionDeniedMessage(err));
				setLogs([]);
			} else {
				showErrorNotification(err);
				setLogs([]);
			}
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isOpen) {
			void loadHistory();
		} else {
			setLogs([]);
			setAccessDenied(null);
		}
	}, [isOpen, loadHistory]);

	return (
		<OffCanvas
			id='cloud-sync-history'
			titleId='cloud-sync-history-title'
			isOpen={isOpen}
			setOpen={setOpen}
			placement='end'>
			<OffCanvasHeader setOpen={setOpen}>
				<OffCanvasTitle id='cloud-sync-history-title'>Cloud Sync History</OffCanvasTitle>
			</OffCanvasHeader>
			<OffCanvasBody>
				<SystemLogHistoryList
					loading={loading}
					accessDenied={accessDenied}
					logs={logs}
					emptyMessage='No cloud sync history entries found.'
				/>
			</OffCanvasBody>
		</OffCanvas>
	);
};

export default CloudSyncHistoryOffCanvas;

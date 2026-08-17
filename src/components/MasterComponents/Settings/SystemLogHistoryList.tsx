import React, { FC } from 'react';
import Alert from '../../bootstrap/Alert';
import Spinner from '../../bootstrap/Spinner';
import StatusBadge from '../../BadgeWithIcon.jsx';
import { SystemLogEntry } from '../../../api/administration/cloudSync.api';

function formatLogWhen(entry: SystemLogEntry): string {
	const ts = entry.created_at || entry.timestamp;
	if (!ts) return '—';
	try {
		return new Date(ts).toLocaleString();
	} catch {
		return ts;
	}
}

function formatSourceLabel(source: string | undefined): string {
	if (!source) return 'Unknown';
	return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getLogMessage(entry: SystemLogEntry): string {
	if (entry.message && String(entry.message).trim()) return String(entry.message);
	if (typeof entry.details === 'string' && entry.details.trim()) return entry.details;
	if (entry.details && typeof entry.details === 'object') {
		try {
			return JSON.stringify(entry.details);
		} catch {
			return '—';
		}
	}
	return '—';
}

function getLogStatus(entry: SystemLogEntry): string | undefined {
	const raw = entry.status || entry.level;
	return raw && String(raw).trim() ? String(raw) : undefined;
}

interface SystemLogHistoryListProps {
	loading: boolean;
	accessDenied: string | null;
	logs: SystemLogEntry[];
	emptyMessage: string;
}

const SystemLogHistoryList: FC<SystemLogHistoryListProps> = ({
	loading,
	accessDenied,
	logs,
	emptyMessage,
}) => {
	if (loading) {
		return (
			<div className='d-flex justify-content-center py-5'>
				<Spinner color='primary' />
			</div>
		);
	}

	if (accessDenied) {
		return (
			<Alert color='warning' isLight className='mb-0'>
				{accessDenied}
			</Alert>
		);
	}

	if (logs.length === 0) {
		return (
			<Alert color='light' isLight className='mb-0'>
				{emptyMessage}
			</Alert>
		);
	}

	return (
		<div className='d-flex flex-column gap-3'>
			{logs.map((entry, index) => {
				const key = entry.id != null ? String(entry.id) : `log-${index}`;
				const status = getLogStatus(entry);
				return (
					<div
						key={key}
						className='rounded-3 border border-light p-3 bg-light bg-opacity-50'>
						<div className='d-flex justify-content-between align-items-start gap-2 mb-2'>
							<span className='fw-semibold small'>{formatSourceLabel(entry.source)}</span>
							<span className='text-muted small text-nowrap'>{formatLogWhen(entry)}</span>
						</div>
						<div className='small text-break mb-2'>{getLogMessage(entry)}</div>
						{status && <StatusBadge status={status} />}
					</div>
				);
			})}
		</div>
	);
};

export default SystemLogHistoryList;

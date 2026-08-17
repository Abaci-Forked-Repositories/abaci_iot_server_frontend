import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../bootstrap/Button';
import FormGroup from '../../bootstrap/forms/FormGroup';
import Input from '../../bootstrap/forms/Input';
import Select from '../../bootstrap/forms/Select';
import Option from '../../bootstrap/Option';
import Spinner from '../../bootstrap/Spinner';
import Alert from '../../bootstrap/Alert';
import usePermissions from '../../../hooks/usePermissions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import TestEmailModal from './TestEmailModal';
import {
	getSystemConfig,
	updateEmailSettings,
	SystemConfig,
} from '../../../api/administration/cloudSync.api';
import {
	formatPermissionDeniedMessage,
	isForbiddenPermissionError,
} from '../QueueManagement/queueManagementUtils';

const EMAIL_PROTOCOLS = ['SMTP', 'SendGrid', 'Mailgun'] as const;
const ENCRYPTION_TYPES = ['None', 'SSL', 'TLS'] as const;

export interface EmailSettingsForm {
	email_protocol: string;
	email_host: string;
	email_port: string;
	encryption_type: string;
	sender_email: string;
	email_password: string;
}

const EMPTY_FORM: EmailSettingsForm = {
	email_protocol: 'SMTP',
	email_host: '',
	email_port: '587',
	encryption_type: 'TLS',
	sender_email: '',
	email_password: '',
};

function formFromConfig(config: SystemConfig): EmailSettingsForm {
	return {
		email_protocol: config.email_protocol || 'SMTP',
		email_host: config.email_host || '',
		email_port: String(config.email_port ?? 587),
		encryption_type: config.encryption_type || 'TLS',
		sender_email: config.sender_email || '',
		// Never echo a real secret into the field; blank means “unchanged” on save.
		email_password: '',
	};
}

function snapshotOf(form: EmailSettingsForm): EmailSettingsForm {
	return { ...form };
}

function isDirty(current: EmailSettingsForm, baseline: EmailSettingsForm): boolean {
	return (
		current.email_protocol !== baseline.email_protocol ||
		current.email_host !== baseline.email_host ||
		current.email_port !== baseline.email_port ||
		current.encryption_type !== baseline.encryption_type ||
		current.sender_email !== baseline.sender_email ||
		current.email_password !== baseline.email_password
	);
}

const EmailSettingsTabContent: FC = () => {
	const { can } = usePermissions();
	const canWrite = can('settings_write');
	const { showSuccessNotification, showErrorNotification } = useToasterNotification();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [accessDenied, setAccessDenied] = useState<string | null>(null);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState<EmailSettingsForm>(EMPTY_FORM);
	const [baseline, setBaseline] = useState<EmailSettingsForm>(EMPTY_FORM);
	const [showTestModal, setShowTestModal] = useState(false);
	/** Save Changes stays disabled until send_test_email succeeds for the current form. */
	const [testEmailSucceeded, setTestEmailSucceeded] = useState(false);

	const dirty = useMemo(() => isDirty(form, baseline), [form, baseline]);
	const canSave = dirty && testEmailSucceeded && !saving;

	const load = useCallback(async () => {
		setLoading(true);
		setAccessDenied(null);
		try {
			const config = await getSystemConfig();
			const next = formFromConfig(config);
			setForm(next);
			setBaseline(snapshotOf(next));
			setEditing(false);
			setTestEmailSucceeded(false);
		} catch (err) {
			if (isForbiddenPermissionError(err)) {
				setAccessDenied(formatPermissionDeniedMessage(err));
			} else {
				showErrorNotification(err);
			}
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const updateField = <K extends keyof EmailSettingsForm>(key: K, value: EmailSettingsForm[K]) => {
		setTestEmailSucceeded(false);
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleEdit = () => {
		if (!canWrite) return;
		setBaseline(snapshotOf(form));
		setTestEmailSucceeded(false);
		setEditing(true);
	};

	const handleCancel = () => {
		setForm(snapshotOf(baseline));
		setTestEmailSucceeded(false);
		setEditing(false);
	};

	const handleSave = async () => {
		if (!canWrite || !canSave) return;
		setSaving(true);
		try {
			const port = Number(form.email_port);
			const payload: Parameters<typeof updateEmailSettings>[0] = {
				email_protocol: form.email_protocol,
				email_host: form.email_host.trim() || null,
				email_port: Number.isFinite(port) ? port : 587,
				encryption_type: form.encryption_type,
				sender_email: form.sender_email.trim() || null,
			};
			const password = form.email_password.trim();
			if (password) {
				payload.email_password = password;
			}

			const updated = await updateEmailSettings(payload);
			const next = formFromConfig(updated);
			setForm(next);
			setBaseline(snapshotOf(next));
			setTestEmailSucceeded(false);
			setEditing(false);
			showSuccessNotification('Email settings saved.');
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='d-flex justify-content-center align-items-center py-5'>
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

	const readOnly = !editing;

	return (
		<>
			<div className='email-settings p-1 p-md-2'>
				<div className='row g-3 mb-4'>
					<div className='col-md-6'>
						<FormGroup id='email_protocol' label='Email Protocol'>
							<Select
								id='email_protocol'
								ariaLabel='Email Protocol'
								value={form.email_protocol}
								disabled={readOnly || !canWrite}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									updateField('email_protocol', e.target.value)
								}>
								{EMAIL_PROTOCOLS.map((p) => (
									<Option key={p} value={p}>
										{p}
									</Option>
								))}
							</Select>
						</FormGroup>
					</div>
					<div className='col-md-6'>
						<FormGroup id='email_host' label='SMTP Host'>
							<Input
								id='email_host'
								type='text'
								value={form.email_host}
								disabled={readOnly || !canWrite}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									updateField('email_host', e.target.value)
								}
							/>
						</FormGroup>
					</div>
					<div className='col-md-6'>
						<FormGroup id='email_port' label='SMTP Port'>
							<Input
								id='email_port'
								type='text'
								value={form.email_port}
								disabled={readOnly || !canWrite}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									updateField('email_port', e.target.value)
								}
							/>
						</FormGroup>
					</div>
					<div className='col-md-6'>
						<FormGroup id='encryption_type' label='Encryption Type'>
							<Select
								id='encryption_type'
								ariaLabel='Encryption Type'
								value={form.encryption_type}
								disabled={readOnly || !canWrite}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									updateField('encryption_type', e.target.value)
								}>
								{ENCRYPTION_TYPES.map((t) => (
									<Option key={t} value={t}>
										{t}
									</Option>
								))}
							</Select>
						</FormGroup>
					</div>
					<div className='col-md-6'>
						<FormGroup id='sender_email' label='Sender Email'>
							<Input
								id='sender_email'
								type='email'
								value={form.sender_email}
								disabled={readOnly || !canWrite}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									updateField('sender_email', e.target.value)
								}
							/>
						</FormGroup>
					</div>
					<div className='col-md-6'>
						<FormGroup id='email_password' label='Password'>
							<Input
								id='email_password'
								type='password'
								value={form.email_password}
								disabled={readOnly || !canWrite}
								autoComplete='new-password'
								placeholder={editing ? 'Leave blank to keep current' : undefined}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									updateField('email_password', e.target.value)
								}
							/>
						</FormGroup>
					</div>
				</div>

				<hr className='my-4' />

				<div className='d-flex justify-content-end gap-2 flex-wrap'>
					<Button
						color='info'
						isLight
						icon='Send'
						onClick={() => setShowTestModal(true)}>
						Send Test Email
					</Button>

					{!editing ? (
						<Button
							color='primary'
							isLight
							icon='Edit'
							isDisable={!canWrite}
							onClick={handleEdit}>
							Edit Settings
						</Button>
					) : (
						<>
							<Button color='light' isDisable={saving} onClick={handleCancel}>
								Cancel
							</Button>
							<Button
								color='primary'
								icon='Save'
								isDisable={!canSave}
								onClick={() => {
									void handleSave();
								}}
								title={
									!dirty
										? 'No changes to save'
										: !testEmailSucceeded
											? 'Send a successful test email before saving'
											: undefined
								}>
								{saving ? 'Saving…' : 'Save Changes'}
							</Button>
						</>
					)}
				</div>
			</div>

			<TestEmailModal
				isOpen={showTestModal}
				setIsOpen={setShowTestModal}
				fromAddress={form.sender_email}
				settings={{
					email_protocol: form.email_protocol,
					email_host: form.email_host,
					email_password: form.email_password,
					email_port: Number(form.email_port) || 587,
					encryption_type: form.encryption_type,
					sender_email: form.sender_email,
				}}
				onTestSuccess={() => setTestEmailSucceeded(true)}
			/>
		</>
	);
};

export default EmailSettingsTabContent;

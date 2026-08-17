import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import Button from '../../bootstrap/Button';
import FormGroup from '../../bootstrap/forms/FormGroup';
import Input from '../../bootstrap/forms/Input';
import Label from '../../bootstrap/forms/Label';
import Select from '../../bootstrap/forms/Select';
import Option from '../../bootstrap/Option';
import Spinner from '../../bootstrap/Spinner';
import Alert from '../../bootstrap/Alert';
import ReactSelectWithState from '../../CustomComponent/Select/ReactSelect';
import usePermissions from '../../../hooks/usePermissions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	getDataRetention,
	getSiteConfigs,
	getTimezones,
	removeSiteLogo,
	resolveSiteLogoUrl,
	updateDataRetention,
	updateSiteConfigs,
	uploadSiteLogo,
	TimezoneOption,
} from '../../../api/administration/siteConfigs.api';
import {
	formatPermissionDeniedMessage,
	isForbiddenPermissionError,
} from '../QueueManagement/queueManagementUtils';

const WEEK_DAYS = ['Monday', 'Sunday'] as const;

const RETENTION_MIN = 30;
const RETENTION_MAX = 1825;

function formatResetTimeForInput(resetTime: string): string {
	if (!resetTime) return '00:00';
	const parts = resetTime.split(':');
	if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
	return resetTime;
}

/** API expects `HH:mm:ss`. */
function formatResetTimeForApi(resetTime: string): string {
	if (!resetTime) return '00:00:00';
	const parts = resetTime.split(':');
	if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
	if (parts.length >= 3) {
		return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
	}
	return resetTime;
}

function formatRetentionLabel(days: number): string {
	const years = Math.round((days / 365) * 10) / 10;
	const yearLabel = years === 1 ? '1 year' : `${years} years`;
	return `Keep data for ${days} days (${yearLabel})`;
}

function validateLogoFile(file: File): string | null {
	const isJpeg =
		file.type === 'image/jpeg' ||
		file.type === 'image/jpg' ||
		/\.jpe?g$/i.test(file.name);
	const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
	if (!isJpeg && !isPng) {
		return 'Please select a JPEG or PNG image.';
	}
	if (file.size > 2 * 1024 * 1024) {
		return 'Image is too large. Please use a file under 2MB.';
	}
	return null;
}

interface FormState {
	site_name: string;
	timezone: string;
	week_start_day: string;
	reset_time: string;
	number_of_days_to_keep_data: number;
	logo_url: string | null;
}

/** Fields controlled by Save (logo is saved immediately via upload/remove). */
type SaveSnapshot = Pick<
	FormState,
	'site_name' | 'timezone' | 'week_start_day' | 'reset_time' | 'number_of_days_to_keep_data'
>;

function toSaveSnapshot(form: FormState): SaveSnapshot {
	return {
		site_name: form.site_name,
		timezone: form.timezone,
		week_start_day: form.week_start_day,
		reset_time: form.reset_time,
		number_of_days_to_keep_data: form.number_of_days_to_keep_data,
	};
}

function isSiteConfigDirty(current: SaveSnapshot, initial: SaveSnapshot | null): boolean {
	if (!initial) return false;
	return (
		current.site_name !== initial.site_name ||
		current.timezone !== initial.timezone ||
		current.week_start_day !== initial.week_start_day ||
		current.reset_time !== initial.reset_time
	);
}

function isRetentionDirty(current: SaveSnapshot, initial: SaveSnapshot | null): boolean {
	if (!initial) return false;
	return current.number_of_days_to_keep_data !== initial.number_of_days_to_keep_data;
}

const emptyForm: FormState = {
	site_name: '',
	timezone: '',
	week_start_day: 'Monday',
	reset_time: '00:00',
	number_of_days_to_keep_data: RETENTION_MIN,
	logo_url: null,
};

const GeneralSettingsTabContent: FC = () => {
	const { can } = usePermissions();
	const canWrite = can('settings_write');
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [removing, setRemoving] = useState(false);
	const [accessDenied, setAccessDenied] = useState<string | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);
	const [snapshot, setSnapshot] = useState<SaveSnapshot | null>(null);
	const [timezones, setTimezones] = useState<TimezoneOption[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setAccessDenied(null);
		try {
			const [config, tzOptions, retention] = await Promise.all([
				getSiteConfigs(),
				getTimezones(),
				getDataRetention().catch(() => null),
			]);

			setTimezones(tzOptions);
			const logoPath = config.logo_url || config.site_logo || null;
			const weekStart = config.week_start_day || 'Monday';
			const nextForm: FormState = {
				site_name: config.site_name ?? '',
				timezone: config.timezone ?? '',
				week_start_day: (WEEK_DAYS as readonly string[]).includes(weekStart)
					? weekStart
					: 'Monday',
				reset_time: formatResetTimeForInput(config.reset_time || '00:00:00'),
				number_of_days_to_keep_data:
					retention?.number_of_days_to_keep_data ??
					config.number_of_days_to_keep_data ??
					RETENTION_MIN,
				logo_url: resolveSiteLogoUrl(logoPath),
			};
			setForm(nextForm);
			setSnapshot(toSaveSnapshot(nextForm));
		} catch (err) {
			if (isForbiddenPermissionError(err)) {
				setAccessDenied(formatPermissionDeniedMessage(err));
			} else {
				showErrorNotification(err);
			}
		} finally {
			setLoading(false);
		}
		// Intentionally omit showErrorNotification: useToasterNotification returns a new
		// function each render, which would re-trigger this load in a loop.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const currentSnapshot = toSaveSnapshot(form);
	const siteDirty = isSiteConfigDirty(currentSnapshot, snapshot);
	const retentionDirty = isRetentionDirty(currentSnapshot, snapshot);
	const isDirty = siteDirty || retentionDirty;

	const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		if (!canWrite || !isDirty || saving) return;

		setSaving(true);
		try {
			const tasks: Promise<unknown>[] = [];

			if (siteDirty) {
				tasks.push(
					updateSiteConfigs({
						site_name: form.site_name.trim(),
						timezone: form.timezone,
						week_start_day: form.week_start_day,
						reset_time: formatResetTimeForApi(form.reset_time),
					}),
				);
			}
			if (retentionDirty) {
				tasks.push(updateDataRetention(form.number_of_days_to_keep_data));
			}

			await Promise.all(tasks);
			setSnapshot(toSaveSnapshot(form));
			showSuccessNotification('Settings saved.');
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSaving(false);
		}
	};

	const handleUploadClick = () => {
		if (!canWrite || uploading || removing || saving) return;
		fileInputRef.current?.click();
	};

	const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;

		const typeError = validateLogoFile(file);
		if (typeError) {
			showErrorNotification(typeError);
			return;
		}

		setUploading(true);
		try {
			const updated = await uploadSiteLogo(file);
			const path = updated.logo_url || updated.site_logo;
			updateField('logo_url', resolveSiteLogoUrl(path));
			showSuccessNotification('Site logo updated.');
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setUploading(false);
		}
	};

	const handleRemoveLogo = async () => {
		if (!canWrite || uploading || removing || saving) return;
		setRemoving(true);
		try {
			await removeSiteLogo();
			updateField('logo_url', null);
			showSuccessNotification('Site logo removed.');
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setRemoving(false);
		}
	};

	const timezoneValue = form.timezone
		? { value: form.timezone, label: form.timezone }
		: null;

	const logoSrc = form.logo_url;

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

	return (
		<div className='general-settings p-1 p-md-2'>
			<div className='mb-4'>
				<Label className='fw-bold'>Site Logo</Label>
				<div className='d-flex align-items-start gap-3 flex-wrap'>
					{logoSrc && (
						<img
							src={logoSrc}
							alt='Site logo'
							width={128}
							height={128}
							className='rounded border bg-light'
							style={{ objectFit: 'contain', maxWidth: 128, maxHeight: 128 }}
						/>
					)}
					<div>
						<input
							ref={fileInputRef}
							type='file'
							accept='image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png'
							className='d-none'
							onChange={handleLogoSelected}
						/>
						<div className='d-flex align-items-center gap-2 flex-wrap'>
							<Button
								color='primary'
								icon={uploading ? undefined : 'Upload'}
								isDisable={!canWrite || uploading || removing || saving}
								onClick={handleUploadClick}>
								{uploading ? (
									<span className='d-inline-flex align-items-center gap-2'>
										<Spinner isSmall inButton />
										Uploading…
									</span>
								) : (
									'Upload Logo'
								)}
							</Button>
							{logoSrc && (
								<Button
									color='danger'
									isLight
									icon={removing ? undefined : 'Delete'}
									isDisable={!canWrite || uploading || removing || saving}
									onClick={handleRemoveLogo}>
									{removing ? (
										<span className='d-inline-flex align-items-center gap-2'>
											<Spinner isSmall inButton />
											Removing…
										</span>
									) : (
										'Remove'
									)}
								</Button>
							)}
						</div>
						<div className='form-text text-muted mt-1'>
							JPEG recommended, max 256×256px.
						</div>
					</div>
				</div>
			</div>

			<div className='row g-3 mb-4'>
				<div className='col-md-6'>
					<FormGroup id='site_name' label='Site Name'>
						<Input
							id='site_name'
							type='text'
							value={form.site_name}
							disabled={!canWrite}
							onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
								updateField('site_name', ev.target.value)
							}
						/>
					</FormGroup>
				</div>
				<div className='col-md-6'>
					<Label htmlFor='timezone'>Timezone</Label>
					<div
						style={
							canWrite ? undefined : { pointerEvents: 'none', opacity: 0.65 }
						}>
						<ReactSelectWithState
							options={timezones}
							value={timezoneValue}
							setValue={(opt) => {
								if (!canWrite) return;
								const selected = opt as TimezoneOption | null;
								updateField('timezone', selected?.value ?? '');
							}}
							placeholder='Select timezone'
							isClearable={false}
							className='react-select'
						/>
					</div>
				</div>
				<div className='col-md-6'>
					<FormGroup id='week_start_day' label='Week First Day'>
						<Select
							id='week_start_day'
							ariaLabel='Week First Day'
							value={form.week_start_day}
							disabled={!canWrite}
							onChange={(ev: React.ChangeEvent<HTMLSelectElement>) =>
								updateField('week_start_day', ev.target.value)
							}>
							{WEEK_DAYS.map((day) => (
								<Option key={day} value={day}>
									{day}
								</Option>
							))}
						</Select>
					</FormGroup>
				</div>
				<div className='col-md-6'>
					<FormGroup id='reset_time' label='Incremental Count Day Start'>
						<Input
							id='reset_time'
							type='time'
							value={form.reset_time}
							disabled={!canWrite}
							onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
								updateField('reset_time', ev.target.value)
							}
						/>
					</FormGroup>
				</div>
			</div>

			<div className='mb-4'>
				<Label className='fw-bold' htmlFor='data_retention'>
					Data Retention
				</Label>
				<Input
					id='data_retention'
					type='range'
					min={RETENTION_MIN}
					max={RETENTION_MAX}
					step={1}
					value={form.number_of_days_to_keep_data}
					disabled={!canWrite}
					onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
						updateField('number_of_days_to_keep_data', Number(ev.target.value))
					}
				/>
				<div className='text-primary small mt-1'>
					{formatRetentionLabel(form.number_of_days_to_keep_data)}
				</div>
			</div>

			<div className='d-flex justify-content-end'>
				<Button
					color='primary'
					icon={saving ? undefined : 'Save'}
					isDisable={!canWrite || !isDirty || saving || uploading || removing}
					onClick={handleSave}
					title={
						!isDirty
							? 'No changes to save'
							: 'Save site settings and/or data retention'
					}>
					{saving ? (
						<span className='d-inline-flex align-items-center gap-2'>
							<Spinner isSmall inButton />
							Saving…
						</span>
					) : (
						'Save'
					)}
				</Button>
			</div>
		</div>
	);
};

export default GeneralSettingsTabContent;

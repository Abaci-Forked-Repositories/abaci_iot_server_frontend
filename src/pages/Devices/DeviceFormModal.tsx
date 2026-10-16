import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useInfiniteQuery } from '@tanstack/react-query';
import Select from 'react-select';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import type { Device } from '../../api/devices/devices';
import { getSites, type Site } from '../../api/sites/sites';
import useSelectStyles from '../../hooks/useSelectStyle';

const SITE_PAGE_SIZE = 20;

type SiteOption = { value: number | null; label: string };

const NONE_SITE_OPTION: SiteOption = { value: null, label: 'None' };

export interface DeviceFormData {
	model: string;
	identifier: string;
	serial_number: string;
	description: string;
	wifi_ip_address: string;
	wifi_mask: string;
	wifi_gateway: string;
	firmware_version: string;
	site: number | null;
}


interface DeviceFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	device: Device | null;
	onSave: (data: DeviceFormData & { id?: number }) => void | Promise<void>;
	saving?: boolean;
	/** True while GET /api/devices/{id}/ is in flight */
	loading?: boolean;
}



const emptyForm: DeviceFormData = {
	model: '',
	identifier: '',
	serial_number: '',
	description: '',
	wifi_ip_address: '',
	wifi_mask: '',
	wifi_gateway: '',
	firmware_version: '',
	site: null,
};

const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	device,
	onSave,
	saving = false,
	loading = false,
}) => {
	const isEdit = mode === 'edit';
	const busy = saving || loading;
	const sharedSelectStyles = useSelectStyles();
	const selectStyles = {
		...sharedSelectStyles,
		menu: (base: Record<string, unknown>) => ({
			...(sharedSelectStyles.menu ? sharedSelectStyles.menu(base) : base),
			maxHeight: 220,
		}),
		menuList: (base: Record<string, unknown>) => ({
			...base,
			maxHeight: 180,
		}),
	};

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<DeviceFormData>({
		defaultValues: emptyForm,
	});

	const {
		data: sitesPages,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: sitesLoading,
	} = useInfiniteQuery({
		queryKey: ['sites', 'device-form'],
		queryFn: ({ pageParam }) => getSites({ page: pageParam, limit: SITE_PAGE_SIZE }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((sum, page) => sum + page.results.length, 0);
			if (lastPage.results.length === 0 || loaded >= lastPage.count) return undefined;
			return allPages.length + 1;
		},
		enabled: isOpen,
	});

	const siteOptions = useMemo(() => {
		const byId = new Map<number, SiteOption>();
		const current = device?.site;
		if (current?.id) {
			byId.set(current.id, {
				value: current.id,
				label: current.name || `Site #${current.id}`,
			});
		}
		(sitesPages?.pages ?? []).forEach((page) => {
			page.results.forEach((site: Site) => {
				byId.set(site.id, { value: site.id, label: site.name });
			});
		});
		return [NONE_SITE_OPTION, ...Array.from(byId.values())];
	}, [sitesPages, device]);

	useEffect(() => {
		if (!isOpen) return;
		if (isEdit && device) {
			reset({
				model: device.model || '',
				identifier: device.identifier || '',
				serial_number: device.serial_number || '',
				description: device.description || '',
				wifi_ip_address: device.wifi_ip_address || '',
				wifi_mask: device.wifi_mask || '',
				wifi_gateway: device.wifi_gateway || '',
				firmware_version: device.firmware_version || '',
				site: device.site?.id ?? null,
			});
		} else if (!isEdit) {
			reset(emptyForm);
		}
	}, [isOpen, isEdit, device, reset]);

	const onSubmit = async (data: DeviceFormData) => {
		if (busy) return;
		if (isEdit && device) {
			await onSave({ ...data, id: device.id });
		} else {
			await onSave(data);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered fade isStaticBackdrop={busy}>
			<ModalHeader setIsOpen={busy ? undefined : setIsOpen}>
				<ModalTitle id='device-form-modal'>
					{isEdit ? 'Edit Device' : 'Add Device'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				{loading && (
					<div className='text-muted small mb-3'>Refreshing device details…</div>
				)}
				<form id='device-form' onSubmit={handleSubmit(onSubmit)}>
					<div className='row g-4'>
						<div className='col-12 col-md-6'>
							<label className='form-label'>Site</label>
							<Controller
								name='site'
								control={control}
								render={({ field }) => (
									<Select<SiteOption, false>
										inputId='device-site'
										classNamePrefix='react-select'
										placeholder='Select site'
										isClearable
										isDisabled={busy}
										isLoading={sitesLoading || isFetchingNextPage}
										options={siteOptions}
										styles={selectStyles}
										menuPortalTarget={document.body}
										menuPosition='fixed'
										value={
											siteOptions.find((option) => option.value === field.value) ??
											NONE_SITE_OPTION
										}
										onChange={(option) => field.onChange(option?.value ?? null)}
										onMenuScrollToBottom={() => {
											if (hasNextPage && !isFetchingNextPage) {
												void fetchNextPage();
											}
										}}
									/>
								)}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Model</label>
							<select
								className='form-select'
								disabled={busy}
								{...register('model')}>
								<option value=''>Select model</option>
								<option value='C3'>C3</option>
								<option value='S3'>S3</option>
							</select>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Identifier</label>
							<input
								className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
								disabled={busy}
								{...register('identifier')}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Serial Number</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('serial_number')}
							/>
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Firmware Version</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('firmware_version')}
							/>
						</div>

						<div className='col-12'>
							<label className='form-label'>Description</label>
							<textarea
								className='form-control'
								rows={3}
								disabled={busy}
								{...register('description')}
							/>
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi IP Address</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('wifi_ip_address')}
							/>
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi Mask</label>
							<input className='form-control' disabled={busy} {...register('wifi_mask')} />
						</div>

						<div className='col-12 col-md-4'>
							<label className='form-label'>WiFi Gateway</label>
							<input
								className='form-control'
								disabled={busy}
								{...register('wifi_gateway')}
							/>
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<Button
					color='secondary'
					onClick={() => setIsOpen(false)}
					className='me-2'
					isDisable={busy}>
					Cancel
				</Button>
				<Button
					color='primary'
					type='submit'
					form='device-form'
					isDisable={busy}>
					{saving ? 'Saving…' : loading ? 'Loading…' : isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default DeviceFormModal;

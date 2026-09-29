import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import type { Device } from '../../api/devices/devices';

export interface DeviceGroupFormData {
	name: string;
	description: string;
	status: string;
	device_ids: number[];
	created_at: string;
}

interface DeviceGroupFormModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	mode: 'add' | 'edit';
	group: (DeviceGroupFormData & { id?: number }) | null;
	onSave: (data: DeviceGroupFormData & { id?: number }) => void | Promise<void>;
	/** Available devices to pick from */
	devices?: Device[];
	saving?: boolean;
}

const emptyForm = {
	name: '',
	description: '',
	status: 'Active',
};

const DeviceGroupFormModal: React.FC<DeviceGroupFormModalProps> = ({
	isOpen,
	setIsOpen,
	mode,
	group,
	onSave,
	devices = [],
	saving = false,
}) => {
	const isEdit = mode === 'edit';
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [deviceSearch, setDeviceSearch] = useState('');

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: emptyForm,
	});

	useEffect(() => {
		if (isOpen) {
			if (isEdit && group) {
				reset({
					name: group.name,
					description: group.description,
					status: group.status,
				});
				setSelectedIds(group.device_ids ?? []);
			} else {
				reset(emptyForm);
				setSelectedIds([]);
			}
			setDeviceSearch('');
		}
	}, [isOpen, isEdit, group, reset]);

	const filteredDevices = useMemo(() => {
		const q = deviceSearch.trim().toLowerCase();
		if (!q) return devices;
		return devices.filter(
			(d) =>
				d.name?.toLowerCase().includes(q) ||
				d.description?.toLowerCase().includes(q) ||
				d.wifi_ssid?.toLowerCase().includes(q) ||
				d.wifi_ip_address?.toLowerCase().includes(q),
		);
	}, [devices, deviceSearch]);

	const allFilteredSelected =
		filteredDevices.length > 0 &&
		filteredDevices.every((d) => selectedIds.includes(d.id));

	const toggleDevice = (id: number) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const toggleSelectAllFiltered = () => {
		if (allFilteredSelected) {
			const filteredIdSet = new Set(filteredDevices.map((d) => d.id));
			setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
		} else {
			setSelectedIds((prev) => {
				const next = new Set(prev);
				filteredDevices.forEach((d) => next.add(d.id));
				return Array.from(next);
			});
		}
	};

	const onSubmit = async (data: typeof emptyForm) => {
		const payload: DeviceGroupFormData & { id?: number } = {
			name: data.name,
			description: data.description,
			status: data.status,
			device_ids: selectedIds,
			created_at:
				isEdit && group?.created_at
					? group.created_at
					: new Date().toISOString().slice(0, 16).replace('T', ' '),
		};
		if (isEdit && group) {
			await onSave({ ...payload, id: group.id });
		} else {
			await onSave(payload);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered fade>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='device-group-form-modal'>
					{isEdit ? 'Edit Device Group' : 'Add Device Group'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<form id='device-group-form' onSubmit={handleSubmit(onSubmit)}>
					<div className='row g-4'>
						<div className='col-12 col-md-6'>
							<label className='form-label'>
								Name <span className='text-danger'>*</span>
							</label>
							<input
								className={`form-control ${errors.name ? 'is-invalid' : ''}`}
								{...register('name', { required: 'Name is required' })}
							/>
							{errors.name && (
								<div className='invalid-feedback'>{errors.name.message}</div>
							)}
						</div>

						<div className='col-12 col-md-6'>
							<label className='form-label'>Status</label>
							<select className='form-select' {...register('status')}>
								<option value='Active'>Active</option>
								<option value='Inactive'>Inactive</option>
							</select>
						</div>

						<div className='col-12'>
							<label className='form-label'>Description</label>
							<textarea
								className='form-control'
								rows={2}
								{...register('description')}
							/>
						</div>

						<div className='col-12'>
							<div className='d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2'>
								<label className='form-label mb-0'>
									Select Devices{' '}
									<span className='text-muted'>
										({selectedIds.length} selected)
									</span>
								</label>
								<input
									type='search'
									className='form-control form-control-sm'
									style={{ maxWidth: 220 }}
									placeholder='Search devices…'
									value={deviceSearch}
									onChange={(e) => setDeviceSearch(e.target.value)}
								/>
							</div>

							<div
								className='border rounded'
								style={{ maxHeight: 280, overflowY: 'auto' }}>
								<div className='d-flex align-items-center gap-2 px-3 py-2 border-bottom bg-light sticky-top'>
									<input
										className='form-check-input m-0'
										type='checkbox'
										id='select-all-devices'
										checked={allFilteredSelected}
										onChange={toggleSelectAllFiltered}
										disabled={filteredDevices.length === 0}
									/>
									<label
										className='form-check-label small fw-semibold mb-0'
										htmlFor='select-all-devices'>
										Select all
										{deviceSearch ? ' (filtered)' : ''}
									</label>
								</div>

								{filteredDevices.length === 0 ? (
									<div className='text-muted text-center py-4 small'>
										No devices found
									</div>
								) : (
									filteredDevices.map((device) => {
										const checked = selectedIds.includes(device.id);
										return (
											<label
												key={device.id}
												className='d-flex align-items-center gap-3 px-3 py-2 border-bottom mb-0'
												style={{ cursor: 'pointer' }}>
												<input
													className='form-check-input m-0 flex-shrink-0'
													type='checkbox'
													checked={checked}
													onChange={() => toggleDevice(device.id)}
												/>
												<div className='flex-grow-1 min-w-0'>
													<div className='fw-semibold text-truncate'>
														{device.name}
													</div>
													<div className='small text-muted text-truncate'>
														{device.description ||
															device.wifi_ip_address ||
															'—'}
													</div>
												</div>
												<span className='badge flex-shrink-0 bg-secondary'>
													{device.firmware_version || 'No FW'}
												</span>
											</label>
										);
									})
								)}
							</div>
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<Button
					color='secondary'
					onClick={() => setIsOpen(false)}
					className='me-2'
					isDisable={saving}>
					Cancel
				</Button>
				<Button
					color='primary'
					onClick={handleSubmit(onSubmit)}
					isDisable={saving}>
					{saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default DeviceGroupFormModal;

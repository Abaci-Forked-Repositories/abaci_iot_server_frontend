import React, { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import Select, { type StylesConfig } from 'react-select';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import { getDevices, type Device } from '../../api/devices/devices';
import useDarkMode from '../../hooks/useDarkMode';

const PAGE_SIZE = 20;
/** Above Bootstrap modal (1055) so the menu is not hidden behind the dialog. */
const MENU_Z_INDEX = 2000;

type DeviceOption = { value: number; label: string };

interface AddUserDevicesModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	/** Device ids already assigned to this user — excluded from the picker. */
	excludedDeviceIds?: number[];
	onSave: (deviceIds: number[]) => void | Promise<void>;
	saving?: boolean;
}

const deviceOptionLabel = (device: Device) => {
	const parts = [device.identifier, device.serial_number, device.model]
		.map((part) => part?.trim())
		.filter(Boolean);
	return parts.length > 0 ? parts.join(' · ') : `Device #${device.id}`;
};

const AddUserDevicesModal: React.FC<AddUserDevicesModalProps> = ({
	isOpen,
	setIsOpen,
	excludedDeviceIds = [],
	onSave,
	saving = false,
}) => {
	const [selected, setSelected] = useState<DeviceOption[]>([]);
	const { darkModeStatus } = useDarkMode();

	const selectStyles: StylesConfig<DeviceOption, true> = {
		control: (base) => ({
			...base,
			minHeight: 42,
			backgroundColor: darkModeStatus ? '#212529' : '#F8F9FA',
			borderColor: darkModeStatus ? '#343A40' : '#EBECED',
			fontSize: '13px',
			fontWeight: 600,
		}),
		menuPortal: (base) => ({
			...base,
			zIndex: MENU_Z_INDEX,
		}),
		menu: (base) => ({
			...base,
			zIndex: MENU_Z_INDEX,
			maxHeight: 280,
			backgroundColor: darkModeStatus ? '#212529' : '#fff',
		}),
		menuList: (base) => ({
			...base,
			maxHeight: 260,
			paddingTop: 4,
			paddingBottom: 4,
		}),
		option: (base, state) => ({
			...base,
			backgroundColor: state.isFocused
				? darkModeStatus
					? '#343A40'
					: '#EFF2F7'
				: 'transparent',
			color: darkModeStatus ? '#fff' : '#212529',
			fontSize: '13px',
			cursor: 'pointer',
		}),
		multiValue: (base) => ({
			...base,
			backgroundColor: darkModeStatus ? '#343A40' : '#E9ECEF',
		}),
		multiValueLabel: (base) => ({
			...base,
			color: darkModeStatus ? '#fff' : '#212529',
		}),
		placeholder: (base) => ({
			...base,
			color: '#6c757d',
		}),
	};

	const excluded = useMemo(() => new Set(excludedDeviceIds), [excludedDeviceIds]);

	const {
		data: devicePages,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ['devices', 'user-assign'],
		queryFn: ({ pageParam }) => getDevices({ page: pageParam, limit: PAGE_SIZE }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((sum, page) => sum + page.results.length, 0);
			if (lastPage.results.length === 0 || loaded >= lastPage.count) return undefined;
			return allPages.length + 1;
		},
		enabled: isOpen,
	});

	const options = useMemo(() => {
		const byId = new Map<number, DeviceOption>();
		(devicePages?.pages ?? []).forEach((page) => {
			page.results.forEach((device: Device) => {
				if (!device?.id || excluded.has(device.id)) return;
				byId.set(device.id, {
					value: device.id,
					label: deviceOptionLabel(device),
				});
			});
		});
		return Array.from(byId.values());
	}, [devicePages, excluded]);

	useEffect(() => {
		if (!isOpen) {
			setSelected([]);
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		if (saving || selected.length === 0) return;
		await onSave(selected.map((option) => option.value));
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			size='md'
			isCentered
			fade
			isStaticBackdrop={saving}>
			<ModalHeader setIsOpen={saving ? undefined : setIsOpen}>
				<ModalTitle id='add-user-devices-modal'>Add Devices</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<label className='form-label' htmlFor='user-devices'>
					Devices
				</label>
				<Select<DeviceOption, true>
					inputId='user-devices'
					classNamePrefix='react-select'
					placeholder='Select devices'
					isMulti
					isClearable
					isDisabled={saving}
					isLoading={isLoading || isFetchingNextPage}
					options={options}
					styles={selectStyles}
					menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
					menuPosition='fixed'
					menuShouldBlockScroll
					menuShouldScrollIntoView={false}
					closeMenuOnSelect={false}
					hideSelectedOptions={false}
					noOptionsMessage={() =>
						isLoading
							? 'Loading devices…'
							: isError
								? 'Failed to load devices'
								: 'No devices available'
					}
					value={selected}
					onChange={(value) => setSelected(value ? [...value] : [])}
					onMenuScrollToBottom={() => {
						if (hasNextPage && !isFetchingNextPage) {
							void fetchNextPage();
						}
					}}
				/>
				{isError && (
					<div className='text-danger small mt-2'>Could not load the device list.</div>
				)}
				{!isLoading && !isError && options.length === 0 && (
					<div className='text-muted small mt-2'>
						No more devices available to assign.
					</div>
				)}
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
					onClick={handleSubmit}
					isDisable={saving || selected.length === 0}>
					{saving ? 'Adding…' : 'Add'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default AddUserDevicesModal;

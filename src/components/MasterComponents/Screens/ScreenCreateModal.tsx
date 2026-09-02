import React, { useState } from 'react';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Icon from '../../icon/Icon';
import ImageCropper from '../../CustomComponent/ImageCropper';
import dataUrlToFile from '../../../helpers/dataUrlToFile';
import type { CreateScreenPayload } from '../../../services/screensManagementApi';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateScreenPayload, backgroundImage?: File | null) => Promise<void>;
}

const noopSetValue = () => {};

const fieldLabelClass = 'form-label text-muted small text-uppercase fw-semibold mb-2';

interface ToggleSettingCardProps {
	id: string;
	label: string;
	checked: boolean;
	disabled: boolean;
	onChange: (checked: boolean) => void;
	enabledTitle: string;
	disabledTitle: string;
	enabledHint: string;
	disabledHint: string;
	iconOn: string;
	iconOff: string;
	activeBorderClass: string;
	activeIconWrapClass: string;
	activeTextClass: string;
	iconColorOn: 'primary' | 'success';
}

const ToggleSettingCard: React.FC<ToggleSettingCardProps> = ({
	id,
	label,
	checked,
	disabled,
	onChange,
	enabledTitle,
	disabledTitle,
	enabledHint,
	disabledHint,
	iconOn,
	iconOff,
	activeBorderClass,
	activeIconWrapClass,
	activeTextClass,
	iconColorOn,
}) => (
	<div className='h-100 d-flex flex-column'>
		<label className={fieldLabelClass} htmlFor={id}>
			{label}
		</label>
		<div
			className={[
				'flex-grow-1 d-flex align-items-center justify-content-between gap-2 p-2 p-md-3 rounded-3 border transition-all',
				checked ? activeBorderClass : 'border-secondary border-opacity-25 bg-body',
			].join(' ')}>
			<div className='d-flex align-items-center gap-2 min-w-0'>
				<span
					className={[
						'd-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0',
						checked ? activeIconWrapClass : 'bg-body-secondary',
					].join(' ')}
					style={{ width: 32, height: 32 }}>
					<Icon
						icon={checked ? iconOn : iconOff}
						color={checked ? iconColorOn : 'secondary'}
						size='sm'
					/>
				</span>
				<div className='min-w-0'>
					<div className={`fw-semibold small ${checked ? activeTextClass : 'text-body'}`}>
						{checked ? enabledTitle : disabledTitle}
					</div>
					<div className='text-muted small lh-sm'>
						{checked ? enabledHint : disabledHint}
					</div>
				</div>
			</div>
			<div className='form-check form-switch m-0 flex-shrink-0'>
				<input
					className='form-check-input'
					type='checkbox'
					role='switch'
					id={id}
					checked={checked}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked)}
				/>
			</div>
		</div>
	</div>
);

const ScreenCreateModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [description, setDescription] = useState('');
	const [ipAddress, setIpAddress] = useState('');
	const [ipBind, setIpBind] = useState(false);
	const [isActive, setIsActive] = useState(true);
	const [croppedImage, setCroppedImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const resetForm = () => {
		setName('');
		setLocation('');
		setDescription('');
		setIpAddress('');
		setIpBind(false);
		setIsActive(true);
		setCroppedImage(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) return;
		setLoading(true);
		try {
			const payload: CreateScreenPayload = {
				name: name.trim(),
				location: location.trim(),
				description: description.trim(),
				ip_address: ipAddress.trim() || null,
				ip_bind: ipBind,
				is_active: isActive,
			};

			const backgroundFile = croppedImage
				? dataUrlToFile(croppedImage, 'background_image.jpg')
				: null;

			await onSubmit(payload, backgroundFile);
			handleClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' isCentered isAnimation={false}>
			<ModalHeader setIsOpen={handleClose}>
				<ModalTitle id='new-screen-modal'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon='Add' color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>Add screen</div>
							<div className='text-muted small fw-normal mt-1'>
								Register a display device and configure its network settings
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>
			<ModalBody className='pt-2 pb-3'>
				<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3'>
					<div className='row g-3'>
						<div className='col-md-6'>
							<label className={fieldLabelClass} htmlFor='screen-create-name'>
								Name *
							</label>
							<input
								id='screen-create-name'
								className='form-control rounded-3'
								type='text'
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder='Screen name'
								autoFocus
								autoComplete='off'
								disabled={loading}
							/>
						</div>

						<div className='col-md-6'>
							<label className={fieldLabelClass} htmlFor='screen-create-location'>
								Location
							</label>
							<input
								id='screen-create-location'
								className='form-control rounded-3'
								type='text'
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder='e.g. Lobby, Counter 2'
								autoComplete='off'
								disabled={loading}
							/>
						</div>

						<div className='col-12'>
							<label className={fieldLabelClass} htmlFor='screen-create-description'>
								Description
							</label>
							<textarea
								id='screen-create-description'
								className='form-control rounded-3'
								rows={2}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder='Optional notes'
								disabled={loading}
							/>
						</div>

						<div className='col-12'>
							<label className={fieldLabelClass} htmlFor='screen-create-background-image'>
								Screen background image
							</label>
							<div className='rounded-3 border border-secondary border-opacity-25 bg-body p-2'>
								<div className='screen-create-background-cropper'>
									<ImageCropper
										croppedImage={croppedImage}
										setCroppedImage={setCroppedImage}
										setValue={noopSetValue}
										withoutRatio
									/>
								</div>
							</div>
						</div>

						<div className='col-12'>
							<label className={fieldLabelClass} htmlFor='screen-create-ip-address'>
								IP address
							</label>
							<input
								id='screen-create-ip-address'
								className='form-control rounded-3'
								type='text'
								value={ipAddress}
								onChange={(e) => setIpAddress(e.target.value)}
								placeholder='e.g. 192.168.1.100'
								autoComplete='off'
								disabled={loading}
							/>
						</div>

						<div className='col-md-6'>
							<ToggleSettingCard
								id='screen-create-ip-bind'
								label='IP bind'
								checked={ipBind}
								disabled={loading}
								onChange={setIpBind}
								enabledTitle='Enabled'
								disabledTitle='Disabled'
								enabledHint='Restricted to configured IP'
								disabledHint='No IP restriction'
								iconOn='Router'
								iconOff='SettingsEthernet'
								activeBorderClass='border-primary bg-primary bg-opacity-10'
								activeIconWrapClass='bg-primary bg-opacity-15'
								activeTextClass='text-primary'
								iconColorOn='primary'
							/>
						</div>

						<div className='col-md-6'>
							<ToggleSettingCard
								id='screen-create-active'
								label='Active'
								checked={isActive}
								disabled={loading}
								onChange={setIsActive}
								enabledTitle='Active'
								disabledTitle='Inactive'
								enabledHint='Screen can display content'
								disabledHint='Screen is disabled'
								iconOn='CheckCircle'
								iconOff='Block'
								activeBorderClass='border-success bg-success bg-opacity-10'
								activeIconWrapClass='bg-success bg-opacity-15'
								activeTextClass='text-success'
								iconColorOn='success'
							/>
						</div>
					</div>
				</div>
			</ModalBody>
			<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
				<Button color='secondary' isLight type='button' onClick={handleClose} isDisable={loading}>
					Cancel
				</Button>
				<Button
					color='primary'
					type='button'
					icon='Add'
					isDisable={!name.trim() || loading}
					onClick={() => void handleSubmit()}>
					{loading ? (
						<>
							<Spinner isSmall inButton />
							Creating…
						</>
					) : (
						'Create screen'
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ScreenCreateModal;

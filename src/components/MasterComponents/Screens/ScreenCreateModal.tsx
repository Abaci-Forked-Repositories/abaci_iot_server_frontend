import React, { useState } from 'react';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Spinner from '../../bootstrap/Spinner';
import Checks from '../../bootstrap/forms/Checks';
import type { CreateScreenPayload } from '../../../services/screensManagementApi';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateScreenPayload) => Promise<void>;
}

const ScreenCreateModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [description, setDescription] = useState('');
	const [isActive, setIsActive] = useState(true);
	const [loading, setLoading] = useState(false);

	const handleClose = () => {
		setName('');
		setLocation('');
		setDescription('');
		setIsActive(true);
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) return;
		setLoading(true);
		try {
			await onSubmit({
				name: name.trim(),
				location: location.trim(),
				description: description.trim(),
				is_active: isActive,
			});
			handleClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' isCentered>
			<ModalHeader setIsOpen={handleClose}>
				<ModalTitle id='new-screen-modal'>Add screen</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<div className='mb-3'>
					<label className='form-label' htmlFor='screen-create-name'>
						Name
					</label>
					<input
						id='screen-create-name'
						className='form-control'
						type='text'
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder='Screen name'
						autoFocus
						autoComplete='off'
					/>
				</div>
				<div className='mb-3'>
					<label className='form-label' htmlFor='screen-create-location'>
						Location
					</label>
					<input
						id='screen-create-location'
						className='form-control'
						type='text'
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder='e.g. Lobby, Counter 2'
						autoComplete='off'
					/>
				</div>
				<div className='mb-3'>
					<label className='form-label' htmlFor='screen-create-description'>
						Description
					</label>
					<textarea
						id='screen-create-description'
						className='form-control'
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder='Optional notes'
					/>
				</div>
				<Checks
					id='screen-create-active'
					type='switch'
					label='Active'
					checked={isActive}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
				/>
			</ModalBody>
			<ModalFooter>
				<Button color='primary' isDisable={!name.trim() || loading} onClick={handleSubmit}>
					{loading ? <Spinner isSmall /> : 'Create screen'}
				</Button>
				<Button color='light' onClick={handleClose}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ScreenCreateModal;

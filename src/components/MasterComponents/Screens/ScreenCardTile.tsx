import React, { useEffect, useState } from 'react';
import Icon from '../../icon/Icon';
import type { Screen } from '../../../services/screensManagementApi';

interface ScreenCardTileProps {
	screen: Screen;
	onOpen: (screen: Screen) => void;
	onDelete: (screen: Screen) => void;
	deleting?: boolean;
}

const ScreenCardTile: React.FC<ScreenCardTileProps> = ({
	screen,
	onOpen,
	onDelete,
	deleting = false,
}) => {
	const [hovered, setHovered] = useState(false);
	const [thumbFailed, setThumbFailed] = useState(false);
	const backgroundImage = screen.background_image?.trim() || null;

	useEffect(() => {
		setThumbFailed(false);
	}, [screen.id, backgroundImage]);

	return (
		<div
			role='button'
			tabIndex={0}
			className={`screen-card-tile${deleting ? ' screen-card-tile--deleting' : ''}`}
			onClick={() => !deleting && onOpen(screen)}
			onKeyDown={(event) => {
				if (deleting) return;
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onOpen(screen);
				}
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}>
			{hovered && !deleting && (
				<div className='screen-card-actions'>
					<button
						type='button'
						className='screen-card-action-btn screen-card-action-btn--delete'
						title='Delete screen'
						onClick={(event) => {
							event.stopPropagation();
							onDelete(screen);
						}}>
						<Icon icon='Delete' className='screen-card-action-icon' />
					</button>
				</div>
			)}
			<div className='screen-card-tile-top'>
				<span className={`screen-card-led ${screen.is_online ? 'is-online' : 'is-offline'}`} />
				<span className={`screen-card-status ${screen.is_online ? 'is-active' : 'is-inactive'}`}>
					{screen.is_online ? 'ACTIVE' : 'INACTIVE'}
				</span>
			</div>
			<div className='screen-card-thumb'>
				{backgroundImage && !thumbFailed ? (
					<img
						className='screen-card-thumb-img'
						src={backgroundImage}
						alt={`${screen.name} background`}
						draggable={false}
						onError={() => setThumbFailed(true)}
					/>
				) : (
					<Icon icon='Tv' size='3x' className='screen-card-icon' />
				)}
			</div>
			<div className='screen-card-title' title={screen.name}>
				{screen.name}
			</div>
			<div className='screen-card-meta'>
				<Icon icon='LaptopMac' className='screen-card-meta-icon' />
				<span>{screen.description || 'Browser • Mozilla/5.0'}</span>
			</div>
			<div className='screen-card-meta'>
				<Icon icon='Public' className='screen-card-meta-icon' />
				<span>{screen.location || 'Unknown location'}</span>
			</div>
		</div>
	);
};

export default ScreenCardTile;

import React from 'react';
import Icon from '../../icon/Icon';
import type { Screen } from '../../../services/screensManagementApi';

interface ScreenCardTileProps {
	screen: Screen;
	onOpen: (screen: Screen) => void;
}

const ScreenCardTile: React.FC<ScreenCardTileProps> = ({ screen, onOpen }) => {
	return (
		<div
			role='button'
			tabIndex={0}
			className='screen-card-tile'
			onClick={() => onOpen(screen)}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onOpen(screen);
				}
			}}>
			<div className='screen-card-tile-top'>
				<span className={`screen-card-led ${screen.is_online ? 'is-online' : 'is-offline'}`} />
				<span className={`screen-card-status ${screen.is_online ? 'is-active' : 'is-inactive'}`}>
					{screen.is_online ? 'ACTIVE' : 'INACTIVE'}
				</span>
			</div>
			<div className='screen-card-thumb'>
				<Icon icon='Tv' size='3x' className='screen-card-icon' />
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

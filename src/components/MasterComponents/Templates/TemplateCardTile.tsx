import React, { useState } from 'react';
import Icon from '../../icon/Icon';
import type { Template } from '../../../services/templatesApi';

interface TemplateCardTileProps {
	template: Template;
	thumbSize?: number;
	onOpen: (template: Template) => void;
	onDelete: (template: Template) => void;
	onToggleFavourite: (template: Template) => void;
	isSelected?: boolean;
	onToggleSelect: (template: Template) => void;
}

const TemplateCardTile: React.FC<TemplateCardTileProps> = ({
	template,
	thumbSize = 138,
	onOpen,
	onDelete,
	onToggleFavourite,
	isSelected = false,
	onToggleSelect,
}) => {
	const [hovered, setHovered] = useState(false);

	const outerSize = thumbSize + 10;

	const orientationLabel =
		template.orientation === 'Landscape'
			? `${template.resolution_width}×${template.resolution_height}`
			: `${template.resolution_width}×${template.resolution_height}`;

	return (
		<div
			role='button'
			tabIndex={0}
			className={`gp-card canvas-gp-card tpl-card${isSelected ? ' tpl-card--selected' : ''}`}
			style={{ width: outerSize, height: outerSize, flex: `0 0 ${outerSize}px` }}
			onClick={() => onOpen(template)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onOpen(template);
				}
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}>
			<button
				type='button'
				className={`tpl-select-control${isSelected ? ' is-selected' : ''}`}
				title={isSelected ? 'Deselect template' : 'Select template'}
				onClick={(e) => {
					e.stopPropagation();
					onToggleSelect(template);
				}}>
				<Icon icon='Check' className='tpl-select-check' />
			</button>

			{template.thumbnail ? (
				<img
					className='canvas-gp-img'
					src={template.thumbnail}
					alt={template.template_name}
					draggable={false}
				/>
			) : (
				<div className='tpl-card-placeholder'>
					<Icon icon='ViewCompact' className='tpl-card-placeholder-icon' />
				</div>
			)}

			{hovered && template.template_name && (
				<div className='tpl-hover-name' title={template.template_name}>
					{template.template_name}
				</div>
			)}

			{hovered && (
				<div className='tpl-top-actions'>
					<button
						type='button'
						className='tpl-icon-btn tpl-icon-btn--favourite'
						title={template.is_favourite ? 'Remove favourite' : 'Add favourite'}
						onClick={(e) => {
							e.stopPropagation();
							onToggleFavourite(template);
						}}>
						<Icon
							icon={template.is_favourite ? 'Star' : 'StarBorder'}
							className='tpl-action-icon'
						/>
					</button>
					<button
						type='button'
						className='tpl-icon-btn tpl-icon-btn--edit'
						title='Open template'
						onClick={(e) => {
							e.stopPropagation();
							onOpen(template);
						}}>
						<Icon icon='Edit' className='tpl-action-icon' />
					</button>
					<button
						type='button'
						className='tpl-icon-btn tpl-icon-btn--delete'
						title='Delete template'
						onClick={(e) => {
							e.stopPropagation();
							onDelete(template);
						}}>
						<Icon icon='Delete' className='tpl-action-icon' />
					</button>
				</div>
			)}

			<div className='tpl-orientation-badge'>
				<span className={`tpl-orient-dot tpl-orient-dot--${template.orientation.toLowerCase()}`} />
				<span className='tpl-orient-label'>
					{template.orientation} · {orientationLabel}
				</span>
			</div>
		</div>
	);
};

export default TemplateCardTile;

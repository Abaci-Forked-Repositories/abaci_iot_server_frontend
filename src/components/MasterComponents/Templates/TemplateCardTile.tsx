import React, { useEffect, useState } from 'react';
import Icon from '../../icon/Icon';
import type { Template } from '../../../services/templatesApi';
import usePermissions from '../../../hooks/usePermissions';

interface TemplateCardTileProps {
	template: Template;
	thumbSize?: number;
	onOpen: (template: Template) => void;
	onDelete: (template: Template) => void;
	isSelected?: boolean;
	onToggleSelect: (template: Template) => void;
	/** Selection-only card (e.g. assign-to-screen modal) — no edit/delete actions */
	pickMode?: boolean;
	/** Display-only card (e.g. edit assignment modal) — no interactions */
	readOnly?: boolean;
}

/** Must match `.tpl-card` horizontal padding in `_templates.scss`. */
const TEMPLATE_CARD_PADDING = 12;

const TemplateCardTile: React.FC<TemplateCardTileProps> = ({
	template,
	thumbSize = 138,
	onOpen,
	onDelete,
	isSelected = false,
	onToggleSelect,
	pickMode = false,
	readOnly = false,
}) => {
	const [hovered, setHovered] = useState(false);
	const [thumbFailed, setThumbFailed] = useState(false);
	const { can } = usePermissions();
	const canWrite = can('templates_write');

	useEffect(() => {
		setThumbFailed(false);
	}, [template.id, template.thumbnail]);

	const cardWidth = thumbSize + TEMPLATE_CARD_PADDING * 2;

	const orientation = template.orientation ?? 'Landscape';
	const orientationKey = orientation.toLowerCase() as 'landscape' | 'portrait';
	const orientationLabel = `${template.resolution_width ?? '—'}×${template.resolution_height ?? '—'}`;

	const showActions = !pickMode && !readOnly && hovered && canWrite;
	const showToolbar = !readOnly && (showActions || pickMode || isSelected || hovered);

	return (
		<div
			role={readOnly ? undefined : 'button'}
			tabIndex={readOnly ? undefined : 0}
			className={[
				'tpl-card',
				isSelected ? 'tpl-card--selected' : '',
				readOnly ? 'tpl-card--readonly' : '',
				pickMode ? 'tpl-card--pick-mode' : '',
				hovered && !readOnly ? 'tpl-card--hovered' : '',
			]
				.filter(Boolean)
				.join(' ')}
			style={{ width: cardWidth, flex: `0 0 ${cardWidth}px` }}
			onClick={
				readOnly ? undefined : () => (pickMode ? onToggleSelect(template) : onOpen(template))
			}
			onKeyDown={
				readOnly
					? undefined
					: (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								pickMode ? onToggleSelect(template) : onOpen(template);
							}
						}
			}
			onMouseEnter={readOnly ? undefined : () => setHovered(true)}
			onMouseLeave={readOnly ? undefined : () => setHovered(false)}>
			<div className='tpl-card__preview' style={{ height: thumbSize }}>
				{template?.thumbnail && !thumbFailed ? (
					<img
						className='tpl-card__img'
						src={template.thumbnail}
						alt={template?.template_name}
						draggable={false}
						onError={() => setThumbFailed(true)}
					/>
				) : (
					<div className='tpl-card-placeholder'>
						<Icon icon='ViewCompact' className='tpl-card-placeholder-icon' />
						<span className='tpl-card-placeholder-label'>No preview</span>
					</div>
				)}

				<div className='tpl-card__preview-overlay' aria-hidden />

				{showToolbar && (
					<div className='tpl-card__toolbar'>
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

						{showActions && (
							<div className='tpl-top-actions'>
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
					</div>
				)}
			</div>

			<div className='tpl-card__footer'>
				<div className='tpl-card__name' title={template.template_name}>
					{template?.template_name || 'Untitled template'}
				</div>
				<div className='tpl-orientation-badge'>
					<span className={`tpl-orient-dot tpl-orient-dot--${orientationKey}`} />
					<span className='tpl-orient-label'>
						{orientation} · {orientationLabel}
					</span>
				</div>
			</div>
		</div>
	);
};

export default TemplateCardTile;

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Icon from '../../icon/Icon';

export interface ServingPointPickCardProps {
	name: string;
	description?: string | null;
	selected: boolean;
	disabled?: boolean;
	onClick: () => void;
	index?: number;
}

const ServingPointPickCard: React.FC<ServingPointPickCardProps> = ({
	name,
	description,
	selected,
	disabled = false,
	onClick,
	index = 0,
}) => {
	const reduceMotion = useReducedMotion();

	return (
		<motion.button
			type='button'
			disabled={disabled}
			onClick={onClick}
			className={`sp-pick-card${selected ? ' is-selected' : ''}`}
			initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			whileHover={disabled || reduceMotion ? undefined : { y: -5 }}
			whileTap={disabled || reduceMotion ? undefined : { scale: 0.97 }}
			transition={{
				type: 'spring',
				stiffness: 420,
				damping: 30,
				delay: reduceMotion ? 0 : Math.min(index, 8) * 0.04,
			}}>
			<span className='sp-pick-card__check' aria-hidden>
				<AnimatePresence>
					{selected && (
						<motion.span
							key='check'
							className='sp-pick-card__check-mark'
							initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
							transition={{ type: 'spring', stiffness: 520, damping: 24 }}>
							<Icon icon='Check' size='sm' color='light' />
						</motion.span>
					)}
				</AnimatePresence>
			</span>
			<span className='sp-pick-card__icon'>
				<Icon icon='Monitor' className='sp-pick-card__icon-svg' />
			</span>
			<span className='sp-pick-card__copy'>
				<span className='sp-pick-card__name'>{name}</span>
				{description ? <span className='sp-pick-card__desc'>{description}</span> : null}
			</span>
		</motion.button>
	);
};

export default ServingPointPickCard;

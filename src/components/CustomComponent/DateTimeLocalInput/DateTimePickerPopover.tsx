import React, {
	cloneElement,
	FC,
	ReactElement,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import classNames from 'classnames';

type PopoverPlacement =
	| 'auto'
	| 'auto-start'
	| 'auto-end'
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'right'
	| 'right-start'
	| 'right-end'
	| 'left'
	| 'left-start'
	| 'left-end';

export interface DateTimePickerPopoverProps {
	children: ReactElement;
	content: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	placement?: PopoverPlacement;
	className?: string;
	bodyClassName?: string;
}

function getPortalTarget(): HTMLElement {
	return document.getElementById('portal-root') ?? document.body;
}

/**
 * Self-contained popover for DateTimeLocalInput.
 * Uses fixed positioning so it works inside modals.
 */
const DateTimePickerPopover: FC<DateTimePickerPopoverProps> = ({
	children,
	content,
	isOpen,
	onOpenChange,
	placement = 'bottom-start',
	className,
	bodyClassName,
}) => {
	const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
	const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

	const { styles, attributes } = usePopper(referenceElement, popperElement, {
		placement,
		strategy: 'fixed',
		modifiers: [
			{
				name: 'offset',
				options: { offset: [0, 6] },
			},
			{
				name: 'flip',
				enabled: true,
				options: {
					fallbackPlacements: ['bottom-start', 'top-start', 'bottom-end', 'top-end'],
				},
			},
			{
				name: 'preventOverflow',
				options: {
					padding: 12,
					rootBoundary: 'viewport',
				},
			},
		],
	});

	useEffect(() => {
		if (!isOpen) return undefined;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				popperElement &&
				!popperElement.contains(target) &&
				referenceElement &&
				!referenceElement.contains(target)
			) {
				onOpenChange(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, onOpenChange, popperElement, referenceElement]);

	const handleTriggerClick = () => {
		onOpenChange(!isOpen);
		if (typeof children !== 'string' && children.props?.onClick) {
			children.props.onClick();
		}
	};

	const triggerProps = {
		onClick: handleTriggerClick,
		className: classNames(children.props?.className),
	};

	return (
		<>
			{cloneElement(children, {
				ref: setReferenceElement,
				...triggerProps,
			})}
			{isOpen &&
				createPortal(
					<div
						ref={setPopperElement}
						role='dialog'
						aria-modal='false'
						data-modal-ignore-backdrop
						className={classNames('popover bs-popover-auto show', className)}
						style={styles.popper}
						{...attributes.popper}>
						<div className={classNames('popover-body', bodyClassName)}>{content}</div>
					</div>,
					getPortalTarget(),
				)}
		</>
	);
};

export default DateTimePickerPopover;

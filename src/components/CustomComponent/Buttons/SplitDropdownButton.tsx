import React, { useCallback, useState } from 'react';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '../../bootstrap/Dropdown';
import Button from '../../bootstrap/Button';
import type { TColor } from '../../../type/color-type';

export interface SplitDropdownMenuItem {
	label: string;
	onClick: () => void;
}

export interface SplitDropdownButtonProps {
	mainLabel: React.ReactNode;
	mainIcon?: string;
	color?: TColor;
	mainIsLight?: boolean;
	/** Solid caret segment (contrast vs light main). Default true. */
	caretSolid?: boolean;
	isOutline?: boolean;
	isDisable?: boolean;
	mainTitle?: string;
	className?: string;
	dropdownMenuAlignmentEnd?: boolean;
	onMainClick: () => void;
	menuItems: SplitDropdownMenuItem[];
}

/**
 * Split primary button + caret dropdown (same pattern as `ButtonWithPopover`).
 * Empty `menuItems` → single main button only.
 */
const SplitDropdownButton: React.FC<SplitDropdownButtonProps> = ({
	mainLabel,
	mainIcon,
	color = 'primary',
	mainIsLight = true,
	caretSolid = true,
	isOutline = false,
	isDisable = false,
	mainTitle,
	className,
	dropdownMenuAlignmentEnd = true,
	onMainClick,
	menuItems,
}) => {
	const [open, setOpen] = useState(false);
	const hasMenu = menuItems.length > 0;

	const runMenuItem = useCallback((fn: () => void) => {
		setOpen(false);
		fn();
	}, []);

	if (!hasMenu) {
		return (
			<Button
				color={color}
				isLight={mainIsLight}
				isOutline={isOutline}
				icon={mainIcon}
				isDisable={isDisable}
				title={mainTitle}
				className={className}
				onClick={onMainClick}>
				{mainLabel}
			</Button>
		);
	}

	const caretIsLight = caretSolid ? false : mainIsLight;

	return (
		<Dropdown isButtonGroup className={className} isOpen={open} setIsOpen={setOpen}>
			<Button
				color={color}
				isLight={mainIsLight}
				isOutline={isOutline}
				icon={mainIcon}
				isDisable={isDisable}
				title={mainTitle}
				onClick={onMainClick}>
				{mainLabel}
			</Button>
		<DropdownToggle>
			<Button
				color={color}
				isLight={caretIsLight}
				isOutline={isOutline}
				isVisuallyHidden
			/>
		</DropdownToggle>
			<DropdownMenu isAlignmentEnd={dropdownMenuAlignmentEnd}>
				{menuItems.map((item, index) => (
					<DropdownItem key={`${item.label}-${index}`}>
						<Button isDisable={isDisable} onClick={() => runMenuItem(item.onClick)}>
							{item.label}
						</Button>
					</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	);
};

export default SplitDropdownButton;

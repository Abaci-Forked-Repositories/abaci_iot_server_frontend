import React from 'react'
import Button from '../../bootstrap/Button'
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '../../bootstrap/Dropdown'

const getOptionKey = (option: any, labelField: string) => {
	if (option == null) return undefined;
	if (option.value !== undefined && option.value !== null) return option.value;
	if (labelField) return option[labelField];
	return option;
};

function DropDownFilter({
	options,
	onChange,
	selectedOption,
	color,
	labelField,
	direction,
	icon,
	buttonClassName,
}: any) {
    const formattingLabel = (label: string) => {
        if (!label) return 'Select';
        return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    const selectedKey = getOptionKey(selectedOption, labelField);

    return (
        <Dropdown direction={direction}>
            <DropdownToggle hasIcon>
                <Button color="primary" isLight icon={icon} className={buttonClassName}>
                    {formattingLabel(selectedOption?.[labelField]) || 'Select'}
                </Button>
            </DropdownToggle>
            <DropdownMenu
                color={color}

            >
                <div
                    className='d-flex flex-column gap-2'
                    style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {options.map((option, index) => {
                        const isSelected = getOptionKey(option, labelField) === selectedKey;
                        return (
                            <DropdownItem
                                key={option?.value ?? index}
                                onClick={() => {
                                    if (isSelected) return;
                                    onChange(option);
                                }}
                            >
                                <span className={isSelected ? 'active' : undefined}>
                                    {formattingLabel(option[labelField])}
                                </span>
                            </DropdownItem>
                        );
                    })}
                </div>
            </DropdownMenu>
        </Dropdown>
    )
}

export default DropDownFilter
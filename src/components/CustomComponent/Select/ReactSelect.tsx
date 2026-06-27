import React from 'react'
import Select from 'react-select'
import useDarkMode from '../../../hooks/useDarkMode'

interface ReactSelectWithStateProps {
	options: { value: number | string; label: string }[]
	value: unknown
	setValue: (value: unknown) => void
	isClearable?: boolean
	placeholder?: string
	isMulti?: boolean
	className?: string
	/** Cap chip area height and scroll when many items are selected (multi only). */
	scrollableMultiValues?: boolean
	multiValueMaxHeight?: number
}

const ReactSelectWithState = ({
	options,
	value,
	setValue,
	isClearable = false,
	placeholder,
	isMulti = false,
	className = 'react-select',
	scrollableMultiValues = true,
	multiValueMaxHeight = 120,
}: ReactSelectWithStateProps) => {
    const { darkModeStatus } = useDarkMode();

    const customStyles = {
        menu: (base) => ({
            ...base,
            maxHeight: "150px",
            zIndex: 9999,
        }),
        control: (provided, state) => {
            let borderColor = "#F8F9FA"; // default
            let hoverBorderColor = "#F8F9FA";
            let boxShadow = "";

            if (state.isFocused) {
                borderColor = "#DFDFDF"; // blue when focused
                hoverBorderColor = "#DFDFDF";
                boxShadow = darkModeStatus ? "0 0 0 3px #35373C" : "0 0 0 3px #DFDFDF";
            }

            return {
                ...provided,
                height: isMulti ? 'auto' : '40px',
                minHeight: isMulti ? '40px' : '40px',
                border: darkModeStatus ? "1px solid #34393F" : boxShadow === '' ? '1px solid #ededed' : '',
                // borderRadius: '15px',
                backgroundColor: darkModeStatus ? "#212529" : "#F8F9FA",
                borderColor,
                boxShadow,
                fontWeight: 600,
                fontSize: "13px",
                zIndex: 'auto',
                alignItems: isMulti ? 'flex-start' : 'center',
                ":hover": {
                    borderColor: darkModeStatus ? "#34393F" : hoverBorderColor,
                },
            };
        },
        valueContainer: (provided) => ({
            ...provided,
            ...(isMulti && scrollableMultiValues
                ? {
                        maxHeight: `${multiValueMaxHeight}px`,
                        overflowY: 'auto' as const,
                        flexWrap: 'wrap' as const,
                        paddingTop: '4px',
                        paddingBottom: '4px',
                        alignItems: 'flex-start',
                  }
                : {}),
        }),
        multiValue: (provided) => ({
            ...provided,
            margin: '2px',
            maxWidth: '100%',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            ...(isMulti
                ? {
                        alignSelf: 'flex-start',
                        paddingTop: '6px',
                  }
                : {}),
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: "150px",
            backgroundColor: darkModeStatus ? "#212529" : "white",
            zIndex: 9999
        }),
        menuPortal: (base) => ({
            ...base,
            backgroundColor: darkModeStatus ? "#212529" : "white",
            zIndex: 9999,
        }),
        singleValue: (provided) => ({
            ...provided,
            color: darkModeStatus ? 'white' : 'black',
        }),
        option: (provided, state) => ({
            ...provided,
            zIndex: 9999,
            backgroundColor: state.isFocused ? (darkModeStatus ? "#35373C" : "#EFF2F7") : '',
            color: state.isFocused ? (darkModeStatus ? "white" : "black") : (darkModeStatus ? "white" : "inherit"),
            ":active": {
                backgroundColor: darkModeStatus ? "#35373C" : "#EFF2F7",
            },
        }),
    };

    return (
        <Select
            placeholder={placeholder}
            isMulti={isMulti}
            onChange={(values) => {
                setValue(values)
            }}
            className={className}
            isClearable={isClearable}
            styles={customStyles}
            options={options}
            value={value}
        />
    )
}

export default ReactSelectWithState

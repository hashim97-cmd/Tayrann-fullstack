import React from "react";
import Image from "next/image";

export interface Option {
    code?: string;
    name: string;
    image?: string;
}

interface CheckboxGroupProps {
    title: string;
    options: Option[];
    selectedOptions: string[];
    onChange: (selected: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, options, selectedOptions, onChange }) => {
    console.log(options)
    const handleCheckboxChange = (name: string) => {
        if (selectedOptions.includes(name)) {
            onChange(selectedOptions.filter((option) => option !== name));
        } else {
            onChange([...selectedOptions, name]);
        }
    };

    return (
        <div className="mb-4">
            <h3 className="font-semibold pb-2">{title}</h3>
            <ul className="mt-2 space-y-2">
                {options.map((option, index) => (
                    <li key={index} className="flex items-center justify-between">
                        <input
                            type="checkbox"
                            className="mr-2 w-5 h-5 accent-green"
                            checked={selectedOptions?.includes(option.name)}
                            onChange={() => handleCheckboxChange(option.name)}
                        />
                        <span className="text-sm">{option.name}</span>
                        {option.image && (
                            <Image
                                src={option.image}
                                alt={option.name}
                                width={20}
                                height={20}
                                className="ml-2"
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CheckboxGroup;

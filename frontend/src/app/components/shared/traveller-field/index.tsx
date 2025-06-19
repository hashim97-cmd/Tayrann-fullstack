"use client"
import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineMinusCircle } from 'react-icons/ai';
import { FiPlusCircle } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { useLocale, useTranslations } from 'next-intl';

interface TravelersProps {
    label?: string;
    adults: number;
    children: number;
    infants: number;
    setFlightFormData: React.Dispatch<React.SetStateAction<{
        origin: string;
        destination: string;
        departure: Date;
        returnDate: Date;
        travelers: {
            adults: number;
            children: number;
            infants: number;
        };
        class: string;
        flightType: string;
        segments?: {
            id: string;
            origin: string;
            destination: string;
            date: Date;
        }[] | undefined;
    }>>;
}

const Travelers: React.FC<TravelersProps> = ({
    adults,
    children,
    infants,
    setFlightFormData,
    label,
}) => {
    const t = useTranslations('searchForm');
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleCountChange = (type: 'adults' | 'children' | 'infants', change: number) => {
        setFlightFormData(prev => ({
            ...prev,
            travelers: {
                ...prev.travelers,
                [type]: Math.max(0, prev.travelers[type] + change)
            }
        }));
    };

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const handleOutsideClick = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            {label && <label className="block text-[#12121299]">{label}</label>}
            <button
                onClick={handleButtonClick}
                className="py-3 px-2 w-full flex items-center justify-between"
            >
                <span>{adults + children + infants} {t("travlers.buttonLabel")}</span>
                <IoIosArrowDown className="text-lg" />
            </button>

            {isOpen && (
                <div className="absolute min-w-64 bg-white p-4 left-0 rounded-lg shadow-2xl z-10 mt-2">
                    <h2 className="text-lg font-semibold mb-4">{t("travlers.travlers")}</h2>
                    <div className="flex justify-between items-center mb-2">
                        <div className="mr-2 text-black">{t("travlers.adults.label")} <span className="text-grayText text-xs"> ({t("travlers.adults.note")})</span></div>
                        <div className="flex gap-1 items-center">
                            <button
                                onClick={() => handleCountChange('adults', -1)}
                                className="text-green text-2xl font-bold py-2 rounded-l-lg"
                            >
                                <AiOutlineMinusCircle />
                            </button>
                            <span className="px-2">{adults}</span>
                            <button
                                onClick={() => handleCountChange('adults', 1)}
                                className="text-green text-2xl font-bold py-2 rounded-r-lg"
                            >
                                <FiPlusCircle />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <div className="mr-2 text-black">{t("travlers.children.label")} <span className="text-grayText text-xs">({t("travlers.children.note")})</span></div>
                        <div className="flex gap-1 items-center">
                            <button
                                onClick={() => handleCountChange('children', -1)}
                                className="text-green text-2xl font-bold py-2 rounded-l-lg"
                            >
                                <AiOutlineMinusCircle />
                            </button>
                            <span className="px-2">{children}</span>
                            <button
                                onClick={() => handleCountChange('children', 1)}
                                className="text-green text-2xl font-bold py-2 rounded-r-lg"
                            >
                                <FiPlusCircle />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-black">{t("travlers.infants.label")} <span className="text-grayText text-xs"> ({t("travlers.infants.note")})</span></div>
                        <div className="flex gap-1 items-center">
                            <button
                                onClick={() => handleCountChange('infants', -1)}
                                className="text-green text-2xl font-bold py-2 rounded-l-lg"
                            >
                                <AiOutlineMinusCircle />
                            </button>
                            <span className="px-2">{infants}</span>
                            <button
                                onClick={() => handleCountChange('infants', 1)}
                                className="text-green text-2xl font-bold py-2 rounded-r-lg"
                            >
                                <FiPlusCircle />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Travelers;
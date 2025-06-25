import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa6";


import { useTranslations } from "next-intl";
interface DateFields {
    day: string;
    month: string;
    year: string;
}

interface TravelerFormData {
    travelerId: number;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: DateFields;
    nationality: string;
    documentType: string;
    passportNumber: string;
    issuanceCountry: string;
    passportExpiry: {
        day: string;
        month: string;
        year: string;
    };
    email: string;
    phoneCode: string;
    phoneNumber: string;
    isCompleted: boolean;
}

interface TravelerAccordionProps {
    travelers: TravelerFormData[];
    onTravelerUpdate: (index: number, data: TravelerFormData) => void;
}

const TravelerAccordion: React.FC<TravelerAccordionProps> = ({ travelers, onTravelerUpdate }) => {

    console.log(travelers, "from travller accordion")
    const t = useTranslations("bookNow");
    const [expandedIndex, setExpandedIndex] = useState<number>(0);

    const handleToggle = (index: number) => {
        setExpandedIndex(expandedIndex === index ? -1 : index);
    };

    const updateTravelerData = (index: number, field: string, value: string) => {
        const updatedTraveler = { ...travelers[index] };
        
        if (field.includes('.')) {
            const [parent, child] = field.split('.') as [keyof TravelerFormData, keyof DateFields];
            
            // Type-safe nested update
            if (parent === 'dateOfBirth' || parent === 'passportExpiry') {
                updatedTraveler[parent] = {
                    ...updatedTraveler[parent],
                    [child]: value
                };
            }
        } else {
            // Type-safe direct property update
            const key = field as keyof Omit<TravelerFormData, 'dateOfBirth' | 'passportExpiry'>;
            if (key in updatedTraveler) {
                (updatedTraveler[key] as string) = value;
            }
        }

        // Check if traveler form is completed
        updatedTraveler.isCompleted = checkTravelerCompletion(updatedTraveler);

        onTravelerUpdate(index, updatedTraveler);
    };


    const checkTravelerCompletion = (traveler: TravelerFormData): boolean => {
        return !!(
            traveler.firstName &&
            traveler.lastName &&
            traveler.dateOfBirth.day &&
            traveler.dateOfBirth.month &&
            traveler.dateOfBirth.year &&
            traveler.nationality &&
            traveler.passportNumber &&
            traveler.issuanceCountry &&
            traveler.passportExpiry.day &&
            traveler.passportExpiry.month &&
            traveler.passportExpiry.year &&
            traveler.email &&
            traveler.phoneNumber
        );
    };

    const getTravelerDisplayName = (traveler: TravelerFormData, index: number): string => {
        if (traveler.firstName && traveler.lastName) {
            return `${traveler.title} ${traveler.firstName} ${traveler.lastName}`;
        }
        return `Adult ${index + 1}`;
    };

    const getTravelerDateOfBirth = (traveler: TravelerFormData): string => {
        if (traveler?.dateOfBirth?.day && traveler?.dateOfBirth?.month && traveler?.dateOfBirth?.year) {
            return `${traveler?.dateOfBirth?.day.padStart(2, '0')}/${traveler?.dateOfBirth?.month.padStart(2, '0')}/${traveler?.dateOfBirth?.year}`;
        }
        return '';
    };

    return (
        <div className="space-y-4">
            {travelers.map((traveler, index) => (
                <div key={traveler.travelerId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Accordion Header */}
                    <div
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleToggle(index)}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${traveler.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                }`}>
                                {traveler.isCompleted ? (
                                    <FaCheck className="w-4 h-4 text-white" />
                                ) : (
                                    <span className="text-xs text-gray-600">{index + 1}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">
                                    Adult {index + 1}: {getTravelerDisplayName(traveler, index)}
                                </h3>
                                {getTravelerDateOfBirth(traveler) && (
                                    <p className="text-sm text-gray-500">{getTravelerDateOfBirth(traveler)}</p>
                                )}
                                {!traveler.isCompleted && expandedIndex !== index && (
                                    <p className="text-sm text-gray-500">{t("personalDetails.enterDetails")}</p>
                                )}
                            </div>
                        </div>
                        {expandedIndex === index ? (
                            <FaChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <FaChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </div>

                    {/* Accordion Content */}
                    {expandedIndex === index && (
                        <div className="p-6 border-t border-gray-200">
                            <div className="space-y-8">
                                {/* Personal Details Section */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                                        {t("personalDetails.title")}
                                    </h4>

                                    {/* Title Selection */}
                                    <div className="flex gap-4 mb-4">
                                        {['Mr', 'Ms', 'Mrs'].map((title) => (
                                            <button
                                                key={title}
                                                type="button"
                                                className={`px-4 py-2 rounded-full transition-colors ${traveler.title === title
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => updateTravelerData(index, 'title', title)}
                                            >
                                                {t(`personalDetails.titleOptions.${title.toLowerCase()}`)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("personalDetails.firstName")} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={traveler.firstName}
                                                onChange={(e) => updateTravelerData(index, 'firstName', e.target.value)}
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("personalDetails.middleName")}
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={traveler.middleName}
                                                onChange={(e) => updateTravelerData(index, 'middleName', e.target.value)}
                                                placeholder="Middle name (Optional)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("personalDetails.lastName")} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={traveler.lastName}
                                                onChange={(e) => updateTravelerData(index, 'lastName', e.target.value)}
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                            {t("personalDetails.dateOfBirth")} *
                                        </h5>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Day"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler?.dateOfBirth?.day}
                                                    onChange={(e) => updateTravelerData(index, 'dateOfBirth.day', e.target.value)}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Month"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.dateOfBirth?.month}
                                                    onChange={(e) => updateTravelerData(index, 'dateOfBirth.month', e.target.value)}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Year"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.dateOfBirth?.year}
                                                    onChange={(e) => updateTravelerData(index, 'dateOfBirth.year', e.target.value)}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nationality */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("personalDetails.nationality")} *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={traveler.nationality}
                                            onChange={(e) => updateTravelerData(index, 'nationality', e.target.value)}
                                            placeholder="Nationality"
                                        />
                                    </div>
                                </div>

                                {/* Travel Document Section */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                                        {t("travelDocument.title")}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("travelDocument.documentType")}
                                            </label>
                                            <input
                                                type="text"
                                                value="Passport"
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("travelDocument.passportNumber")} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={traveler.passportNumber}
                                                onChange={(e) => updateTravelerData(index, 'passportNumber', e.target.value)}
                                                placeholder="Passport number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("travelDocument.issuingCountry")} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={traveler.issuanceCountry}
                                                onChange={(e) => updateTravelerData(index, 'issuanceCountry', e.target.value)}
                                                placeholder="Issuing country"
                                            />
                                        </div>
                                    </div>

                                    {/* Passport Expiry */}
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                            {t("travelDocument.expiryDate")} *
                                        </h5>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Day"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.passportExpiry?.day}
                                                    onChange={(e) => updateTravelerData(index, 'passportExpiry.day', e.target.value)}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Month"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.passportExpiry?.month}
                                                    onChange={(e) => updateTravelerData(index, 'passportExpiry.month', e.target.value)}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Year"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.passportExpiry?.year}
                                                    onChange={(e) => updateTravelerData(index, 'passportExpiry.year', e.target.value)}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details Section - Only show for first traveler */}
                                {index === 0 && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                                            {t("contactDetails.title")}
                                        </h4>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("contactDetails.email")} *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={traveler.email}
                                                onChange={(e) => updateTravelerData(index, 'email', e.target.value)}
                                                placeholder="Email address"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {t("contactDetails.emailNote")}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("contactDetails.phoneCode")} *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.phoneCode}
                                                    onChange={(e) => updateTravelerData(index, 'phoneCode', e.target.value)}
                                                    placeholder="+1"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("contactDetails.phoneNumber")} *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={traveler.phoneNumber}
                                                    onChange={(e) => updateTravelerData(index, 'phoneNumber', e.target.value)}
                                                    placeholder="Phone number"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TravelerAccordion;
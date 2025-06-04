"use client";
import BigCustomDropdown from "@/app/components/shared/BigCustomDropDown";
import CustomBookInput from "@/app/components/shared/CustomBookInput";
import ParaHeading from "@/app/components/shared/para-heading";
import Section from "@/app/components/shared/section";
import CustomSelect from "@/app/components/website/book-now/CustomSlecter";
import { FilesIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DayOptions,
  MonthOptions,
  NationalityOptions,
  YearOptions,
} from "@/utils/index";
import CustomSwitch from "@/app/components/shared/CustomSwitch";
import MidHeading from "@/app/components/shared/MidHeading";
import SubHeading from "@/app/components/shared/subHeading";
import { BaggageTickIcon } from "@/app/svg";
import PaymentOptions from "@/app/components/website/book-now/CustomPaySlect";
import PaymentCard from "@/app/components/website/book-now/PaymentCard";
import Modal from "@/app/components/shared/Modal";
import AddNewCard from "@/app/components/website/book-now/AddnewCard";
import FlightCard from "@/app/components/website/book-now/DepartureCard";
import RulesComponent from "@/app/components/website/book-now/RulesComponent";
import MyFatoorahIframe from "@/app/components/payment/MyFatoorahIframe"
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

interface AdultFormData {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  callName: string;
  passportNumber: string;
  ageSelect: "Adult" | "Child";
  dateOfBirth: string;
  day?: string;
  month?: string;
  year?: string;
}

interface FormData {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
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
}

const Page = () => {

  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: {
      day: '',
      month: '',
      year: ''
    },
    nationality: '',
    documentType: 'PASSPORT',
    passportNumber: '',
    issuanceCountry: '',
    passportExpiry: {
      day: '',
      month: '',
      year: ''
    },
    email: '',
    phoneCode: '+1',
    phoneNumber: ''
  });

  // State for form data
  const searchParams = useSearchParams();
  const adultsnum = searchParams.get("adults");
  const [adults, setAdults] = useState(Number(adultsnum));
  const [loading, setLoading] = useState(false)


  const [contactDetails, setContactDetails] = useState({
    lookingSomeone: false,
    email: "",
    mobile: "",
    payType: "full",
    paymentCard: "",
  });

  const [newCardData, setNewCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    name: "",
    country: "United States",
  });

  const [isModalOpen, setModalOpen] = useState(false);

  // Function to handle opening the modal
  const handleAddCardClick = () => {
    setModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Options for dropdowns
  const options = [`Adult`, "Kid", "Old"];
  const callNames = ["Mr", "Ms", "Mrs"];
  const baggageOptions = [
    { name: "7 KG Cabin baggage", quantity: "1 piece" },
    { name: "20kg total checked baggage", quantity: "1 piece" },
  ];

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle switch toggle
  const handleLookingSomedoneToggle = () => {
    setContactDetails((prev) => ({
      ...prev,
      lookingSomeone: !prev.lookingSomeone,
    }));
  }

  // Function to handle payment change
  const handlePaymentChange = (value: string) => {
    setContactDetails((prev) => ({
      ...prev,
      payType: value, // Update the payment type in form data
    }));
  };

  // Function to handle country selection change
  const handleNewCardCountrySelect = (country: string) => {
    setNewCardData((prev) => ({
      ...prev,
      country,
    }));
  };

  // Function to handle input changes
  const handleNewCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCardData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/initializePayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 10, // Example amount
          customerName: "Test User",
          customerEmail: "test@example.com",
          customerMobile: "12345678",
        }),
      });

      const data = await response.json();
      if (data.Data && data.Data.PaymentURL) {
        window.location.href = data.Data.PaymentURL;
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
    }
    setLoading(false);
  };

  const flightDataSlice = useSelector((state: any) => state.flightData.slectedFlight);
  console.log(flightDataSlice, "selected flight")



  // Add form validation function
  // const validateForm = () => {
  //   // Validate passenger details
  //   for (const passenger of formData) {
  //     if (!passenger.firstName || !passenger.lastName || !passenger.passportNumber) {
  //       alert('Please fill all required passenger details');
  //       return false;
  //     }
  //   }

  //   // Validate contact details
  //   if (!contactDetails.email || !contactDetails.mobile) {
  //     alert('Please fill all contact details');
  //     return false;
  //   }

  //   // Validate payment method
  //   if (contactDetails.payType === 'card' && !contactDetails.paymentCard) {
  //     alert('Please select a payment card');
  //     return false;
  //   }

  //   return true;
  // };

  // Add calculate total amount function (you'll need to implement based on your pricing)
  const calculateTotalAmount = () => {
    // Calculate based on number of passengers, flight prices, etc.
    return 1000; // Example amount
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform form data to match required format
    const travelerData = {
      travelers: [
        {
          id: "1",
          dateOfBirth: `${formData.dateOfBirth.year}-${formData.dateOfBirth.month.padStart(2, '0')}-${formData.dateOfBirth.day.padStart(2, '0')}`,
          name: {
            firstName: formData.firstName.toUpperCase(),
            lastName: formData.lastName.toUpperCase()
          },
          gender: formData.title === 'Mr' ? 'MALE' : 'FEMALE',
          contact: {
            emailAddress: formData.email,
            phones: [
              {
                deviceType: 'MOBILE',
                countryCallingCode: formData.phoneCode.replace('+', ''),
                number: formData.phoneNumber
              }
            ]
          },
          documents: [
            {
              documentType: formData.documentType,
              number: formData.passportNumber,
              expiryDate: `${formData.passportExpiry.year}-${formData.passportExpiry.month.padStart(2, '0')}-${formData.passportExpiry.day.padStart(2, '0')}`,
              issuanceCountry: formData.issuanceCountry,
              nationality: formData.nationality,
              holder: true
            }
          ]
        }
      ]
    };

    console.log(travelerData);
  };

  return (
    <Section>
      <div className="mt-14 font-cairo">
        <ParaHeading>
          <span className="text-black">Important flight information</span>
        </ParaHeading>
      </div>
      <div className="w-full flex items-start lg:flex-row flex-col gap-4 mt-6 mb-16">

        {/* right section */}
        <div className="lg:w-[65%] w-full flex flex-col gap-4">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Enter your details</h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">2</div>
              <div className="h-1 flex-1 bg-gray-200">
                <div className="w-1/2 h-full bg-blue-500"></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Personal Details Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Personal details</h2>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-full ${formData.title === 'Mr' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setFormData({ ...formData, title: 'Mr' })}
                  >
                    Mr
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-full ${formData.title === 'Ms' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setFormData({ ...formData, title: 'Ms' })}
                  >
                    Ms
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-full ${formData.title === 'Mrs' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setFormData({ ...formData, title: 'Mrs' })}
                  >
                    Mrs
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle name (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Date of birth *</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Day"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.dateOfBirth.day}
                      onChange={(e) => setFormData({
                        ...formData,
                        dateOfBirth: { ...formData.dateOfBirth, day: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Month"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.dateOfBirth.month}
                      onChange={(e) => setFormData({
                        ...formData,
                        dateOfBirth: { ...formData.dateOfBirth, month: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Year"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.dateOfBirth.year}
                      onChange={(e) => setFormData({
                        ...formData,
                        dateOfBirth: { ...formData.dateOfBirth, year: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              {/* Travel Document Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Travel document</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document type *</label>
                    <input
                      type="text"
                      value="Passport"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport number *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">issuing country *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>
                </div>



                <h3 className="text-sm font-medium text-gray-700 mb-2">Passport expiry date *</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Day"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.passportExpiry.day}
                      onChange={(e) => setFormData({
                        ...formData,
                        passportExpiry: { ...formData.passportExpiry, day: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Month"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.passportExpiry.month}
                      onChange={(e) => setFormData({
                        ...formData,
                        passportExpiry: { ...formData.passportExpiry, month: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Year"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.passportExpiry.year}
                      onChange={(e) => setFormData({
                        ...formData,
                        passportExpiry: { ...formData.passportExpiry, year: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact details</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">Your purchased tickets will be sent to this email.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.phoneCode}
                      onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number *</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-greenGradient text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </form>
        </div>


        {/* left section */}
        <div className="lg:w-[35%] w-full flex flex-col gap-4">
          {flightDataSlice && flightDataSlice.length > 0 ? (
            flightDataSlice.map((flight: any, index: number) => (
              <div key={index}>
                <FlightCard flightData={flight} />
              </div>
            ))
          ) : (
            <div>
              <FlightCard flightData={flightDataSlice[0]} />
            </div>
          )}

          <RulesComponent flightData={flightDataSlice[0]} />
        </div>
      </div>
    </Section>

  );
};

export default Page;

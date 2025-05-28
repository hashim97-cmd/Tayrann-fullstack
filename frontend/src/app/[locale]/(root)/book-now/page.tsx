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

const Page = () => {

  // State for form data
  const searchParams = useSearchParams();
  const adultsnum = searchParams.get("adults");
  const [adults, setAdults] = useState(Number(adultsnum));
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(
    Array.from({ length: adults }, () => ({
      firstName: "",
      lastName: "",
      middleName: "",
      callName: "",
      passportNumber: "",
      ageSelect: "Adult",
      dateOfBirth: "",
      day: "",
      month: "",
      year: "",
      hijriCalendar: false,
      nationality: "",
    }))
  );


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
  console.log(flightDataSlice,"selected flight")

  // Add this function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!validateForm()) {
        return;
      }

      // Prepare the booking data
      const bookingData = {
        passengers: formData,
        contactDetails,
        paymentMethod: contactDetails.payType,
        flightDetails: flightDataSlice[0], // Assuming you want the first flight
        totalAmount: calculateTotalAmount(), // You'll need to implement this
      };

      // First, save the booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) {
        throw new Error('Booking failed');
      }

      const bookingResult = await bookingResponse.json();

      // Then process payment if not paying later
      if (contactDetails.payType !== 'payLater') {
        const paymentResponse = await fetch('/api/initializePayment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: calculateTotalAmount(),
            customerName: `${formData[0].firstName} ${formData[0].lastName}`,
            customerEmail: contactDetails.email,
            customerMobile: contactDetails.mobile,
            bookingId: bookingResult.bookingId,
          }),
        });

        const paymentData = await paymentResponse.json();
        if (paymentData.Data && paymentData.Data.PaymentURL) {
          window.location.href = paymentData.Data.PaymentURL;
        }
      } else {
        // Redirect to confirmation page for pay later
        window.location.href = `/booking-confirmation/${bookingResult.bookingId}`;
      }
    } catch (error) {
      console.error('Booking failed:', error);
      // Show error message to user
    } finally {
      setLoading(false);
    }
  };

  // Add form validation function
  const validateForm = () => {
    // Validate passenger details
    for (const passenger of formData) {
      if (!passenger.firstName || !passenger.lastName || !passenger.passportNumber) {
        alert('Please fill all required passenger details');
        return false;
      }
    }

    // Validate contact details
    if (!contactDetails.email || !contactDetails.mobile) {
      alert('Please fill all contact details');
      return false;
    }

    // Validate payment method
    if (contactDetails.payType === 'card' && !contactDetails.paymentCard) {
      alert('Please select a payment card');
      return false;
    }

    return true;
  };

  // Add calculate total amount function (you'll need to implement based on your pricing)
  const calculateTotalAmount = () => {
    // Calculate based on number of passengers, flight prices, etc.
    return 1000; // Example amount
  };



  return (
    "test"
    // <Section>
    //   <div className="mt-14 font-cairo">
    //     <ParaHeading>
    //       <span className="text-black">Important flight information</span>
    //     </ParaHeading>
    //   </div>

    //   <div className="w-full flex items-start lg:flex-row flex-col gap-4 mt-6 mb-16 font-cairo">
    //     {/* Left Section */}
    //     <div className="lg:w-[65%] w-full flex flex-col gap-4">
    //       <div>
    //         {formData && formData.map((data, index) => (
    //           <div
    //             key={index}
    //             className="border border-bordered p-4 rounded-2xl mb-6"
    //           >
    //             {/* Dropdown for Age */}
    //             <BigCustomDropdown
    //               value={data.ageSelect}
    //               options={options}
    //               onChange={(value) =>
    //                 setFormData((prev) =>
    //                   prev.map((item, i) =>
    //                     i === index ? { ...item, ageSelect: value } : item
    //                   )
    //                 )
    //               }
    //             />

    //             {/* Orange Box */}
    //             <div className="bg-orange flex items-center gap-2 border border-[#C0C0C0] my-2 text-white px-4 py-3 rounded-xl">
    //               <div className="flex-shrink-0">
    //                 <FilesIcon />
    //               </div>
    //               <p className="sm:text-base text-sm">
    //                 Enter your details as they appear on your passport. Use
    //                 English only.
    //               </p>
    //             </div>

    //             {/* Title Selection */}
    //             <div className="flex items-center gap-4 w-full mt-12 justify-start">
    //               {callNames.map((name, i) => (
    //                 <div
    //                   key={i}
    //                   onClick={() =>
    //                     setFormData((prev) =>
    //                       prev.map((item, j) =>
    //                         j === index ? { ...item, callName: name } : item
    //                       )
    //                     )
    //                   }
    //                   className={`border border-bordered py-2 sm:w-[20%] w-full rounded-xl flex justify-center items-center cursor-pointer 
    //           ${data.callName === name
    //                       ? "bg-greenGradient text-white"
    //                       : "bg-white text-black"
    //                     }`}
    //                 >
    //                   {name}
    //                 </div>
    //               ))}
    //             </div>

    //             {/* Input Fields */}
    //             <div className="mt-6">
    //               <CustomBookInput
    //                 placeholder="First name"
    //                 name="firstName"
    //                 value={data.firstName}
    //                 onChange={(e) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index
    //                         ? { ...item, firstName: e.target.value }
    //                         : item
    //                     )
    //                   )
    //                 }
    //                 inputType="text"
    //               />
    //             </div>

    //             <div className="mt-6">
    //               <CustomBookInput
    //                 placeholder="Middle name"
    //                 name="middleName"
    //                 value={data.middleName}
    //                 onChange={(e) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index
    //                         ? { ...item, middleName: e.target.value }
    //                         : item
    //                     )
    //                   )
    //                 }
    //                 inputType="text"
    //               />
    //             </div>

    //             <div className="mt-4">
    //               <CustomBookInput
    //                 placeholder="Last name"
    //                 name="lastName"
    //                 value={data.lastName}
    //                 onChange={(e) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index
    //                         ? { ...item, lastName: e.target.value }
    //                         : item
    //                     )
    //                   )
    //                 }
    //                 inputType="text"
    //               />
    //             </div>

    //             <div className="mt-4">
    //               <CustomBookInput
    //                 placeholder="Passport Number"
    //                 name="passportNumber"
    //                 value={data.passportNumber}
    //                 onChange={(e) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index
    //                         ? { ...item, passportNumber: e.target.value }
    //                         : item
    //                     )
    //                   )
    //                 }
    //                 inputType="number"
    //               />
    //             </div>

    //             {/* Date of Birth Selection */}
    //             <div className="mt-4 w-full grid sm:grid-cols-3 grid-cols-1 gap-6">
    //               <CustomSelect
    //                 options={DayOptions}
    //                 value={data.day}
    //                 onChange={(value) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index ? { ...item, day: value } : item
    //                     )
    //                   )
    //                 }
    //                 placeholder="Date of birth"
    //               />
    //               <CustomSelect
    //                 label="Month"
    //                 options={MonthOptions}
    //                 value={data.month}
    //                 onChange={(value) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index ? { ...item, month: value } : item
    //                     )
    //                   )
    //                 }
    //                 placeholder="Month"
    //               />
    //               <CustomSelect
    //                 label="Year"
    //                 options={YearOptions}
    //                 value={data.year}
    //                 onChange={(value) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index ? { ...item, year: value } : item
    //                     )
    //                   )
    //                 }
    //                 placeholder="Year"
    //               />
    //             </div>

    //             {/* Hijri Calendar Switch */}
    //             <div className="mt-4">
    //               <CustomSwitch
    //                 isOn={data.hijriCalendar}
    //                 handleToggle={() =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index
    //                         ? { ...item, hijriCalendar: !item.hijriCalendar }
    //                         : item
    //                     )
    //                   )
    //                 }
    //                 label="Hijri Calendar"
    //               />
    //             </div>

    //             {/* Nationality Selection */}
    //             <div className="mt-4">
    //               <CustomSelect
    //                 label="Nationality"
    //                 options={NationalityOptions}
    //                 value={data.nationality}
    //                 onChange={(value) =>
    //                   setFormData((prev) =>
    //                     prev.map((item, i) =>
    //                       i === index ? { ...item, nationality: value } : item
    //                     )
    //                   )
    //                 }
    //                 placeholder="Nationality"
    //                 style={"justify-between"}
    //               />
    //             </div>
    //           </div>
    //         ))}

    //         {/* contact  details */}
    //         <div className='mt-8'>
    //           <ParaHeading>
    //             <span className='text-black'>Enter contact details</span>
    //           </ParaHeading>

    //           <div className="mt-8">
    //             <CustomSwitch
    //               isOn={contactDetails.lookingSomeone}
    //               handleToggle={handleLookingSomedoneToggle}
    //               label="Im’ booking for someone else"
    //             />
    //           </div>

    //           <div className="mt-4">
    //             <CustomBookInput
    //               placeholder='Email to receive e-ticket'
    //               name='email'
    //               value={contactDetails.email}
    //               onChange={handleInputChange}
    //               inputType='email'
    //             />
    //           </div>

    //           <div className="mt-4">
    //             <CustomBookInput
    //               placeholder='Mobile number'
    //               name='mobile'
    //               value={contactDetails.mobile}
    //               onChange={handleInputChange}
    //               inputType='text'
    //             />
    //           </div>
    //         </div>

    //         <div className="mt-6 pt-10 bg-[#FBFBFB] p-5 rounded-xl">
    //           <ParaHeading>
    //             <span className="text-black">About your baggage</span>
    //           </ParaHeading>

    //           <div className="flex justify-between sm:flex-row flex-col w-full mt-8">
    //             <div className="lg:w-[40%] sm:w-[45%] w-full">
    //               <MidHeading>Kuwait to Jeddah</MidHeading>
    //               <div className="mt-4 bg-white py-6 px-4 rounded-xl">
    //                 <h1 className="text-black lg:text-xl font-bold ">
    //                   {" "}
    //                   Baggage allowance{" "}
    //                 </h1>
    //                 {baggageOptions.map((e, i) => (
    //                   <div className="flex items-start gap-2 mt-4">
    //                     <div className="mt-1">
    //                       <BaggageTickIcon />
    //                     </div>
    //                     <div>
    //                       <h1 className="">{e.name}</h1>
    //                       <p className="text-[10px]">{e.quantity}</p>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             </div>
    //             <div className="lg:w-[40%] sm:w-[45%] w-full">
    //               <MidHeading>Jeddah to Kuwait</MidHeading>
    //               <div className="mt-4 bg-white py-6 px-4 rounded-xl">
    //                 <h1 className="text-black lg:text-xl font-bold ">
    //                   {" "}
    //                   Baggage allowance{" "}
    //                 </h1>
    //                 {baggageOptions.map((e, i) => (
    //                   <div className="flex items-start gap-2 mt-4">
    //                     <div className="mt-1">
    //                       <BaggageTickIcon />
    //                     </div>
    //                     <div>
    //                       <h1 className="">{e.name}</h1>
    //                       <p className="text-[10px]">{e.quantity}</p>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             </div>
    //           </div>

    //           <p className="md:text-lg font-[400] mt-4">
    //             After booking, you can contact a travel advisor to add extra
    //             baggage, subject to the airline's availability & rates.
    //           </p>
    //         </div>
    //       </div>

    //       <div className="border border-bordered p-4 rounded-2xl">
    //         <PaymentOptions onPaymentChange={handlePaymentChange} />
    //       </div>

    //       <div className="border border-bordered p-4 rounded-2xl">
    //         <PaymentCard onAddCard={handleAddCardClick} />
    //       </div>

    //       <Modal
    //         isOpen={isModalOpen}
    //         onClose={handleCloseModal}
    //         children={
    //           <AddNewCard
    //             onClose={handleCloseModal}
    //             cardNumber={newCardData.cardNumber}
    //             expiryDate={newCardData.expiryDate}
    //             cvc={newCardData.cvc}
    //             name={newCardData.name}
    //             country={newCardData.country}
    //             onInputChange={handleNewCardInputChange}
    //             onCountrySelect={handleNewCardCountrySelect}
    //           />
    //         }
    //       />
    //     </div>

    //     {/* Right Section */}
    //     <div className="lg:w-[35%] w-full flex flex-col gap-4">
    //       {flightDataSlice && flightDataSlice.length > 0 ? (
    //         flightDataSlice.map((flight: any, index: number) => (
    //           <div key={index}>
    //             <FlightCard flightData={flight} />
    //           </div>
    //         ))
    //       ) : (
    //         <div>
    //           <FlightCard flightData={flightDataSlice[0]} />
    //         </div>
    //       )}

    //       <RulesComponent flightData={flightDataSlice[0]} />


    //       <button
    //         onClick={handleSubmit}
    //         disabled={loading}
    //         className="w-full bg-greenGradient text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-70"
    //       >
    //         {loading ? 'Processing...' : 'Confirm Booking'}
    //       </button>
    //     </div>
    //   </div>
    // </Section>
  );
};

export default Page;


// {
//   "mapping": "JED-AMM|2025-04-23|RJ-709||AMM-MXP|2025-04-23|RJ-103||MXP-AMM|2025-04-30|RJ-104||AMM-JED|2025-05-01|RJ-704",
//   "contact_info": {
//       "name": "Fady Shehata",
//       "email": "fadyshehata2@gmail.com",
//       "phone": "201027792728",
//       "country_calling_code": "20"
//   },
//   "travellers": [
//       {
//           "UserType": "ADT",
//           "firstName": "Fady",
//           "lastName": "Shehata",
//           "dateOfBirth": "2009-04-04",
//           "gender": "MALE",
//           "document": {
//               "number": "p16252i2i62",
//               "issuanceDate": "2025-04-05",
//               "expiryDate": "2025-04-30",
//               "issuanceCountry": "SA",
//               "nationality": "SA"
//           }
//       }
//   ],
//   "currencyCode": "SAR",
//   "directFlight": false,
//   "cabinClass": "Economy",
//   "destinations": [
//       {
//           "id": 1,
//           "from": "JED",
//           "to": "MXP",
//           "date": "2025-04-23"
//       },
//       {
//           "id": 2,
//           "from": "MXP",
//           "to": "JED",
//           "date": "2025-04-30"
//       }
//   ],
//   "adults": 1,
//   "children": 0,
//   "infants": 0
// },
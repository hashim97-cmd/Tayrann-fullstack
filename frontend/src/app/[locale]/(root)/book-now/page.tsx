"use client";
import Section from "@/app/components/shared/section";
import React, { useEffect, useState } from "react";
import FlightCard from "@/app/components/website/book-now/DepartureCard";
import RulesComponent from "@/app/components/website/book-now/RulesComponent";
import { useSelector } from "react-redux";
import PaymentForm from "@/app/components/payment/MyFatoorahForm";
import { useTranslations } from "next-intl";
import TravelerAccordion from "@/app/components/website/book-now/TravelerAccordion";

interface TravelerFormData {
  travelerId: number;
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
  isCompleted: boolean;
}

const Page = () => {
  const t = useTranslations("bookNow");
  const [loading, setLoading] = useState(false);
  const flightDataSlice = useSelector((state: any) => state.flightData.slectedFlight);
  const travellersNum = Number(flightDataSlice[0].travelerPricings.length) || 1;

  // Initialize travelers data
  const initialTravelerData: TravelerFormData = {
    travelerId: Date.now(),
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: { day: '', month: '', year: '' },
    nationality: '',
    documentType: 'PASSPORT',
    passportNumber: '',
    issuanceCountry: '',
    passportExpiry: { day: '', month: '', year: '' },
    email: '',
    phoneCode: '+1',
    phoneNumber: '',
    isCompleted: false
  };

  // Initialize travelers array based on adultsnum
  const [travelers, setTravelers] = useState<TravelerFormData[]>(() => {
    return flightDataSlice[0].travelerPricings.map((_, i) => ({
      ...initialTravelerData,
      travelerId: i + 1
    }));
  });

  // Handle updates from TravelerAccordion
  const handleTravelerUpdate = (index: number, updatedTraveler: TravelerFormData) => {
    const newTravelers = [...travelers];
    newTravelers[index] = updatedTraveler;

    // Sync contact details to all travelers
    if (index === 0) {
      newTravelers.forEach((t, i) => {
        if (i !== 0) {
          t.email = updatedTraveler.email;
          t.phoneCode = updatedTraveler.phoneCode;
          t.phoneNumber = updatedTraveler.phoneNumber;
        }
      });
    }

    setTravelers(newTravelers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate all travelers are completed
    const allCompleted = travelers.every(t => t.isCompleted);
    if (!allCompleted) {
      alert('Please complete all traveler information');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const bookingData = {
        travelers: travelers.map(traveler => ({
          travelerId: traveler.travelerId,
          title: traveler.title,
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          dateOfBirth: `${traveler.dateOfBirth.year}-${traveler.dateOfBirth.month.padStart(2, '0')}-${traveler.dateOfBirth.day.padStart(2, '0')}`,
          nationality: traveler.nationality,
          passportNumber: traveler.passportNumber,
          passportExpiry: `${traveler.passportExpiry.year}-${traveler.passportExpiry.month.padStart(2, '0')}-${traveler.passportExpiry.day.padStart(2, '0')}`,
          issuanceCountry: traveler.issuanceCountry,
          contact: {
            email: traveler.email,
            phone: `${traveler.phoneCode}${traveler.phoneNumber}`
          }
        })),
        flightDetails: flightDataSlice[0] // Include flight details
      };

      // Submit to your API
      console.log('Submitting booking:', bookingData);
      // await submitBooking(bookingData);

    } catch (error) {
      console.error('Booking submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <div className="w-full flex items-start lg:flex-row flex-col gap-4 mt-6 mb-16">
        {/* Right section - Traveler forms */}
        <div className="lg:w-[65%] w-full flex flex-col gap-4">
          <form onSubmit={handleSubmit}>
            <TravelerAccordion
              travelers={travelers}
              onTravelerUpdate={handleTravelerUpdate}
            />

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-greenGradient text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-70"
              >
                {loading ? t("payment.processing") : t("payment.confirmButton")}
              </button>
            </div>
          </form>
        </div>

        {/* Left section - Flight details */}
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
          <PaymentForm flightData={flightDataSlice[0]} />
        </div>
      </div>
    </Section>
  );
};

export default Page;
"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import fromImg from "/public/assets/from.png";
import toImg from "/public/assets/to.png";
import { Search } from "lucide-react";
import AirportSearchField from "../../shared/airport-search-field";
import CustomDatePicker from "../../shared/custom-date-picker";
import Travelers from "../../shared/traveller-field";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { changeTripType } from "@/redux/flights/flightSlice";
import { useDispatch, useSelector } from "react-redux";
import { TripType } from "@/redux/flights/flightSlice";

export const tripTypes: TripType[] = ["roundtrip", "oneway", "multiCities"];

const FlightSearchForm: React.FC<any> = ({
  setFlights,
  setLoading,
  loading,
  setOrigin,
  setDestination,
  origin,
  destination,
  departureDate,
  setDepartureDate,
  setReturnDate,
  returnDate,
  travelers,
  setTravelers,
  setFlightClass,
  flightClass,
}) => {
  const t = useTranslations("searchForm");

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const dispatch = useDispatch();
  const tripType = useSelector((state: any) => state.flightData.tripType);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!origin || !destination || !departureDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);

    router.push(
      `/${locale}/flight-search?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )}&departureDate=${encodeURIComponent(departureDate.toISOString())}${
        returnDate
          ? `&returnDate=${encodeURIComponent(returnDate.toISOString())}`
          : ""
      }&class=${encodeURIComponent(flightClass)}&adult=${
        travelers.adults
      }&child=${travelers.children}&lapinfant=${travelers.infants}`
    );

    // try {
    //     const response = await axios.get(`/api/search-flights`, {
    //         params: {
    //             origin,
    //             destination,
    //             tripType: tripType,
    //             departureDate: departureDate.toISOString(),
    //             returnDate: tripType === "roundtrip" ? returnDate.toISOString() : undefined,
    //             travelers: travelers.adults + travelers.children + travelers.infants,
    //             flightClass
    //         }
    //     });
    //     setFlights?.(response.data.data);
    // } catch (err) {
    //     setError("There was an error fetching flight data.");
    // } finally {
    //     setLoading(false);
    // }
  };

  // ar
  const flightClassOptions = [
    { label: t("flightClass.economy"), value: "ECONOMY" },
    { label: t("flightClass.premiumEconomy"), value: "PREMIUM_ECONOMY" },
    { label: t("flightClass.business"), value: "BUSINESS" },
    { label: t("flightClass.firstClass"), value: "FIRST" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap w-full">
        {tripTypes.map((type) => (
          <button
            key={type}
            type="button"
            aria-label={type}
            onClick={() => dispatch(changeTripType(type))}
            className={`px-4 py-2 font-medium text-base rounded-full ${
              tripType === type
                ? "bg-greenGradient text-white"
                : "bg-[#EEEEEE] text-black"
            }`}
          >
            {type === "roundtrip"
              ? `${t("tripTypes.roundtrip")}`
              : type === "oneway"
              ? `${t("tripTypes.oneway")}`
              : `${t("tripTypes.multiplecities")}`}
          </button>
        ))}
      </div>

      {/* Passenger and Class Selection */}
      <div className="flex items-center gap-4 my-4">
        <div className="lg:w-1/5 w-full  border border-borderColor rounded-full">
          <Travelers
            label=""
            adults={travelers.adults}
            setAdults={(value) => setTravelers({ ...travelers, adults: value })}
            children={travelers.children}
            setChildren={(value) =>
              setTravelers({ ...travelers, children: value })
            }
            infants={travelers.infants}
            setInfants={(value) =>
              setTravelers({ ...travelers, infants: value })
            }
          />
        </div>
        <select
          className="px-4 py-3 lg:w-1/5 w-full rounded-full border border-borderColor"
          name="class"
          aria-label="Class"
          value={flightClass}
          onChange={(e) => setFlightClass(e.target.value)}
        >
          {flightClassOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* From, To, and Dates */}
      <div className="flex gap-7 justify- flex-wrap items-center">
        <div className="relative lg:w-1/5 w-full">
          <AirportSearchField
            label=""
            placeholder={t("from")}
            defaultValue={origin}
            className="border rounded-full py-3 !border-borderColor"
            onSelect={(value) => setOrigin(value)}
            icon={fromImg}
          />
        </div>

        <button
          type="button"
          aria-label="Swap Locations"
          className="py-3 px-5 bg-green lg:block hidden rounded-md text-white"
          onClick={() => {
            const temp = destination;
            setOrigin(origin);
            setDestination(temp);
          }}
        >
          &#8644;
        </button>

        <div className="relative lg:w-1/5 w-full">
          <AirportSearchField
            label=""
            placeholder={t("to")}
            className="border rounded-full py-3 !border-borderColor"
            onSelect={(value) => setDestination(value)}
            defaultValue={destination}
            icon={toImg}
            filterItem={destination}
          />
        </div>

        <div className="relative lg:w-1/5 w-full">
          <CustomDatePicker
            label=""
            placeholder="Departure Date"
            className="px-4 py-3 w-full rounded-full border border-borderColor"
            value={departureDate}
            minDate={new Date()}
            onChange={(e) => setDepartureDate(e)}
          />
        </div>

        {tripType === "roundtrip" && (
          <div className="relative lg:w-1/5 w-full">
            <CustomDatePicker
              label=""
              placeholder={t("returndate")}
              value={returnDate}
              minDate={departureDate}
              onChange={(e) => setReturnDate(e)}
              className="px-4 py-3 w-full rounded-full border border-borderColor"
            />
          </div>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 text-white hover:bg-emerald-600"
          aria-label="Search Flights"
        >
          {loading ? t("loadingButton") : t("searchButton")} <Search />
        </button>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default FlightSearchForm;

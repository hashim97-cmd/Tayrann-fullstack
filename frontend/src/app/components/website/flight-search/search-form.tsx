"use client";
import { useState, useEffect } from "react";
import fromImg from "/public/assets/from.png";
import toImg from "/public/assets/to.png";
import { Search, Plus, Minus } from "lucide-react";
import AirportSearchField from "../../shared/airport-search-field";
import CustomDatePicker from "../../shared/custom-date-picker";
import Travelers from "../../shared/traveller-field";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { changeTripType, setSearchData } from "@/redux/flights/flightSlice";
import { useDispatch, useSelector } from "react-redux";
import { TripType } from "@/redux/flights/flightSlice";
import useSearchflights from "@/hooks/useSearchflights";

export const tripTypes: TripType[] = ["roundtrip", "oneway", "multiCities"];

interface FlightSegment {
  origin: string;
  destination: string;
  date: Date | null;
}

const FlightSearchForm: React.FC<any> = () => {
  const {
    getFlights,
    flights,
    loading,
    origin,
    destination,
    departure,
    returnDate,
    travelers,
    flightType,
    flightClass,
    segments,
    setOrigin,
    setDestination,
    setDeparture,
    setReturnDate,
    setTravelers,
    setFlightClass,
    setSegments,
    searchParamsData,
  } = useSearchflights();
  
  const t = useTranslations("searchForm");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const tripType = useSelector((state: any) => state.flightData.tripType);

  // Initialize segments with default values from Redux or empty values
  const [multiCitySegments, setMultiCitySegments] = useState<FlightSegment[]>(() => {
    // Use existing segments if available and we're in multi-city mode
    if (tripType === "multiCities" && segments?.length > 0) {
      return segments;
    }
    // Default to two empty segments
    return [
      { origin: "", destination: "", date: null },
      { origin: "", destination: "", date: null }
    ];
  });

  // Update segments when trip type or search params change
  useEffect(() => {
    if (tripType === "multiCities") {
      if (searchParamsData?.segments?.length > 0) {
        setMultiCitySegments(searchParamsData.segments);
      } else if (segments?.length > 0) {
        setMultiCitySegments(segments);
      } else {
        // Reset to default segments if none exist
        setMultiCitySegments([
          { origin: "", destination: "", date: null },
          { origin: "", destination: "", date: null }
        ]);
      }
    }
  }, [tripType, searchParamsData, segments]);

  const handleAddSegment = () => {
    setMultiCitySegments([...multiCitySegments, { origin: "", destination: "", date: null }]);
  };

  const handleRemoveSegment = (index: number) => {
    if (multiCitySegments.length > 1) {
      const updatedSegments = [...multiCitySegments];
      updatedSegments.splice(index, 1);
      setMultiCitySegments(updatedSegments);
    }
  };

  const handleSegmentChange = (index: number, field: keyof FlightSegment, value: any) => {
    const updatedSegments = [...multiCitySegments];
    updatedSegments[index][field] = value;
    setMultiCitySegments(updatedSegments);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validate based on trip type
    if (tripType === "oneway") {
      if (!origin || !destination || !departure) {
        toast.error(t("errors.missingFields"));
        return;
      }
    } else if (tripType === "roundtrip") {
      if (!origin || !destination || !departure || !returnDate) {
        toast.error(t("errors.missingFieldsRoundtrip"));
        return;
      }
    } else if (tripType === "multiCities") {
      const invalidSegment = multiCitySegments.some(
        segment => !segment.origin || !segment.destination || !segment.date
      );
      if (invalidSegment) {
        toast.error(t("errors.missingMultiCityFields"));
        return;
      }
    }

    // Prepare search data for Redux
    const searchData = {
      origin: tripType === "multiCities" ? multiCitySegments[0].origin : origin,
      destination: tripType === "multiCities" ? multiCitySegments[multiCitySegments.length - 1].destination : destination,
      departure: tripType === "multiCities" ? multiCitySegments[0].date : departure,
      returnDate,
      travelers,
      flightType: tripType,
      flightClass,
      segments: tripType === "multiCities" ? multiCitySegments : []
    };

    // Save to Redux
    dispatch(setSearchData(searchData));

    // For multi-city, set the segments before calling getFlights
    if (tripType === "multiCities") {
      setSegments(multiCitySegments);
    }

    // Trigger the flight search
    try {
      await getFlights();
      // Navigate to results page if needed
      // router.push(`/${locale}/flights/results`);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error(t("errors.searchFailed"));
    }
  };

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
        <div className="lg:w-1/5 w-full border border-borderColor rounded-full">
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

      {/* Search Fields - Conditionally render based on trip type */}
      {tripType !== "multiCities" ? (
        <div className="flex gap-7 justify-between flex-wrap items-center">
          {/* Standard one-way/roundtrip fields */}
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
              const temp = origin;
              setOrigin(destination);
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
            />
          </div>

          <div className="relative lg:w-1/5 w-full">
            <CustomDatePicker
              label=""
              placeholder={t("departureDate")}
              className="px-4 py-3 w-full rounded-full border border-borderColor"
              value={departure}
              minDate={new Date()}
              onChange={(e) => setDeparture(e)}
            />
          </div>

          {tripType === "roundtrip" && (
            <div className="relative lg:w-1/5 w-full">
              <CustomDatePicker
                label=""
                placeholder={t("returndate")}
                value={returnDate}
                minDate={departure}
                onChange={(e) => setReturnDate(e)}
                className="px-4 py-3 w-full rounded-full border border-borderColor"
              />
            </div>
          )}
        </div>
      ) : (
        /* Multi-city fields */
        <div className="space-y-4">
          {multiCitySegments.map((segment, index) => (
            <div key={index} className="flex gap-4 items-center flex-wrap">
              <div className="relative lg:w-[30%] w-full">
                <AirportSearchField
                  label={`${t("from")} ${index + 1}`}
                  placeholder={t("from")}
                  defaultValue={segment.origin}
                  className="border rounded-full py-3 !border-borderColor"
                  onSelect={(value) => handleSegmentChange(index, "origin", value)}
                  icon={fromImg}
                />
              </div>

              <div className="relative lg:w-[30%] w-full">
                <AirportSearchField
                  label={`${t("to")} ${index + 1}`}
                  placeholder={t("to")}
                  className="border rounded-full py-3 !border-borderColor"
                  onSelect={(value) => handleSegmentChange(index, "destination", value)}
                  defaultValue={segment.destination}
                  icon={toImg}
                />
              </div>

              <div className="relative lg:w-[30%] w-full">
                <CustomDatePicker
                  label={`${t("date")} ${index + 1}`}
                  placeholder={t("date")}
                  className="px-4 py-3 w-full rounded-full border border-borderColor"
                  value={segment.date}
                  minDate={index > 0 ? multiCitySegments[index - 1].date : new Date()}
                  onChange={(e) => handleSegmentChange(index, "date", e)}
                />
              </div>

              {multiCitySegments.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSegment(index)}
                  className="bg-red-500 text-white py-2 px-3 rounded-lg text-sm flex items-center gap-1"
                >
                  <Minus className="h-4 w-4" />
                  {t("remove")}
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddSegment}
            className="flex items-center bg-emerald-700 text-white rounded-lg justify-center p-2 gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            {t("addAnotherFlight")}
          </button>
        </div>
      )}

      {/* Search Button */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 text-white hover:bg-emerald-600 disabled:bg-gray-400"
          aria-label="Search Flights"
        >
          {loading ? t("loadingButton") : t("searchButton")} <Search />
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default FlightSearchForm;
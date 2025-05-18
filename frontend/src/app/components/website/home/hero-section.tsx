import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import CustomSelect from "../../shared/customSelect";
import { AiroplanIcon, ArrowCircleIcon, BedIcon } from "@/app/svg";
import { LuSearch } from "react-icons/lu";
import Section from "../../shared/section";
import CustomInput from "../../shared/CustomInput";
import CustomInputSelect from "../../shared/CustomInputSelect";
import AirportSearchField from "../../shared/airport-search-field";

import fromImg from "/public/assets/from.png";
import toImg from "/public/assets/to.png";
import Travelers from "../../shared/traveller-field";
import CustomDatePicker from "../../shared/custom-date-picker";
import { LoaderPinwheel, Search } from "lucide-react";
import RoomSelection from "../../shared/room-selection";
import { changeTripType, clearFlightData } from "@/redux/flights/flightSlice";
import { useDispatch, useSelector } from "react-redux";
import { TripType } from "@/redux/flights/flightSlice";
import { tripTypes } from "../flight-search/search-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import HotelSearch from "../hotel-search/test-hotel";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { IoMdAdd } from "react-icons/io";


interface FlightSegment {
  id: string;
  from: string;
  to: string;
  date: Date | null;
}

interface FlightFormData {
  from: string;
  to: string;
  departure: Date;
  return: Date;
  travelers: string;
  class: string;
  flightType: string;
  segments?: FlightSegment[];
}

interface Room {
  id: number;
  adults: number;
  children: number;
}

const HeroSection = () => {
  const locale = useLocale();
  const t = useTranslations("HomePage");
  const e = useTranslations("errors");
  const router = useRouter();
  const dispatch = useDispatch();

  const [searchedAirports, setSearchedAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [fromError, setFromError] = useState<string | null>(null);
  const [toError, setToError] = useState<string | null>(null);
  const [isHotel, setIsHotel] = useState(false);
  const [searchTermFrom, setSearchTermFrom] = useState("");
  const [searchTermTo, setSearchTermTo] = useState("");
  const [rooms, setRooms] = useState<Room[]>([{ id: 1, adults: 1, children: 0 }]);

  const [flightFormData, setFlightFormData] = useState<FlightFormData>({
    from: "",
    to: "",
    departure: new Date(),
    return: new Date(),
    travelers: "",
    class: "",
    flightType: "oneway",
    segments: [{ from: "", to: "", date: new Date() }]
  });

  const [hotelFormData, setHotelFormData] = useState({
    address: "",
    checkIn: "",
    checkOut: "",
    travelers: "",
  });

  const tripType = useSelector((state: any) => state.flightData.tripType);
  const flightClassOptions = [
    { label: "Economy", value: "ECONOMY" },
    { label: "Premium Economy", value: "PREMIUM_ECONOMY" },
    { label: "Business", value: "BUSINESS" },
    { label: "First Class", value: "FIRST" },
  ];

  const cityOptions = [
    { label: "Mumbai", value: "Mumbai" },
    { label: "Riyadh", value: "Riyadh" },
    { label: "New York", value: "New York" },
  ];

  const travelerOptions = [
    { label: "1 Traveler", value: "1" },
    { label: "2 Travelers", value: "2" },
    { label: "3 Travelers", value: "3" },
  ];

  const GetAirpports = async (keyword: string) => {
    try {
      setLoading(true);
      const data = await axios.get(`/api/airports?keyword=${keyword}`);
      setSearchedAirports(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightChange = (name: string, value: any) => {
    setFlightFormData(prev => ({ ...prev, [name]: value }));
    if (name === "from") setFromError(null);
    if (name === "to") setToError(null);
  };

  const handleSegmentChange = (index: number, field: keyof FlightSegment, value: any) => {
    setFlightFormData(prev => {
      const newSegments = [...prev.segments!];
      newSegments[index] = { ...newSegments[index], [field]: value };
      return { ...prev, segments: newSegments };
    });
  };

  const addFlightSegment = () => {
    setFlightFormData(prev => ({
      ...prev,
      segments: [...prev.segments!, { id: uuidv4(), from: "", to: "", date: new Date() }]
    }));
  };

  useEffect(() => {
    console.log('Segments updated:', flightFormData.segments);
  }, [flightFormData.segments]);

  const removeFlightSegment = (index: number) => {
    // Don't allow removing the last segment
    if (flightFormData.segments!.length <= 1) return;


    setFlightFormData(prev => ({
      ...prev,
      segments: prev.segments!.filter((_, i) => i !== index)
    }));
  };

  const handleFlightTypeChange = (type: TripType) => {
    dispatch(changeTripType(type));
    handleFlightChange("flightType", type);
    if (type !== "multiCities") {
      setFlightFormData(prev => ({
        ...prev,
        segments: [{ from: "", to: "", date: new Date() }]
      }));
    }
  };

  const handleFlightSubmit = () => {
    setLoading(true);

    // Validation
    if (flightFormData.flightType === "multiCities") {
      const hasEmptyFields = flightFormData.segments?.some(
        segment => !segment.from || !segment.to || !segment.date
      );
      if (hasEmptyFields) {
        setFromError(e("fromError"));
        setToError(e("toError"));
        setLoading(false);
        return;
      }
    } else {
      if (!flightFormData.from || !flightFormData.to) {
        if (!flightFormData.from) setFromError(e("fromError"));
        if (!flightFormData.to) setToError(e("toError"));
        setLoading(false);
        return;
      }
    }

    // Prepare query params
    let queryParams = `adult=${adults}&child=${children}&lapinfant=${infants}&tripType=${encodeURIComponent(flightFormData.flightType)}&class=${encodeURIComponent(flightFormData.class)}`;

    if (flightFormData.flightType === "multiCities") {
      flightFormData.segments?.forEach((segment, index) => {
        queryParams += `&segment${index}_from=${encodeURIComponent(segment.from)}`;
        queryParams += `&segment${index}_to=${encodeURIComponent(segment.to)}`;
        queryParams += `&segment${index}_date=${encodeURIComponent(segment.date?.toISOString() || "")}`;
      });
    } else {
      queryParams += `&origin=${encodeURIComponent(flightFormData.from)}`;
      queryParams += `&destination=${encodeURIComponent(flightFormData.to)}`;
      queryParams += `&departureDate=${encodeURIComponent(flightFormData.departure.toISOString())}`;
      if (flightFormData.flightType === "roundtrip") {
        queryParams += `&returnDate=${encodeURIComponent(flightFormData.return.toISOString())}`;
      }
    }

    router.push(`/${locale}/flight-search?${queryParams}`);
    setLoading(false);
  };

  const toggleHotlFlight = () => setIsHotel(!isHotel);

  useEffect(() => {
    if (searchTermFrom) GetAirpports(searchTermFrom);
    if (searchTermTo) GetAirpports(searchTermTo);
  }, [searchTermFrom, searchTermTo]);

  return (
    <div className="w-full bg-heroBanner min-h-screen 2xl:min-h-auto py-20 lg:py-32 items-center bg-bottom bg-no-repeat bg-cover">
      <Section>
        <div className="gap-8 flex flex-col justify-center items-center">
          <div className="w-full text-white flex flex-col text-center gap-6">
            <h1 className="font-cairo font-bold lg:text-7xl text-5xl">
              {t("heroSection.mainHeading")}
            </h1>
            <p className="font-montserrat font-bold text-lg">
              {t("heroSection.subHeading")}
            </p>
          </div>

          <div className="relative bg-white rounded-2xl py-10 lg:py-0 bg-top-right lg:h-full px-5 h-auto bg-no-repeat bg-contain">
            <div className={`flex justify-between gap-4 w-full py-2 ${isHotel ? "flex-row-reverse" : ""}`}>
              <div className="flex items-center gap-2 justify-between w-full">
                <div className="flex items-center gap-2">
                  {isHotel ? <BedIcon color={"#000"} /> : <AiroplanIcon color={"#121212"} />}
                  <h1 className="text-2xl font-[400]">
                    {isHotel ? t("heroSection.searchForm.formTypeHotels") : t("heroSection.searchForm.formTypeFlights")}
                  </h1>
                </div>
                <div className="cursor-pointer" onClick={toggleHotlFlight}>
                  <ArrowCircleIcon />
                </div>
              </div>

              <button
                className="py-4 px-5 md:text-xl text-base font-semibold rounded-full text-white bg-greenGradient flex gap-2 items-center hover:scale-105 duration-300 transition-all"
                onClick={toggleHotlFlight}
              >
                {isHotel ? <AiroplanIcon color={"#fff"} /> : <BedIcon color={"#fff"} />}
                {isHotel ? t("heroSection.searchForm.formTypeFlights") : t("heroSection.searchForm.formTypeHotels")}
              </button>
            </div>

            {!isHotel ? (
              <div className="pb-5">
                <div className="flex items-center flex-wrap lg:gap-7 gap-4 py-3 lg:py-3 px-6">
                  {tripTypes.map((type) => (
                    <div className="flex items-center gap-2" key={type}>
                      <input
                        type="radio"
                        name="flightType"
                        value={type}
                        className="h-[17px] w-[17px] custom-input-color"
                        checked={flightFormData.flightType === type}
                        onClick={() => handleFlightTypeChange(type)}
                      />
                      <p>{type.replace("-", " ")}</p>
                    </div>
                  ))}
                </div>

                {flightFormData.flightType === "multiCities" ? (
                  <div className="space-y-4">
                    {flightFormData.segments?.map((segment, index) => (
                      <div key={segment.id} className="border-t border-bordered gap-12 py-4 mt-2 grid lg:grid-cols-4 px-4">
                        <div className="flex items-center gap-2 col-span-4">
                          <h3 className="font-medium">Flight {index + 1}</h3>
                          {flightFormData.segments!.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFlightSegment(index)}
                              className="text-red-500 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <AirportSearchField
                          error={index === 0 ? fromError : undefined}
                          label={t("heroSection.searchForm.fromFieldLabel")}
                          placeholder={t("heroSection.searchForm.fromFieldLabel")}
                          className="border-b py-2 !border-borderColor"
                          onSelect={(value) => handleSegmentChange(index, "from", value)}
                          icon={fromImg}

                        />

                        <AirportSearchField
                          error={index === 0 ? toError : undefined}
                          label={t("heroSection.searchForm.toFieldLabel")}
                          placeholder={t("heroSection.searchForm.toFieldLabel")}
                          className="border-b py-2 !border-borderColor"
                          onSelect={(value) => handleSegmentChange(index, "to", value)}
                          icon={toImg}
                        />
                        <CustomDatePicker
                          label={t("heroSection.searchForm.DatePicker")}
                          placeholder={t("heroSection.searchForm.DatePicker")}
                          value={segment.date} // Convert null to undefined
                          className="border-b py-2 border-bordered"
                          minDate={
                            index > 0
                              ? flightFormData.segments![index - 1].date || undefined
                              : new Date()
                          }
                          onChange={(date) => handleSegmentChange(index, "date", date)}
                        />

                      </div>
                    ))}

                    <button
                      onClick={addFlightSegment}
                      className="flex items-center justify-between p-4 gap-2 capitalize ml-4"
                    >
                      add more flights <IoMdAdd />
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-bordered gap-12 py-4 mt-2 grid lg:grid-cols-4 px-4">
                    <AirportSearchField
                      error={fromError}
                      label={t("heroSection.searchForm.fromFieldLabel")}
                      placeholder={t("heroSection.searchForm.fromFieldLabel")}
                      className="border-b py-2 !border-borderColor"
                      onSelect={(value) => handleFlightChange("from", value)}
                      icon={fromImg}
                    />
                    <AirportSearchField
                      error={toError}
                      label={t("heroSection.searchForm.toFieldLabel")}
                      placeholder={t("heroSection.searchForm.toFieldLabel")}
                      className="border-b py-2 !border-borderColor"
                      onSelect={(value) => handleFlightChange("to", value)}
                      icon={toImg}
                    />
                    <CustomDatePicker
                      label={t("heroSection.searchForm.DatePicker")}
                      placeholder={t("heroSection.searchForm.DatePicker")}
                      value={flightFormData.departure}
                      className="border-b py-2 border-bordered"
                      minDate={new Date()}
                      onChange={(date) => handleFlightChange("departure", date)}
                    />
                    {flightFormData.flightType === "roundtrip" && (
                      <CustomDatePicker
                        label={t("heroSection.searchForm.returnDate")}
                        placeholder={t("heroSection.searchForm.returnDate")}
                        className="border-b py-2 border-bordered"
                        value={flightFormData.return}
                        minDate={flightFormData.departure}
                        onChange={(date) => handleFlightChange("return", date)}
                      />
                    )}
                  </div>
                )}

                <div className="border-t border-bordered gap-12 py-4 mt-2 grid lg:grid-cols-4 px-4">
                  <Travelers
                    label={t("heroSection.searchForm.travelersLabel")}
                    adults={adults}
                    setAdults={setAdults}
                    children={children}
                    setChildren={setChildren}
                    infants={infants}
                    setInfants={setInfants}
                  />
                  <CustomSelect
                    options={flightClassOptions}
                    placeholder={t("heroSection.searchForm.classLabel")}
                    label={t("heroSection.searchForm.classLabel")}
                    name="class"
                    value={flightFormData.class}
                    onChange={(value) => handleFlightChange("class", value)}
                  />
                  <button
                    disabled={loading}
                    onClick={handleFlightSubmit}
                    className="py-3 px-4 w-full md:text-xl mt-2 justify-center text-base rounded-3xl text-white bg-greenGradient flex gap-2 items-center hover:scale-105 duration-300 transition-all col-span-2"
                  >
                    {loading ? (
                      <>
                        <LoaderPinwheel />
                        {t("heroSection.searchForm.searchButtonLoading")}
                      </>
                    ) : (
                      <>
                        <LuSearch /> {t("heroSection.searchForm.searchButton")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <HotelSearch />
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default HeroSection;

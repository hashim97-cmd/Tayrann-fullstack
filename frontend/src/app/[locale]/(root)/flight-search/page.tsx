"use client";
import React, { useEffect, useState } from "react";

import axios from "axios";
import FlightFilter from "@/app/components/website/flight-search/flight-filter";
import FlightCard from "@/app/components/website/flight-details/flight-card";
import Section from "@/app/components/shared/section";
import FlightSearchForm from "@/app/components/website/flight-search/search-form";
import { useRouter, useSearchParams } from "next/navigation";
import CustomProgressBar from "@/app/components/shared/progress-bar";
import { PiAirplaneTakeoffThin } from "react-icons/pi";
import Image from "next/image";
import Heading from "@/app/components/shared/heading";
import { calculateTotalDurationShortNew } from "@/utils/airports-helper";
import { differenceInMinutes, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import { clearFlightData, removeFlightData } from "@/redux/flights/flightSlice";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { FlightSegment } from "@/app/components/website/home/hero-section";
// import { changeTripType } from "@/redux/flights/flightSlice";

export interface AirlineCarrier {
  airLineCode: string;
  airLineName: string;
  airlineNameAr: string;
  image: string;
}

const Page: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("filters");
  const searchParamsData = useSelector((state: any) => state.flightData.searchParamsData);

  // Directly destructure the properties (without Data suffix)
  const {
    origin,
    destination,
    departure,
    returnDate,
    travelers,
    flightType,
    flightClass,
    segments
  } = searchParamsData || {};

  // For travelers, you might need to parse if it's stored as an object
  const parsedTravelers = typeof travelers === 'string'
    ? { adults: 1, children: 0, infants: 0 } // Default if string
    : travelers;

  const searchParams = useSearchParams();
  const originParam = searchParams.get("origin");
  const destinationParam = searchParams.get("destination");
  const tripTypeParam = searchParams.get("tripType");
  const departureDateParam = searchParams.get("departureDate");
  const returnDateParam = searchParams.get("returnDate");
  const travelersParam = searchParams.get("adult") || "1";
  const flightClassParam = searchParams.get("class");
  const [sortedFlights, setSortedFlights] = useState<any[]>([]);
  const [originState, setOrigin] = useState(origin || "");
  const [destinationState, setDestination] = useState(destination || "");

  const [departureState, setDepartureDate] = useState(
    departure ? new Date(departure) : new Date()
  );
  const [returnDateState, setReturnDate] = useState(
    returnDate ? new Date(returnDate) : null
  );

  const [travelersState, setTravelers] = useState({
    adults: Number(travelers),
    children: 0,
    infants: 0,
  });
  const [flightClasss, setFlightClass] = useState(flightClass || "ECONOMY");
  const [filters, setFilters] = useState<{ [key: string]: any }>({
    price: Infinity, // Default to no price limit
    stops: [], // Default to show all stops
    airlines: [], // Default to show all airlines
    departureTime: "any", // Default to any time
  });
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carriers, setCarriers] = useState<AirlineCarrier[]>([]);
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);

  const [searchedFlights, setSearchedFlights] = useState<any[]>([]);
  const [outboundFlights, setOutboundFlights] = useState<any[]>([]);
  const [returnFlights, setReturnFlights] = useState<any[]>([]);
  const [isFlightSelected, setIsFlightSelected] = useState(false);
  const tripType = useSelector((state: any) => state.flightData.tripType);

  const flightDataSlice = useSelector((state: any) => state.flightData.flights);

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  function convertToISO8601(dateString: Date) {
    const date = new Date(dateString);
    // const year = date.getFulconvertToISO8601lYear();
    // const month = String(date.getMonth() + 1).padStart(2, "0");
    // const day = String(date.getDate()).padStart(2, "0");
    const isoString = dateString.toISOString().split('T')[0]; // format: YYYY-MM-DD

    return isoString;
  }


  const getFlights = async () => {
    setLoading(true);
    const requestData = {
      destinations: flightType === 'multiCities'
        ? segments.map((s: FlightSegment, index: number) => ({
          id: (index + 1).toString(),
          from: s.origin,
          to: s.destination,
          date: convertToISO8601(s.date)
        })) : flightType === 'roundtrip' ? [{
          id: 1,
          from: origin,
          to: destination,
          date: convertToISO8601(departure),
        }, {
          id: 2,
          from: destination,
          to: origin,
          date: returnDate ? convertToISO8601(returnDate) : undefined,
        }]
          :
          [{
            id: '1',
            from: origin,
            to: destination,
            date: convertToISO8601(departure),
          }],
      adults: parsedTravelers.adults,
      children: parsedTravelers.children,
      infants: parsedTravelers.infants,
      cabinClass: flightClass,
      directFlight: false, // You can make this configurable if needed
      calendarSearch: false // You can make this configurable if needed
    };

    try {
      // api call
      const response = await axios.post(
        'http://localhost:3000/flights/flight-search',
        requestData,
        { headers: { 'Content-Type': 'application/json', "lng": `${locale}` } }
      );
      console.log(response.data, "here is my data")
      // Destructure the flights array
      const allFlights =
        response?.data?.data.map((flight: any) => {
          return {
            ...flight,
            itineraries: [...flight.itineraries_formated],
          };
        }) || [];

      // const outbound = allFlights.map((flight: any) => {
      //   return {
      //     ...flight,
      //     itineraries:
      //       flight.itineraries_formated && flight.itineraries_formated.length > 0
      //         ? [flight.itineraries_formated[0]]
      //         : [],
      //   };
      // });

      // const returning = allFlights
      //   .filter((flight: any) => flight.itineraries_formated?.length > 1)
      //   .map((flight: any) => {
      //     return {
      //       ...flight,
      //       itineraries: flight.itineraries_formated && flight.itineraries_formated.length > 1 ? [flight.itineraries_formated[1]] : [],
      //     };
      //   });

      // Set them to state
      setFlights(allFlights);
      console.log(allFlights, "all flights test")
      // setOutboundFlights(outbound);
      // setReturnFlights(returning ? returning : []);
      setCarriers(response?.data?.filters.carriers);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (true) {
      getFlights();
    }
  }, []);

  // useEffect(() => {
  //   if (outboundFlights) {
  //     setSearchedFlights(outboundFlights);
  //   }
  // }, [outboundFlights]);

  //   useEffect(() => {
  //     if (isFlightSelected) {
  //       setSearchedFlights(returnFlights);
  //     }
  //   }, [isFlightSelected]);

  // const SetReturnFlight = () => {
  //   setSearchedFlights(returnFlights);
  // };

  // Filter Flights Function
  const filteredFlights = flights?.filter((flight) => {
    // Safeguard: Ensure flight and necessary properties exist
    if (!flight?.price || !flight?.itineraries) return false;

    // Filter by price
    const price = parseFloat(flight.price);
    const isPriceValid = price <= filters.price;

    const isStopsValid =
      filters.stops.length === 0 ||
      filters.stops.includes("Any number of stops") ||
      flight.itineraries.some((itinerary: any) => {
        const totalStops = itinerary.segments.length - 1; // Number of stops is segments.length - 1

        // Check the total stops against the filter
        if (filters.stops.includes("Direct flights only") && totalStops === 0) {
          return true;
        }
        if (filters.stops.includes("1 stop") && totalStops === 1) {
          return true;
        }
        if (filters.stops.includes("2 stops or more") && totalStops >= 2) {
          return true;
        }
        return false; // No match, return false
      });

    // Filter by departure time
    const isDepartureTimeValid =
      filters.departureTime === "any" || // No time filters applied
      flight.itineraries.some((itinerary: any) =>
        itinerary.segments.some((segment: any) => {
          const departureDate = new Date(segment?.departure_date_time);
          const departureHour = departureDate.getHours();

          // Check for different time slots based on selected filter
          switch (filters.departureTime) {
            case "morning":
              return departureHour >= 6 && departureHour < 12;
            case "afternoon":
              return departureHour >= 12 && departureHour < 18;
            case "evening":
              return departureHour >= 18 && departureHour < 24;
            case "before_morning":
              return departureHour >= 0 && departureHour < 6;
            default:
              return true; // If no match, return true
          }
        })
      );

    // Filter by airlines
    const airlineCode = flight.airline?.[0];
    // Filter by airlines
    const isAirlinesValid =
      filters.airlines.length === 0 || // No airline filters applied
      filters.airlines.some((selectedAirline: string) => {
        // Find the carrier for this flight
        const carrier = carriers.find((c) => c.airLineCode === flight.airline);

        // Check if flight's airline matches selected filter by code or name
        return (
          flight.airline === selectedAirline || // Direct code match
          (carrier &&
            (carrier.airLineCode === selectedAirline ||
              carrier.airLineName === selectedAirline))
        );
      });
    console.log(isPriceValid, isStopsValid, isDepartureTimeValid, isAirlinesValid, "all filters");
    // Return true if all filters are valid
    return (
      isPriceValid && isStopsValid && isDepartureTimeValid && isAirlinesValid
    );
  });

  // Handle different sorting options
  const handleSortChange = (sortType: string) => {
    let updatedSorts = [...selectedSorts];
    const index = updatedSorts.indexOf(sortType);

    // If sort type is already selected, remove it; otherwise, add it
    if (index === -1) {
      updatedSorts.push(sortType);
    } else {
      updatedSorts.splice(index, 1);
    }

    setSelectedSorts(updatedSorts); // Update selected sorts

    // Apply sorting only if any sorting options are selected
    let sortedList = [...filteredFlights];

    if (updatedSorts.length > 0) {
      updatedSorts.forEach((type) => {
        switch (type) {
          case "cheapest":
            sortedList = sortedList.sort(
              (a, b) => a.price - b.price
            );
            break;
          case "shortest":
            sortedList = sortedList.sort((a, b) => {
              const durationA = a.itineraries.reduce(
                (total: any, itinerary: any) =>
                  total +
                  parseInt(
                    calculateTotalDurationShortNew(itinerary.segments).replace(
                      /[^0-9]/g,
                      ""
                    ),
                    10
                  ),
                0
              );
              const durationB = b.itineraries.reduce(
                (total: any, itinerary: any) =>
                  total +
                  parseInt(
                    calculateTotalDurationShortNew(itinerary.segments).replace(
                      /[^0-9]/g,
                      ""
                    ),
                    10
                  ),
                0
              );
              return durationA - durationB;
            });
            break;
          case "earliest-takeoff":
            sortedList = sortedList.sort((a, b) => {
              const departureTimeA = new Date(
                a.itineraries[0].segments[0].departure.at
              ).getTime();
              const departureTimeB = new Date(
                b.itineraries[0].segments[0].departure.at
              ).getTime();
              return departureTimeA - departureTimeB;
            });
            break;
          case "earliest-arrival":
            sortedList = sortedList.sort((a, b) => {
              const arrivalTimeA = new Date(
                a.itineraries[0].segments.slice(-1)[0].arrival.at
              ).getTime();
              const arrivalTimeB = new Date(
                b.itineraries[0].segments.slice(-1)[0].arrival.at
              ).getTime();
              return arrivalTimeA - arrivalTimeB;
            });
            break;
          default:
            break;
        }
      });
    }

    setSortedFlights(sortedList.slice(0, 10)); // Get top 10 flights after sorting
  };

  // Highlight active buttons
  const getButtonClass = (sortType: string) => {
    return selectedSorts.includes(sortType)
      ? "bg-greenGradient text-white"
      : "border border-borderColor";
  };

  // console.log("gonig flights :", outboundFlights);
  // console.log("retunr flights :", returnFlights);

  const calculateStops = (flightSegments: any[]) => {
    // If there is more than 1 segment, there are stops
    const numberOfStops =
      flightSegments?.length > 1 ? flightSegments?.length - 1 : 0;
    return numberOfStops;
  };

  // Function to calculate the stop duration between segments
  const calculateStopDuration = (
    arrivalTime: string,
    nextDepartureTime: string
  ) => {
    const arrivalDate = parseISO(arrivalTime);
    const nextDepartureDate = parseISO(nextDepartureTime);
    const stopDurationInMinutes = differenceInMinutes(
      nextDepartureDate,
      arrivalDate
    );

    // Convert minutes to hours and minutes
    const hours = Math.floor(stopDurationInMinutes / 60);
    const minutes = stopDurationInMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const displayFlightDetails = (flightSegments: any[]) => {
    const numberOfStops = calculateStops(flightSegments);

    console.log(`Number of stops: ${numberOfStops}`);

    if (numberOfStops > 0) {
      for (let i = 0; i < flightSegments.length - 1; i++) {
        const currentSegment = flightSegments[i];
        const nextSegment = flightSegments[i + 1];

        const stopAirport = currentSegment.arrival.iataCode;
        const stopDuration = calculateStopDuration(
          currentSegment.arrival.at,
          nextSegment.departure.at
        );


      }
    }
  };

  //@ts-ignore
  displayFlightDetails(flights[0]?.segments);

  return (
    <Section>
      <div className="py-20">
        {/* <FlightSearchForm
          flights={flights}
          setFlights={setFlights}
          setLoading={setLoading}
          loading={loading}
          origin={origin}
          destination={destination}
          departureDate={departureDate}
          returnDate={returnDate}
          travelers={travelers}
          flightClass={flightClass}
          setOrigin={setOrigin}
          setDestination={setDestination}
          setDepartureDate={setDepartureDate}
          setReturnDate={setReturnDate}
          setTravelers={setTravelers}
          setFlightClass={setFlightClass}
        /> */}
        <div className="flex flex-wrap justify-between gap-5 py-10">
          <div className="lg:w-1/4 w-full ">
            <div className="flex justify-between flex-wrap px-3 items-center gap-5 ">
              <h2 className="lg:text-xl font-semibold">{t("heading")}</h2>
              <h2 className="lg:text-xl font-semibold">
                ({filteredFlights && filteredFlights.length})
              </h2>
            </div>
            <FlightFilter
              filterPrice={filters.price}
              filterStops={filters.stops}
              airlines={Object.values(carriers)} // here is airlines
              filterDepartureTime={filters.departureTime}
              onPriceChange={(newPrice) =>
                setFilters({ ...filters, price: newPrice })
              }
              onStopsChange={(newStops) =>
                setFilters({ ...filters, stops: newStops })
              }
              onDepartureTimeChange={(newTime) =>
                setFilters({ ...filters, departureTime: newTime })
              }
              onAirlinesChange={(newAirlines) =>
                setFilters({ ...filters, airlines: newAirlines })
              }
              filterAirlines={filters.airlines}
              filterBaggage={[]} // Add baggage filter functionality if needed
              onBaggageChange={(baggage: string[]) => {
                console.log("Baggage updated:", baggage);
              }}
            />
          </div>

          <div className={`lg:w-[72%] w-full space-y-6`}>
            <div className="flex items-center whitespace-nowrap flex-wrap sm:flex-nowrap justify-between gap-2 w-full">
              <button
                className={`rounded-full p-2 w-full ${getButtonClass(
                  "cheapest"
                )}`}
                onClick={() => handleSortChange("cheapest")}
              >
                {t("cheapest")}
              </button>
              <button
                className={`rounded-full p-2 w-full ${getButtonClass(
                  "shortest"
                )}`}
                onClick={() => handleSortChange("shortest")}
              >
                {t("shortest")}
              </button>
              <button
                className={`rounded-full p-2 w-full ${getButtonClass(
                  "earliest-takeoff"
                )}`}
                onClick={() => handleSortChange("earliest-takeoff")}
              >
                {t("earliesttakeoff")}
              </button>
              <button
                className={`rounded-full p-2 w-full ${getButtonClass(
                  "earliest-arrival"
                )}`}
                onClick={() => handleSortChange("earliest-arrival")}
              >
                {t("earliestarrival")}
              </button>
            </div>

            {flightDataSlice?.length > 0 && (
              <div className=" rounded-lg p-5 bg-gray flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className=" flex items-center gap-3">
                    <IoIosCheckmarkCircle color="green" size={20} />
                    <p>Selected Departure Flight</p>
                  </div>
                  <button
                    className=" text-white rounded-md py-2 px-3 cursor-pointer bg-green"
                    onClick={() => {
                      setSearchedFlights(flights);
                      dispatch(clearFlightData());
                      setIsFlightSelected(false);
                    }}
                  >
                    Change
                  </button>
                </div>
                <div className="p-3">
                  <FlightCard
                    from={"seleted"}
                    key={"#12"}
                    isFlightSelected={isFlightSelected}
                    setIsFlightSelected={setIsFlightSelected}
                    flight={flightDataSlice[0]}
                    airlineName={flightDataSlice[0].airlineName}
                  />
                </div>
              </div>
            )}

            {flightDataSlice?.length > 0 && (
              <div className=" text-black flex py-5 items-senter justify-start gap-2">
                <PiAirplaneTakeoffThin className=" rotate-270" size={40} />
                <div className="flex flex-col items-start">
                  <p className=" font-semibold text-2xl">
                    Select return flight
                  </p>
                  <p className="font-normal text-md text-slate-500">
                    The displayed prices represent the total cost for a
                    round-trip journey
                  </p>
                </div>
              </div>
            )}

            {loading && <CustomProgressBar />}

            {selectedSorts.length > 0 ? (
              <div className="w-full space-y-6">
                {sortedFlights?.length === 0 && !loading && (
                  <div className="min-h-screen w-full flex-col flex justify-center items-center">
                    <Heading>No Flight Found</Heading>
                    <Image
                      src={"/no-flight.svg"}
                      width={400}
                      height={400}
                      alt=""
                    />
                  </div>
                )}
                {sortedFlights?.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    airlineName={carriers[flight.validatingAirlineCodes[0]]}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full space-y-6">
                {filteredFlights?.length === 0 && !loading && (
                  <div className="min-h-screen w-full flex-col flex justify-center items-center">
                    <Heading>No Flight Found</Heading>
                    <Image
                      src={"/no-flight.svg"}
                      width={400}
                      height={400}
                      alt=""
                      className=""
                    />
                  </div>
                )}
                {filteredFlights?.map((flight) => (
                  <FlightCard
                    from={"card"}
                    key={flight.id}
                    isFlightSelected={isFlightSelected}
                    setIsFlightSelected={setIsFlightSelected}
                    // SetReturnFlight={SetReturnFlight}
                    // returnFlights={returnFlights}
                    flight={flight}
                    setIsSideMenuOpen={setIsSideMenuOpen}
                    airlineName={carriers[flight.airline]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isSideMenuOpen && (
        <div className="fixed inset-0 flex items-center justify-end top-0 z-[99] bg-[#00000099] h-full">
          <div
            className={`flex flex-col p-5 justify-between h-full w-[50%] bg-white shadow-lg transform ${isSideMenuOpen ? "translate-x-0" : "translate-x-full"
              } transition-transform duration-300 ease-in-out`}
          >
            <div className="flex justify-between items-center border-b border-b-slate-300 pb-2">
              <h2 className="text-xl text-primary font-semibold">
                Flight details
              </h2>
              <button
                onClick={() => {
                  if (returnFlights.length === 0) {
                    dispatch(clearFlightData());
                  } else {
                    dispatch(removeFlightData(1));
                  }
                  setIsSideMenuOpen(false);
                }}
              >
                <AiOutlineClose className="text-xl text-gray-700" />
              </button>
            </div>
            <div className=" overflow-y-auto flex flex-col items-center gap-5 my-5">
              {flightDataSlice &&
                flightDataSlice?.map((flight: any) => (
                  <FlightCard
                    from={"selection"}
                    key={flight.id}
                    isFlightSelected={isFlightSelected}
                    setIsFlightSelected={setIsFlightSelected}
                    // SetReturnFlight={SetReturnFlight}
                    flight={flight}
                    setIsSideMenuOpen={setIsSideMenuOpen}
                    airlineName={flightDataSlice[0].airlineName}
                  />
                ))}
            </div>

            <div className="flex justify-between items-center border-t border-t-slate-300 pt-5 mt-5">
              <div>
                <h2 className="text-xl text-primary font-semibold">
                  Flight details
                </h2>
                <h1 className="flex items-center gap-2">
                  <span>Totla Price:</span>
                  <span className="font-semibold text-lg">
                    {flightDataSlice[0]?.currency}
                  </span>
                  <span className="font-semibold text-lg">
                    {flightDataSlice[0]?.price}
                  </span>
                </h1>
              </div>
              <button
                onClick={() => {
                  router.push(`/${locale}/book-now?adults=${travelersParam}`);
                }}
                className=" text-white rounded-md py-2 px-3 cursor-pointer bg-green"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default Page;

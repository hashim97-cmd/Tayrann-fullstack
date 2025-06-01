"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useLocale } from "next-intl";
import { getPersistedFlightData } from "@/utils/flightStorage";
import { setSearchData } from "@/redux/flights/flightSlice";

export interface AirlineCarrier {
  airLineCode: string;
  airLineName: string;
  airlineNameAr: string;
  image: string;
}

interface FlightSegment {
  origin: string;
  destination: string;
  date: Date;
}

const useSearchflights = () => {
  const locale = useLocale();
  const dispatch = useDispatch();
  const searchParamsData = useSelector((state: any) => state.flightData.searchParamsData);
  const hasHydrated = useSelector((state: any) => state._persist?.rehydrated);
  
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [departure, setDeparture] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [flightType, setFlightType] = useState<string>("oneway");
  const [flightClass, setFlightClass] = useState<string>("ECONOMY");
  const [segments, setSegments] = useState<FlightSegment[]>([]);
  const [carriers, setCarriers] = useState<AirlineCarrier[]>([]);

  // Initialize state from Redux store
  useEffect(() => {
    if (searchParamsData) {
      setOrigin(searchParamsData.origin || "");
      setDestination(searchParamsData.destination || "");
      setDeparture(searchParamsData.departure || null);
      setReturnDate(searchParamsData.returnDate || null);
      setTravelers(searchParamsData.travelers || { adults: 1, children: 0, infants: 0 });
      setFlightType(searchParamsData.flightType || "oneway");
      setFlightClass(searchParamsData.flightClass || "ECONOMY");
      setSegments(searchParamsData.segments || []);
    }
  }, [searchParamsData]);

  // Load persisted data when hydration is complete
  useEffect(() => {
    if (!hasHydrated) return;

    const persistedData = getPersistedFlightData();
    if (persistedData?.searchParamsData) {
      dispatch(setSearchData(persistedData.searchParamsData));
    }
  }, [dispatch, hasHydrated]);

  const convertToISO8601 = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  const getFlights = async () => {
    setLoading(true);
    
    try {
      // Validate required fields based on flight type
      if (flightType === 'oneway' && (!origin || !destination || !departure)) {
        throw new Error("Missing required fields for one-way flight");
      }

      if (flightType === 'roundtrip' && (!origin || !destination || !departure || !returnDate)) {
        throw new Error("Missing required fields for roundtrip flight");
      }

      if (flightType === 'multiCities' && segments.length === 0) {
        throw new Error("No segments provided for multi-city flight");
      }

      // Prepare request data based on flight type
      let destinations;
      
      if (flightType === 'multiCities') {
        destinations = segments.map((segment, index) => ({
          id: (index + 1).toString(),
          from: segment.origin,
          to: segment.destination,
          date: convertToISO8601(segment.date)
        }));
      } else if (flightType === 'roundtrip') {
        destinations = [
          {
            id: "1",
            from: origin,
            to: destination,
            date: convertToISO8601(departure),
          },
          {
            id: "2",
            from: destination,
            to: origin,
            date: convertToISO8601(returnDate),
          }
        ];
      } else {
        // oneway
        destinations = [
          {
            id: "1",
            from: origin,
            to: destination,
            date: convertToISO8601(departure),
          }
        ];
      }

      const requestData = {
        destinations,
        adults: travelers.adults,
        children: travelers.children,
        infants: travelers.infants,
        cabinClass: flightClass,
        directFlight: false,
        calendarSearch: false
      };

      const response = await axios.post(
        'http://localhost:3000/flights/flight-search',
        requestData,
        { headers: { 'Content-Type': 'application/json', "lng": locale } }
      );

      const allFlights = response?.data?.data?.map((flight: any) => ({
        ...flight,
        itineraries: [...(flight.itineraries_formated || [])],
      })) || [];

      setFlights(allFlights);
      setCarriers(response?.data?.filters?.carriers || []);
    } catch (error) {
      console.error("Error fetching flights:", error);
      setFlights([]);
      setCarriers([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger flight search when relevant data changes
  useEffect(() => {
    if (!hasHydrated) return;

    const shouldSearch = 
      (flightType === 'oneway' && origin && destination && departure) ||
      (flightType === 'roundtrip' && origin && destination && departure && returnDate) ||
      (flightType === 'multiCities' && segments.length > 0);

    if (shouldSearch) {
      getFlights();
    }
  }, [
    origin,
    destination,
    departure,
    returnDate,
    travelers,
    flightType,
    flightClass,
    segments,
    hasHydrated
  ]);

  return {
    getFlights,
    carriers,
    flights,
    setFlights,
    loading,
    setLoading,
    origin,
    destination,
    departure,
    returnDate,
    travelers,
    flightType,
    flightClass,
    segments,
    hasHydrated,
    setOrigin,
    setDestination,
    setDeparture,
    setReturnDate,
    setTravelers,
    setFlightType,
    setFlightClass,
    setSegments,
  };
};

export default useSearchflights;
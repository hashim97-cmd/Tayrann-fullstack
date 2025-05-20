import { ApiError } from "../utils/apiError.js";
import { getAmadeusToken } from "../utils/amadeus-token.js";
import axios from "axios";

// Helper function to format duration from ISO format (PT1H50M) to readable format
const formatDuration = (isoDuration) => {
    const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;

    if (hours > 0 && minutes > 0) return `${hours} hours ${minutes} minutes`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} minutes`;
};

// Helper function to format time (2025-05-28T16:30:00) to 04:30 pm
const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export const flightOffers = async (req, res, next) => {
    console.log("Route hit");             // Confirm the route is called
    console.log("Headers:", req.headers); // Confirm Content-Type is correct
    console.log("Body:", req.body);       // This is your main check
    try {
        console.log(req.body, "requst bodysss")
        const { destinations, adults, children, infants, cabinClass, directFlight } = req.body;

        // Validate and prepare request to Amadeus API
        const token = await getAmadeusToken();
        const response = await axios.post(
            'https://test.api.amadeus.com/v2/shopping/flight-offers',
            {
                currencyCode: "SAR",
                originDestinations: destinations.map((dest, index) => ({
                    id: (index + 1).toString(),
                    originLocationCode: dest.from,
                    destinationLocationCode: dest.to,
                    departureDateTimeRange: {
                        date: dest.date,
                        time: "00:00:00"
                    }
                })),
                travelers: [
                    {
                        id: "1",
                        travelerType: "ADULT",
                        fareOptions: ["STANDARD"]
                    },
                    ...(children > 0 ? [{
                        id: "2",
                        travelerType: "CHILD",
                        fareOptions: ["STANDARD"]
                    }] : []),
                    ...(infants > 0 ? [{
                        id: "3",
                        travelerType: "SEATED_INFANT",
                        fareOptions: ["STANDARD"],
                        associatedAdultId: "1"
                    }] : [])
                ],
                sources: ["GDS"],
                searchCriteria: {
                    maxFlightOffers: 250,
                    flightFilters: {
                        cabinRestrictions: [{
                            cabin: cabinClass?.toUpperCase() || "ECONOMY",
                            coverage: "MOST_SEGMENTS",
                            originDestinationIds: destinations.map((_, i) => (i + 1).toString())
                        }],
                        carrierRestrictions: {
                            excludedCarrierCodes: ["ZZ"]
                        },
                        connectionRestrictions: {
                            maxNumberOfConnections: directFlight ? 0 : 3
                        }
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Transform Amadeus response to your desired format
        const formattedResponse = response.data.data.map((offer, index) => {
            // Create mapping string (CAI-MED|2025-05-28|XY-575||MED-CAI|2025-05-29|XY-576)
            const mapping = offer.itineraries.map(itinerary => {
                const segment = itinerary.segments[0];
                return `${segment.departure.iataCode}-${segment.arrival.iataCode}|${segment.departure.at.split('T')[0]}|${segment.carrierCode}-${segment.number}`;
            }).join('||');

            // Prepare itineraries_formated
            const itineraries_formated = offer.itineraries.map((itinerary, i) => {
                const segment = itinerary.segments[0];
                return {
                    duration: formatDuration(itinerary.duration),
                    fromLocation: segment.departure.iataCode,
                    toLocation: segment.arrival.iataCode,
                    fromName: `${segment.departure.iataCode} Airport`, // You might want to lookup actual names
                    toName: `${segment.arrival.iataCode} Airport`,
                    fromAirport: {
                        id: 0, // You would need to lookup these
                        name: `${segment.departure.iataCode} Airport`,
                        code: segment.departure.iataCode,
                        city: `${segment.departure.iataCode} - COUNTRY`
                    },
                    toAirport: {
                        id: 0,
                        name: `${segment.arrival.iataCode} Airport`,
                        code: segment.arrival.iataCode,
                        city: `${segment.arrival.iataCode} - COUNTRY`
                    },
                    departure: {
                        departure_date_time: segment.departure.at,
                        departure_date: segment.departure.at.split('T')[0],
                        departure_time: formatTime(segment.departure.at),
                        departure_terminal: segment.departure.terminal || null,
                        arrival_date_time: segment.arrival.at,
                        arrival_date: segment.arrival.at.split('T')[0],
                        arrival_time: formatTime(segment.arrival.at),
                        arrival_terminal: segment.arrival.terminal || null,
                        stops: segment.numberOfStops,
                        duration: formatDuration(segment.duration),
                        flightNumber: segment.number,
                        airlineCode: segment.carrierCode,
                        airlineName: segment.carrierCode, // You might want to lookup the actual name
                        image: `https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20240602/flights/airlines_square/${segment.carrierCode}.png`
                    },
                    segments: [{
                        ...segment, // Include all segment details
                        departure_date: segment.departure.at.split('T')[0],
                        departure_time: formatTime(segment.departure.at),
                        arrival_date: segment.arrival.at.split('T')[0],
                        arrival_time: formatTime(segment.arrival.at),
                        duration: formatDuration(segment.duration),
                        fromName: `${segment.departure.iataCode} Airport`,
                        toName: `${segment.arrival.iataCode} Airport`,
                        fromAirport: {
                            id: 0,
                            name: `${segment.departure.iataCode} Airport`,
                            code: segment.departure.iataCode,
                            city: `${segment.departure.iataCode} - COUNTRY`
                        },
                        toAirport: {
                            id: 0,
                            name: `${segment.arrival.iataCode} Airport`,
                            code: segment.arrival.iataCode,
                            city: `${segment.arrival.iataCode} - COUNTRY`
                        },
                        class: offer.travelerPricings[0].fareDetailsBySegment[i].class,
                        image: `https://assets.wego.com/image/upload/h_240,c_fill,f_auto,fl_lossy,q_auto:best,g_auto/v20240602/flights/airlines_square/${segment.carrierCode}.png`
                    }]
                };
            });

            // Prepare the complete response object
            return {
                mapping,
                id: offer.id,
                agent: "GDS",
                source: offer.source,
                fromLocation: offer.itineraries[0].segments[0].departure.iataCode,
                toLocation: offer.itineraries.slice(-1)[0].segments[0].arrival.iataCode,
                fromName: `${offer.itineraries[0].segments[0].departure.iataCode} Airport`,
                toName: `${offer.itineraries.slice(-1)[0].segments[0].arrival.iataCode} Airport`,
                type: offer.oneWay ? "OneWay" : "RoundTrip",
                adults: adults,
                children: children || 0,
                infants: infants || 0,
                numberOfBookableSeats: offer.numberOfBookableSeats,
                airline: offer.itineraries[0].segments[0].carrierCode,
                airlineName: offer.itineraries[0].segments[0].carrierCode, // Lookup actual name
                flightNumber: offer.itineraries[0].segments[0].number,
                stops: offer.itineraries.map(it => it.segments[0].numberOfStops),
                original_price: offer.price.total,
                price: parseFloat(offer.price.total),
                currency: offer.price.currency,
                refund: !offer.fareRules?.rules?.some(r => r.category === "REFUND" && r.notApplicable),
                exchange: !offer.fareRules?.rules?.some(r => r.category === "EXCHANGE" && r.notApplicable),
                cabinClass: cabinClass || "ECONOMY",
                allowedBags: `${offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags?.weight || 0} KG`,
                allowedCabinBags: offer.travelerPricings[0].fareDetailsBySegment[0].includedCabinBags?.quantity || 0,
                provider: "amadeus",
                itineraries_formated,
                fare_rules: offer.fareRules?.rules || [],
                pricing_options: offer.pricingOptions,
                traveller_pricing: offer.travelerPricings.map(tp => ({
                    travelerType: tp.travelerType,
                    total: tp.price.total,
                    base: tp.price.base,
                    tax: parseFloat(tp.price.total) - parseFloat(tp.price.base),
                    class: tp.fareDetailsBySegment[0].class,
                    allowedBags: {
                        quantity: `${tp.fareDetailsBySegment[0].includedCheckedBags?.weight || 0} KG`,
                        weight: `${tp.fareDetailsBySegment[0].includedCheckedBags?.weight || 0} KG`
                    },
                    cabinBagsAllowed: tp.fareDetailsBySegment[0].includedCabinBags?.quantity || 0,
                    fareDetails: tp.fareDetailsBySegment.map(fds => ({
                        segmentId: fds.segmentId,
                        cabin: fds.cabin,
                        fareBasis: fds.fareBasis,
                        class: fds.class,
                        bagsAllowed: `${fds.includedCheckedBags?.weight || 0} KG`,
                        cabinBagsAllowed: fds.includedCabinBags?.quantity || 0
                    }))
                })),
                baggage_details: offer.itineraries.flatMap((it, i) => it.segments.map(seg => ({
                    "Flight Number": seg.number,
                    "From": seg.departure.iataCode,
                    "To": seg.arrival.iataCode,
                    "Airline": seg.carrierCode,
                    "Checked Bags Allowed": offer.travelerPricings[0].fareDetailsBySegment[i].includedCheckedBags?.weight || 0,
                    "Cabin Bags Allowed": offer.travelerPricings[0].fareDetailsBySegment[i].includedCabinBags?.quantity || 0
                }))),
                total_pricing_by_traveller_type: offer.travelerPricings.reduce((acc, tp) => {
                    acc[tp.travelerType] = {
                        totalPrice: parseFloat(tp.price.total),
                        travelerCount: tp.travelerType === "ADULT" ? adults :
                            tp.travelerType === "CHILD" ? children : infants
                    };
                    return acc;
                }, {}),
                charges: {
                    exchange: offer.fareRules?.rules?.find(r => r.category === "EXCHANGE")?.maxPenaltyAmount || "Not Applicable",
                    refund: offer.fareRules?.rules?.find(r => r.category === "REFUND")?.notApplicable ? "Not Applicable" : "Available",
                    revalidation: offer.fareRules?.rules?.find(r => r.category === "REVALIDATION")?.notApplicable ? "Not Applicable" : "Available"
                },
                origins: offer.itineraries.map(it => it.segments[0].departure.iataCode),
                destinations: offer.itineraries.map(it => it.segments[0].arrival.iataCode),
                originalResponse: offer // Include the original response for reference
            };
        });

        res.status(200).json({
            success: true,
            data: formattedResponse,
            filters: response.data.dictionaries
        });

    } catch (error) {
        console.error("Amadeus API Error:", error.response?.data || error.message);
        next(new ApiError(
            error.response?.status || 500,
            error.response?.data?.errors?.[0]?.detail || "Error searching for flights"
        ));
    }
};
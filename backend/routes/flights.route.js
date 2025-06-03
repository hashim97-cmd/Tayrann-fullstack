import express from "express";
const router = express.Router();
import { flightOffers, flightPricing, flightBooking, getFlightOrder } from "../controllers/flights.controller.js";


router.post("/flight-search", flightOffers);
router.post("/flight-pricing", flightPricing);
router.post("/flight-booking", flightBooking);
router.get("/flight-order/:flightId", getFlightOrder);



export default router;

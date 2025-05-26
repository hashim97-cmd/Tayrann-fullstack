import express from "express";
const router = express.Router();
import { flightOffers, flightPricing } from "../controllers/flights.controller.js";


router.post("/flight-search", flightOffers);
router.post("/flight-pricing", flightPricing);


export default router;

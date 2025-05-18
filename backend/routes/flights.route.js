import express from "express";
const router = express.Router();
import { flightOffers } from "../controllers/flights.controller.js";


router.post("/flight-search", flightOffers);

export default router;

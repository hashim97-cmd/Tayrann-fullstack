import express from "express";
const router = express.Router();
import { flightOffers } from "../controllers/flights.controller.js";


router.get("/flight-search", flightOffers);

export default router;

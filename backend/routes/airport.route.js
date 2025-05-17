import express from "express";
import { getAirports } from "../controllers/airports.controller.js"
const router = express.Router();


router.get("/getairport", getAirports);


export default router;
import express from "express";
import { InitiateSession, ExecutePayment } from "../../controllers/payment/payment.controller.js";

const router = express.Router();


router.post("/initiateSession", InitiateSession);
router.post("/execute-payment", ExecutePayment);


export default router;
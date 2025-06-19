import axios from "axios";
import { ApiError } from "../../utils/apiError.js"

export const InitiateSession = async (req, res, next) => {

    try {

        const paymentBaseUrl = process.env.MYFATOORAH_API_URL;
        const token = process.env.MYFATOORAH_TEST_TOKEN;
        const resposne = await axios.post(`${paymentBaseUrl}/v2/InitiateSession`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        console.log(resposne);
        res.status(200).json({ data: resposne.data, status: resposne.status });

    } catch (error) {
        console.error('My Fatoorah InitiateSession Error:', error.message);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

// controllers/payment/payment.controller.js
export const ExecutePayment = async (req, res, next) => {
  try {
    const { sessionId, invoiceValue } = req.body;       // only these two!
    const apiBase = process.env.MYFATOORAH_API_URL;
    const token   = process.env.MYFATOORAH_TEST_TOKEN;

    const { data } = await axios.post(
      `${apiBase}/v2/ExecutePayment`,
      {
        SessionId:    sessionId,
        InvoiceValue: invoiceValue            // e.g. 100
        // (optional) CallBackUrl, ErrorUrl
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // data.Data.PaymentURL  ==> pass this to the browser
    res.status(200).json(data);
  } catch (err) {
    console.error('ExecutePayment error:', err?.response?.data || err.message);
    next(new ApiError(500, 'ExecutePayment failed'));
  }
};

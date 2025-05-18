import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"

import airportRoute from './routes/airport.route.js';
import filghtsRoute from "./routes/flights.route.js"
import connectMongoDB from "./db/connectMongoDB.js";


const app = express();
dotenv.config();
app.use(cors())

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/airports', airportRoute);
app.use('/flights', filghtsRoute);



app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectMongoDB();
});


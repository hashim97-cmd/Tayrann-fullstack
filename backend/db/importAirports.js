// import mongoose from 'mongoose';
// import Airport from '../models/airport.model.js';
// import { airports } from './fc-airports.js';

// // Replace with your MongoDB Atlas connection string
// const uri = "mongodb+srv://hashimsalahalden5:LJe3NuCWvJzq6iR4@cluster0.gh0fxvt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(async () => {
//         console.log('Connected to MongoDB Atlas');

//         // Optional: clear existing data
//         await Airport.deleteMany({});

//         await Airport.insertMany(airports);
//         console.log('Airports imported successfully');

//         mongoose.disconnect();
//     })
//     .catch(err => console.error('MongoDB connection error:', err));

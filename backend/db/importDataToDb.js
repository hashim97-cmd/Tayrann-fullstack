// import mongoose from 'mongoose';
// import Airline from '../models/Airlines.model.js';
// import { airlines } from './airlines.js'; 

// // Replace with your MongoDB Atlas connection string
// const uri = "mongodb+srv://hashimsalahalden5:LJe3NuCWvJzq6iR4@cluster0.gh0fxvt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(async () => {
//         console.log('Connected to MongoDB Atlas');

//         // Optional: clear existing data
//         await Airline.deleteMany({});

//         await Airline.insertMany(airlines);
//         console.log('Airline imported successfully');

//         mongoose.disconnect();
//     })
//     .catch(err => console.error('MongoDB connection error:', err));

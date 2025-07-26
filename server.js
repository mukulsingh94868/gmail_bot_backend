import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
// const authRoutes = require('./routes/authRoutes');

// import AuthRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
// app.use(express.json());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/uploads", express.static("uploads"));
// app.use('/api/auth', AuthRoutes);

mongoose.connect(MONGO_URI).then(() => {
        console.log('DB connection established');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost: ${PORT}`);
          });
    }).catch((error) => console.error('MongoDB connection error:', error));

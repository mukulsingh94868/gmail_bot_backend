import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import AuthRoutes from './routes/AuthRoutes.js';
import PositionRoutes from './routes/PositionRoutes.js';
import PositionAppliedRoutes from './routes/PositionAppliedRoutes.js';
import JobPostRoutes from './routes/JobPostRoutes.js';
import JDRoutes from './routes/JDRoutes.js';
import SavedJobRoutes from './routes/SavedJobRoute.js';
import AppliedJobRoutes from './routes/AppliedRoutes.js';
import FollowUpRoutes from './routes/FollowUpTestRoutes.js';
import ContactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/uploads", express.static("uploads"));
app.use('/api/auth', AuthRoutes);
app.use('/api/position', PositionRoutes);
app.use('/api/apply', PositionAppliedRoutes);
app.use('/api/jobpost', JobPostRoutes);
app.use('/api/jd', JDRoutes);
app.use('/api/savedjobs', SavedJobRoutes);
app.use('/api/appliedJobs', AppliedJobRoutes);
app.use('/api/followUp', FollowUpRoutes);
app.use('/api/contact', ContactRoutes);

mongoose.connect(MONGO_URI).then(() => {
        console.log('DB connection established');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost: ${PORT}`);
          });
    }).catch((error) => console.error('MongoDB connection error:', error));
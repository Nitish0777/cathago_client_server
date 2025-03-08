import express from 'express';
import cors from 'cors';
import { createUserTable } from './models/userModel.js';
import { createDocumentTable } from './models/documentModel.js';
import { createScanHistoryTable } from './models/scanHistoryModel.js';
import { createCreditRequestTable } from './models/creditRequestModel.js';
import { createAdminAnalyticsTable } from './models/adminAnalyticsModel.js';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());


connectDatabase();

createUserTable();
createDocumentTable();
createScanHistoryTable();
createCreditRequestTable();
createAdminAnalyticsTable();

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/document', documentRoutes);
//app.use()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to the document scanning app!');
});


export default app;
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { importRoutes } from './routes/import';
import { optimizationRoutes } from './routes/optimization';
import { driverRoutes } from './routes/drivers';
import { routeRoutes } from './routes/routes';

// .env lives at the repo root, but this package runs with its own directory as
// the working directory, so a bare dotenv.config() would look in the wrong
// place. src/ and dist/ sit at the same depth, so one path covers both.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/import', importRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

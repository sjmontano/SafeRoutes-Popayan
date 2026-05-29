import express from 'express';
import cors from 'cors';
import graphRoutes from './routes/graphRoutes.js';
import { seedReports } from './services/graphService.js';
import SEED_REPORTS from '../../client/src/utils/seedReports.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', graphRoutes);

seedReports(SEED_REPORTS);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SafeRoutes Popayán API',
  });
});

app.listen(PORT, () => {
  console.log(`[SafeRoutes] API corriendo en http://localhost:${PORT}`);
  console.log(`[SafeRoutes] Endpoints:`);
  console.log(`  GET  /api/graph`);
  console.log(`  GET  /api/graph/nodes`);
  console.log(`  GET  /api/graph/zones`);
  console.log(`  GET  /api/graph/report-types`);
  console.log(`  GET  /api/graph/current-hour-factor`);
  console.log(`  POST /api/route/safest`);
  console.log(`  POST /api/route/fastest`);
  console.log(`  POST /api/route/balanced`);
  console.log(`  POST /api/route/astar-safest`);
  console.log(`  GET  /api/reports`);
  console.log(`  POST /api/reports`);
  console.log(`  GET  /api/reports/heatmap`);
  console.log(`  GET  /api/search`);
});

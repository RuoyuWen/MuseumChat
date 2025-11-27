import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat.js';
import { configRouter } from './routes/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/config', configRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Museum Guide API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


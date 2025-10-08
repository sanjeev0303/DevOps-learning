import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from '#routes/auth.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  logger.info('Hello from logger');
  res.status(200).send('Hello from DevOps');
});

app.get('/health', (_, res) => {
  const currentDate = new Date();
  res.status(200).json({
    status: 'ok',
    timestamp: currentDate.toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'DevOps API is running!' });
});

app.use('/api/auth', authRouter);

export default app;

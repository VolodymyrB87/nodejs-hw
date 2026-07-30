import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: '*',
    methods: 'GET,PATCH,POST,DELETE',
  }),
);
app.use(cookieParser());
app.use(logger);
app.use(helmet());
app.use(express.json());

app.use(notesRoutes);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

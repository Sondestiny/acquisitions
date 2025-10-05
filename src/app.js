import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRouter from './routes/auth.router.js';
import securityMiddleware from './middlewares/security.middleware.js';
const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));
app.use(securityMiddleware);
app.get('/', (req, res)=> {
  logger.info('Hello from accquisittions');
  return res.status(200).send('Hello from accquisittions');
});

app.get('/api', (req, res)=> {
  logger.info('this is accquisittions API');
  return res.status(200).send('this is accquisittions API');
});

app.use('/api/auth', authRouter);


export default app;
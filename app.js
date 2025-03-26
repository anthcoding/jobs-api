require('dotenv').config();
require('express-async-errors');

//extra security packages
const helmet = require('helmet');
//cors allows to make request from different origins
const cors = require('cors');
//cross site scripting
const xss = require('xss-clean');
//rate limiting
const rateLimiter = require('express-rate-limit');

const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const authMiddleware = require('./middleware/authentication');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(
  rateLimiter.limiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: 'Too many requests from this IP, please try again later',
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', authMiddleware, jobsRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();

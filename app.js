const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. GLOBAL MIDDLEWARES- stand in between req and res (can modify incoming request data)

// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); // to open static files like html, images, etc.

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://unpkg.com',
          'https://cdnjs.cloudflare.com', // ✅ Allow Axios from CDN
          'https://js.stripe.com', // ✅ Allow Stripe JS
        ],
        styleSrc: [
          "'self'",
          'https://unpkg.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'", // Needed for Leaflet's dynamic styling
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://*.basemaps.cartocdn.com',
          'https://*.cartocdn.com',
        ], // Allow CARTO map tiles
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          'https://cdnjs.cloudflare.com', // ✅ Allow Axios network requests
          'https://js.stripe.com', // ✅ Allow Stripe network requests
          'ws://127.0.0.1:50056', // ✅ Allow WebSocket connections
        ],
        frameSrc: [
          "'self'",
          'https://js.stripe.com', // ✅ Allow embedding Stripe checkout
        ],
      },
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger middleware
}

// Limit requests from same API
const limiter = rateLimit({
  // if app crashes during requests, the remaining limit is reset
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection (email: {"$gt": ""})
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting)
app.use(xss());

// Prevent parameter pollution (eg. multiple sort fields)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Compress text sent to clients (not images)
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next(); // if not called then req-res cycle would be stuck, we won't be able to send back a response to the client
});

// 3. ROUTES
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter); // mounting the router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

  //   res.status(404).json({
  //     status: 'fail',
  //     message: `can't find ${req.originalUrl} on this server!`,
  //   });

  //   const err = new Error(`can't find ${req.originalUrl} on this server!`);
  //   err.status = 'fail';
  //   err.statusCode = 404;

  //   next(err);
  // if next function receives an arg then express automatically knows it's an error then skip all the other middlewares to the global error handling middleware
});

app.use(globalErrorHandler); // global error handling middleware

module.exports = app;

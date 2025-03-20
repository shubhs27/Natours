process.noDeprecation = true;

const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});
// console.log(x);

dotenv.config({ path: './config.env' }); // reading of variables only needs to happen once, then its in the process and process in same in all files
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    // useFindandModify: false,
    useUnifiedTopology: true, // for mongodb driver warning
    // returns a promise
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB Connection Successful!');
  });

// by default express sets env to development
// console.log(app.get('env'));

// NODE ENVIRONMENT VARIABLES- for config that might change based on the environment app is running in
// Eg. for dif dbs (dev,testing), set sensitive data(username, passwords)
// set manually- NODE_ENV=development nodemon server.js (after deploying change to production)
// console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // give server time to finish all the pending requests
  server.close(() => {
    process.exit(1); // 1: uncaught exception, 0: success
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

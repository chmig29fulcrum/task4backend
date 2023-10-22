const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const nodeEnv = process.env.NODE_ENV.trim();
const portVar = `PORT_${nodeEnv.toUpperCase()}`;
const dbVar = `DATABASE_${nodeEnv.toUpperCase()}`;
console.log(portVar);
console.log(process.env[portVar]);
const port = process.env[portVar] || 4001;

const app = require('./app');

const DB = process.env[dbVar];

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

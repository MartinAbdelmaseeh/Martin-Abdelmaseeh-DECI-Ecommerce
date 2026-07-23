const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.set('bufferCommands', false);

let connectionPromise = null;

function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return Promise.reject(new Error('MONGO_URI is not set. Add it to your .env file.'));
  }

  connectionPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('✅ Connected to MongoDB');
      return mongoose.connection;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

async function disconnectMongo() {
  connectionPromise = null;
  await mongoose.disconnect();
}

module.exports = { connectMongo, disconnectMongo, mongoose };
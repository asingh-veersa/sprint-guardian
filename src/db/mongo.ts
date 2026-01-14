import mongoose, { mongo } from "mongoose";
import env from "../config/env";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectMongo = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(env.mongo.uri!, {
    dbName: env.mongo.dbName,
  });

  connectionPromise.catch((err) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
};

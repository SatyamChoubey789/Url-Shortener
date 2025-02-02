import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Combine the base URI and the DB name correctly
    const connectionURI = `${process.env.MONGO_URI}/${DB_NAME}`;
    const connectionInstance = await mongoose.connect(connectionURI);

    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;

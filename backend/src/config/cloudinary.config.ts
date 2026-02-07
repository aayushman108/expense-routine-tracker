import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../constants";

cloudinary.config({
  cloud_name: ENV.CLOUD_NAME,
  api_key: ENV.CLOUD_API_KEY,
  api_secret: ENV.CLOUD_SECRET_KEY,
});

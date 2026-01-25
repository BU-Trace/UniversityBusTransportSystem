import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, unique: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    time: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { strict: true }
);

//  Model name change 
export const LocationModel =
  mongoose.models.LiveLocation ||
  mongoose.model("LiveLocation", locationSchema, "livelocations");

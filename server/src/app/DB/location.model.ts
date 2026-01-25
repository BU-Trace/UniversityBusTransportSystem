import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  busId: { type: String, unique: true },
  lat: Number,
  lng: Number,
  time: String,
  updatedAt: { type: Date, default: Date.now }
});

export const LocationModel =
  mongoose.models.Location ||
  mongoose.model("Location", locationSchema, "livelocations"); 
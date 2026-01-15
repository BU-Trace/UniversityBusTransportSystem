import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busId: String,
  lat: Number,
  lng: Number,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);

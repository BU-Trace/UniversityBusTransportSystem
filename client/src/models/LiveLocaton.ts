import mongoose from "mongoose";

const liveLocationSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.LiveLocation ||
  mongoose.model("LiveLocation", liveLocationSchema);

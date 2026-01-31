// import mongoose from "mongoose";

// const locationSchema = new mongoose.Schema({
//   busId: { type: String, required: true, unique: true },
//   routeId: { type: String, required: true },
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
//   time: { type: Date, required: true, index: true },
//   status: {
//     type: String,
//     enum: ["running", "paused", "stopped"],
//     default: "running"
//   }
// },
// { timestamps: true });

// // 10 seconds after `time`, document auto delete
// locationSchema.index({ time: 1 }, { expireAfterSeconds: 30 });

// export const LocationModel =
//   mongoose.models.LiveLocation ||
//   mongoose.model("LiveLocation", locationSchema, "livelocations");

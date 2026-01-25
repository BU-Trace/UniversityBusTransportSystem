import { Server } from "socket.io";
import { LocationModel } from "./app/DB/location.model";

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("sendLocation", async (data) => {
      try {
        console.log("📍 Received from client:", data);

        const saved = await LocationModel.findOneAndUpdate(
          { busId: data.busId },
          {
            busId: data.busId,
            lat: data.lat,
            lng: data.lng,
            time: data.time,
            updatedAt: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log("💾 Saved in MongoDB:", saved);

       
        io.emit("receiveLocation", saved); 
      } catch (err) {
        console.error("❌ MongoDB Save Error:", err);
      }
    });
  });
};
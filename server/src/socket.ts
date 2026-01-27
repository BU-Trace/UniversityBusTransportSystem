import { Server } from "socket.io";
import { LocationModel } from "./app/DB/location.model";

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
//loacation update handler
    socket.on("sendLocation", async (data) => {
      try {
        console.log("Received from client:", data);

        const saved = await LocationModel.findOneAndUpdate(
          { busId: data.busId },
          {
            busId: data.busId,
            lat: data.lat,
            lng: data.lng,
           
            time: new Date(),
            status:data.status||"running"
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log("Saved in MongoDB:", saved);

       
        io.emit("receiveLocation", saved); 
      } catch (err) {
        console.error("MongoDB Save Error:", err);
      }
    });
    //bus status update handler
    socket.on("busStatus", async (data) => {
      try {
        console.log("Status Update:", data);

        const updated = await LocationModel.findOneAndUpdate(
          { busId: data.busId },
          {
            status: data.status,
            time: new Date()
          },
          { new: true }
        );

        io.emit("receiveBusStatus", updated);
      } catch (err) {
        console.error("Status Update Error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
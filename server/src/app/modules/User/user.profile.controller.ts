import { RequestHandler } from "express";
import User from "./user.model";

type UserRole = "student" | "driver" | "admin" | "superadmin";

type UpdateMyProfileBody = {
  name: string;
  photoUrl: string;
};

type UpdateMyProfileResponse = {
  success: true;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    photoUrl: string | null;
  };
};

export const updateMyProfile: RequestHandler<{}, unknown, UpdateMyProfileBody> = async (req, res) => {
  try {
    const userId = req.user?.userId; 
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const photoUrl = typeof req.body?.photoUrl === "string" ? req.body.photoUrl.trim() : "";

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!photoUrl) {
      return res.status(400).json({ success: false, message: "Photo is required" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, profileImage: photoUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const payload: UpdateMyProfileResponse = {
      success: true,
      message: "Profile updated",
      data: {
        id: String(updated._id),
        name: updated.name,
        email: updated.email,
        role: updated.role as UserRole,
        photoUrl: updated.profileImage ?? null,
      },
    };

    return res.json(payload);
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

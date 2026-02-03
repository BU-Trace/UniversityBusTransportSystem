import { Request, Response, RequestHandler } from "express";
import { HydratedDocument } from "mongoose";
import User from "./user.model";
import { UpdateMyProfileBody, UpdateMyProfileResponse, UserRole } from "./user.profile.types";

type AuthPayload = {
  userId: string;                 
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  iat?: number;
  exp?: number;
};

type AuthedRequest = Request & { user?: AuthPayload };

type IUserDoc = {
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;          
};

export const updateMyProfile: RequestHandler = async (req, res) => {
  try {
    const r = req as AuthedRequest;

    const userId = r.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const body = r.body as Partial<UpdateMyProfileBody>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl.trim() : "";

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: "Photo URL is required" });
    }

    const updated: HydratedDocument<IUserDoc> | null = await User.findByIdAndUpdate(
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
        role: updated.role,
        photoUrl: updated.profileImage ?? null,
      },
    };

    return res.json(payload);
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

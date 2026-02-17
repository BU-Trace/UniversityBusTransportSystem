import { RequestHandler } from 'express';
import { UserServices } from './user.service';

type UserRole = 'driver' | 'admin' | 'superadmin';

export const updateMyProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role as UserRole;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await UserServices.updateProfile(userId, req.body, role);

    const payload = {
      success: true,
      message: 'Profile updated',
      data: {
        id: String(result._id),
        name: result.name,
        email: result.email,
        role: result.role as UserRole,
        photoUrl: result.profileImage ?? null,
        clientInfo: result.clientInfo,
      },
    };

    return res.json(payload);
  } catch (err: any) {
    console.error('updateMyProfile error:', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error',
    });
  }
};

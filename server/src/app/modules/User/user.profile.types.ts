export type UserRole = 'driver' | 'admin' | 'superadmin';

export type UpdateMyProfileBody = {
  name: string;
  photoUrl: string;
};

export type UpdateMyProfileResponse = {
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

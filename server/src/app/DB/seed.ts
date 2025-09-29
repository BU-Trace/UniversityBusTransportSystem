import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import config from '../config';
import { UserRole } from '../modules/User/user.utils';
import { IUser, UserModel } from '../modules/User/user.interface';

// --- Super Admin user data --------------------------------------
const superAdminUser = {
  email: 'mimam22.cse@bu.ac.bd',
  password: 'Superadmin_123',
  name: 'Md. Imam Hosen',
  role: UserRole.SUPERADMIN,
  clientITInfo: {
    device: 'pc',
    browser: 'Unknown',
    ipAddress: '127.0.0.1',
    pcName: 'localhost',
    os: 'Unknown',
    userAgent: 'Seed Script',
  },
};

const getUserModel = (): UserModel => {
  if (mongoose.models && mongoose.models.User) {
    return mongoose.models.User as UserModel;
  }

  // Minimal schema just for seeding
  const userSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      clientITInfo: {
        device: String,
        browser: String,
        ipAddress: String,
        pcName: String,
        os: String,
        userAgent: String,
      },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  return mongoose.model<IUser, UserModel>('User', userSchema);
};

// --- Seeder function --------------------------------------------
const seedAdmin = async () => {
  try {
    const User = getUserModel();

    // Check if SuperAdmin already exists
    const isAdminExist = await User.findOne({
      role: UserRole.SUPERADMIN,
      email: superAdminUser.email,
    }).exec();

    if (isAdminExist) {
      console.log('✅ SuperAdmin already exists.');
      return;
    }

    // Hash password
    const hashed = await bcrypt.hash(
      superAdminUser.password,
      Number(config.bcrypt_salt_rounds) || 10
    );

    // Create SuperAdmin
    await User.create({
      ...superAdminUser,
      password: hashed,
      isActive: true,
    });

    console.log('🎉 SuperAdmin created successfully.');
  } catch (error) {
    console.error('❌ Error seeding SuperAdmin user:', error);
  }
};

export default seedAdmin;

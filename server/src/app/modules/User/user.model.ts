import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import { IUser, USER_ROLES, UserModel } from './user.interface';
import AppError from '../../errors/appError';

// --- Schema ---------------------------------------------------
const userSchema = new Schema<IUser, UserModel>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },

    clientITInfo: {
      device: { type: String, enum: ['pc', 'mobile', 'tablet'], default: 'pc' },
      browser: { type: String , default: null},
      ipAddress: { type: String, default: null },
      pcName: { type: String, default: null },
      os: { type: String, default: null },
      userAgent: { type: String, default: null },
    },

    clientInfo: {
      bio: { type: String, default: null },
      department: { type: String , default: null},
      rollNumber: { type: String, default: null },
      licenseNumber: { type: String, default: null },
    },

    lastLogin: { type: Date },
    isActive: { type: Boolean, default: false },

    otpToken: { type: String, default: null },
    otpExpires: { type: Date, default: null },

    needPasswordChange: { type: Boolean, default: false },
    resetPasswordExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },

    profileImage: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// --- Pre-save hook (hash password) -----------------------------
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
  }

  next();
});

// --- Post-save hook (remove password from response) ------------
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// --- Transform toJSON (hide password) --------------------------
// userSchema.set('toJSON', {
//   transform: (_doc, ret: any) => {
//     delete ret.password;
//     return ret;
//   },
// });

// --- Statics ---------------------------------------------------
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  console.log(plainTextPassword, hashedPassword);
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

userSchema.statics.checkUserExist = async function (userId: string) {
  const existingUser = await this.findById(userId);

  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'User does not exist!');
  }

  if (!existingUser.isActive) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'User is not active!');
  }

  return existingUser;
};

// --- Model -----------------------------------------------------
const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User;

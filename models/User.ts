import mongoose, { Schema } from 'mongoose'

export interface IUser {
  clerkId: string
  email?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

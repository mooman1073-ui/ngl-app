import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: ["local", "Google", "Facebook"],
      default: "local"
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    dob: Date,
    gender: {
      type: String,
      enum: ["Male", "Female"]
    }
  },
  {
    timestamps: true
  }
);

export const User = model("User", userSchema);

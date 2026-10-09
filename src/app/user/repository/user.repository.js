import { User } from "../model/user.model.js";

export function findProfileById(userId) {
  return User.findOne({ _id: userId, isDeleted: false })
    .select("name email provider isVerified dob gender createdAt updatedAt")
    .lean();
}

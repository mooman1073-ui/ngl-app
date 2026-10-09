import { findProfileById } from "../repository/user.repository.js";
import { AppError } from "../../../common/error/app-error.js";

export async function getProfile(userId) {
  const user = await findProfileById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

import * as userService from "../service/user.service.js";

export async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.userId);

    return res.status(200).json({
      message: "Profile retrieved successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
}

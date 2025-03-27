import { config } from "../config/app.config";
import prisma from "../prisma";

class UserService {
  public async findUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      image: `${config.BACKEND_BASE_URL}/uploads/user/${user.image}`,
      valid_until: user.valid_until,
      created_at: user.created_at,
    };
  }
}

const userService = new UserService();
export default userService;

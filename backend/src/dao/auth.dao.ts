import { db } from "../database/db";

interface IRegisterUser {
  username: string;
  email: string;
  hashedPassword: string;
}
class AuthDao {
  async findByEmail(email: string): Promise<any> {
    const user = await db("users").where({ email }).first();
    return user;
  }

  async findById(userId: string): Promise<any> {
    const user = await db("users").where({ id: userId }).first();
    return user;
  }

  async createUser(user: IRegisterUser) {
    const { username, email, hashedPassword } = user;

    const [newUser] = await db("users")
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        is_verified: true,
      })
      .returning("*");
    return newUser;
  }

  async verifyUser(email: string) {
    await db("users").where({ email }).update({
      is_verified: true,
      updated_at: db.fn.now(),
    });

    return true;
  }

  async updateProfile(
    userId: string,
    updates: {
      username?: string;
      email?: string;
      avatar?: { url: string; public_id: string };
    }
  ) {
    const [updatedUser] = await db("users")
      .where({ id: userId })
      .update(updates, ["id", "username", "email", "avatar"]);

    return updatedUser;
  }
}

export const authDao = new AuthDao();

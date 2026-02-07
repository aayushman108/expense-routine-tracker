import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;

  constructor() {
    this.accessSecret = process.env.ACCESS_TOKEN_SECRET as Secret;
    this.refreshSecret = process.env.REFRESH_TOKEN_SECRET as Secret;
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY + "m" || "15m",
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY + "d" || "15d",
    });
  }

  verifyAccessToken(token: string): object | string {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): object | string {
    return jwt.verify(token, this.refreshSecret);
  }
}

export const jwtService = new JwtService();

export {};

declare global {
  namespace Auth {
    interface IUser {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      password_hash: string;
      avatar: { url: string; publicId: string } | null;
      created_at: Date;
      updated_at: Date;
    }
  }
}

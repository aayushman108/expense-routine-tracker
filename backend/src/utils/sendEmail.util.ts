import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
dotenv.config();

interface IMailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_AUTH_USER,
    pass: process.env.SMTP_AUTH_PASS,
  },
});

export async function sendMail(options: IMailOptions) {
  const templatePath = path.join(__dirname, "..", "emails", options.template);
  const html = await ejs.renderFile(templatePath, options.data);

  const mailOptions = {
    from: process.env.SMTP_AUTH_USER,
    to: options.email,
    subject: options.subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
}

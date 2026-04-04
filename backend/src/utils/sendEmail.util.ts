import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import fs from "fs";
import juice from "juice";
import dotenv from "dotenv";
dotenv.config();

interface IMailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(options: IMailOptions) {
  const templatePath = path.join(__dirname, "..", "emails", options.template);
  const cssPath = path.join(__dirname, "..", "emails", "style.css");

  console.log(templatePath, cssPath, "one");
  

  const html = await ejs.renderFile(templatePath, options.data);
  const css = fs.readFileSync(cssPath, "utf8");

  console.log(html, css, "two")

  const inlinedHtml = juice.inlineContent(html, css);

  console.log(inlinedHtml, "three")

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: options.email,
    subject: options.subject,
    html: inlinedHtml,
  };

  console.log(mailOptions, "four")

  return await transporter.sendMail(mailOptions);
}

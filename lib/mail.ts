import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST ?? "localhost",
  port: Number(process.env.MAIL_PORT ?? 1027),
  secure: false,
});

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await transporter.sendMail({
    from: '"Web Documents" <noreply@webdocuments.local>',
    to,
    subject,
    html,
  });
}

import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
  debug: true,
  socketTimeout: 20000, // Time before it stops trying to send
  connectionTimeout: 15000, // Time before it stops trying to connect
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendEmails = async (recipients, subject, text, html) => {
  const results = await Promise.all(
    recipients.map(async (email) => {
      try {
        await sendEmail({ to: email, subject, text, html });
        return { email, status: 'sent' };
      } catch (error) {
        console.error(`Error sending to ${email}:`, error);
        return { email, status: 'failed' };
      }
    })
  );
  return results;
};

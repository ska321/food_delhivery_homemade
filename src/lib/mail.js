import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASS,
    },
  });

  await transporter.sendMail({
    from: `"OurFoodie" <${process.env.EMAIL_SERVER_USER}>`,
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
    html: `<p>Your OTP code is <b>${otp}</b></p>`,
  });
};

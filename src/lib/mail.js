import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_SERVER_USER;
const emailPass = process.env.EMAIL_SERVER_PASS;

if (!emailUser || !emailPass) {
  throw new Error(
    "Missing EMAIL_SERVER_USER or EMAIL_SERVER_PASS in .env.local"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendEmail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"OurFoodie" <${emailUser}>`,
      to,
      subject: "Your OurFoodie OTP Code",

      text: `Your OurFoodie verification code is ${otp}. This OTP is valid for a limited time.`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
        ">
          <h2 style="
            color: #f97316;
            margin-bottom: 10px;
          ">
            OurFoodie
          </h2>

          <p style="
            color: #374151;
            font-size: 16px;
          ">
            Your verification code is:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #111827;
            padding: 15px 0;
          ">
            ${otp}
          </div>

          <p style="
            color: #6b7280;
            font-size: 14px;
          ">
            Please do not share this OTP with anyone.
          </p>

          <p style="
            color: #9ca3af;
            font-size: 12px;
            margin-top: 25px;
          ">
            This is an automated email from OurFoodie.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    throw new Error("Failed to send OTP email");
  }
};
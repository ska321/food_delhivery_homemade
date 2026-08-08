import connectDB from "@/lib/db";
import Otp from "@/models/Otp";
import { sendEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // Generate 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP in MongoDB
    await Otp.create({
      email: email.toLowerCase().trim(),
      code,
    });

    // Send OTP email
    await sendEmail(email, code);

    console.log(`✅ OTP sent to ${email}`);

    return Response.json(
      {
        success: true,
        message: "OTP sent successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Send OTP error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to send OTP",
      },
      {
        status: 500,
      }
    );
  }
}
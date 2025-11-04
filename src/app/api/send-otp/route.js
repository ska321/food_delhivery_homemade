import connectDB  from "@/lib/db";
import Otp from "@/models/Otp";
import { sendEmail } from "@/lib/mail";

export async function POST(req) {
  const { email } = await req.json();
  await connectDB();

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  await Otp.create({ email, code });
  await sendEmail(email, code);

  return Response.json({ success: true });
}

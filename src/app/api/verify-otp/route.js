import  connectDB  from "@/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";

export async function POST(req) {
  const { email, otp } = await req.json();
  await connectDB();

  const valid = await Otp.findOne({ email, code: otp });
  if (!valid) return Response.json({ success: false, message: "Invalid OTP" });

  const user = await User.findOne({ email });
  await Otp.deleteMany({ email }); // delete OTP after verification

  if (user) {
    return Response.json({ success: true, isNew: false });
  } else {
    return Response.json({ success: true, isNew: true });
  }
}

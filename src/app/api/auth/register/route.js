import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";

export async function POST(req) {
  try {
    const data = await req.json();
    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email: data.email });

    if (user) {
      // Update existing user
      await User.updateOne({ email: data.email }, { $set: data });
      user = await User.findOne({ email: data.email }); // fetch updated user
    } else {
      // Create new user
      user = await User.create(data);
    }

    // Now automatically sign the user in (credentials provider)
    // NOTE: signIn() can only be used on client, so we’ll send flag to frontend
    // to trigger client-side signIn automatically.
    return NextResponse.json({
      success: true,
      message: user ? "User saved successfully" : "User created successfully",
      email: user.email,
      autoLogin: true, // frontend should use this to auto-login
    });
  } catch (error) {
    console.error("Error in /api/auth/register:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

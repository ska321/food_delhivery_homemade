import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * ✅ GET — Fetch user details by ID
 */
export async function GET(req, context) {
  try {
    await connectDB();

    // ✅ Await params before using
    const { id } = await context.params;

    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address || "",
      occupation: user.occupation || "",
      age: user.age || "",
      dp: user.dp || "/default-avatar.png",
      joinedAt: user.createdAt,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ PUT — Update user profile (name, address, occupation, age, dp)
 */
export async function PUT(req, context) {
  try {
    await connectDB();

    // ✅ Await params before using
    const { id } = await context.params;
    const updates = await req.json();

    // Define which fields can be updated
    const allowedFields = ["name", "address", "occupation", "age", "dp"];
    const updateData = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined && updates[key] !== null) {
        updateData[key] = updates[key];
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address || "",
      occupation: updatedUser.occupation || "",
      age: updatedUser.age || "",
      dp: updatedUser.dp || "/default-avatar.png",
      joinedAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

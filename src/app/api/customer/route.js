import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

// ✅ GET: Fetch customer details + all saved addresses
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 🔍 Find customer
    let customer = await Customer.findOne({ userId });

    // 🆕 If not found, create a blank profile
    if (!customer) {
      customer = await Customer.create({
        userId,
        name: "",
        email: "",
        phone: "",
        addresses: [],
      });
    }

    return NextResponse.json({
      success: true,
      userId: customer.userId,
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      addresses: customer.addresses || [],
    });
  } catch (error) {
    console.error("GET /api/customer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: Save or update customer info + address
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, email, phone, address } = body;

    if (!userId || !phone) {
      return NextResponse.json(
        { error: "User ID and phone are required" },
        { status: 400 }
      );
    }

    // 🔍 Check existing record
    let customer = await Customer.findOne({ userId });

    if (customer) {
      // 🧾 Update existing
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.phone = phone || customer.phone;

      // 📦 Add address if new
      if (address && !customer.addresses.includes(address)) {
        customer.addresses.push(address);
      }

      await customer.save();
    } else {
      // 🆕 Create new record
      customer = await Customer.create({
        userId,
        name,
        email,
        phone,
        addresses: address ? [address] : [],
      });
    }

    // ✅ Return updated data
    return NextResponse.json({
      success: true,
      message: "Customer details saved successfully",
      customer: {
        userId: customer.userId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
      },
    });
  } catch (error) {
    console.error("POST /api/customer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import connectDB from "@/lib/db";
import Order from "@/models/Order";
import nodemailer from "nodemailer";

// ✅ GET — fetch orders by user ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const orders = await Order.find({ userId: id }).sort({ _id: -1 });

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ✅ PUT — update order status + send email notification
export async function PUT(req, { params }) {
  try {
    const { id } = params; // order ID
    const { status } = await req.json();

    if (!status) {
      return new Response(
        JSON.stringify({ error: "Status is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectDB();

    // 🔍 Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Get customer email from order (direct field)
    const customerEmail = updatedOrder.email;
    if (!customerEmail) {
      console.warn(`⚠️ No email found for order ID: ${id}`);
      return new Response(JSON.stringify(updatedOrder), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 📬 Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    // 📨 Define email content
    const mailOptions = {
      from: `"Tasty Bite 🍕" <${process.env.EMAIL_SERVER_USER}>`,
      to: customerEmail,
      subject: `Your Order #${id} Status Update`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #fff8f2; border-radius: 8px; border: 1px solid #eee;">
          <h2 style="color: #e63946;">🍕 Pizza Hub - Order Update</h2>
          <p style="font-size: 16px;">Hi there,</p>
          <p>Your order <b>#${id}</b> status has been updated to:</p>
          <p style="font-size: 18px; font-weight: bold; color: #0070f3;">${status}</p>
          <p style="margin-top: 10px;">Thank you for choosing <b>Pizza Hub</b>! We hope you enjoy your meal 🍽️</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: gray;">If you did not place this order, please ignore this email.</p>
        </div>
      `,
    };

    // 🚀 Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status email sent to ${customerEmail} for Order ID: ${id}`);

    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error updating order or sending email:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

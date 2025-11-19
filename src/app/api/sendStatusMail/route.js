import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { to, status, orderId } = await req.json();

    // 🧩 Validate required fields
    if (!to || !status || !orderId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, status, or orderId",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🧠 Sanitize recipient email
    const recipient = to.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 📬 Create nodemailer transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    // 📨 Email content
    const mailOptions = {
      from: `"OurFoodie 🍕" <${process.env.EMAIL_SERVER_USER}>`,
      to: recipient,
      subject: `Your Order #${orderId} Status Update`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #fff8f2; border-radius: 8px; border: 1px solid #eee;">
          <h2 style="color: #e63946;">🍕 Pizza Hub - Order Update</h2>
          <p style="font-size: 16px;">Hi there,</p>
          <p>Your order <b>#${orderId}</b> status has been updated to:</p>
          <p style="font-size: 18px; font-weight: bold; color: #0070f3;">${status}</p>
          <p style="margin-top: 10px;">Thank you for choosing <b>Pizza Hub</b>! We hope you enjoy your meal 🍽️</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: gray;">If you did not place this order, please ignore this email.</p>
        </div>
      `,
    };

    // 🚀 Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${recipient}:`, info.response);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Error sending email:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        details: err.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const {
      adminEmail,
      customerEmail,
      customerName,
      orderId,
      totalAmount,
      items,
    } = await req.json();

    // Setup SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    const itemList = items
      .map((i) => `<li>${i.name} - ₹${i.price}</li>`)
      .join("");

    // Mail to Customer
    const customerMail = {
      from: `"TastyBite" <${process.env.EMAIL_SERVER_USER}>`,
      to: customerEmail,
      subject: "🎉 Your TastyBite Order Confirmation!",
      html: `
        <h2>Hi ${customerName},</h2>
        <p>Thank you for ordering from <b>TastyBite</b>!</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <p><b>Order Total:</b> ₹${totalAmount}</p>
        <p><b>Items:</b></p>
        <ul>${itemList}</ul>
        <p>We'll deliver your order soon 🚀</p>
        <br><p>— The TastyBite Team 🍕</p>
      `,
    };

    // Mail to Admin
    const adminMail = {
      from: `"TastyBite Orders" <${process.env.EMAIL_SERVER_USER}>`,
      to: adminEmail,
      subject: `📦 New Order Received - ${customerName}`,
      html: `
        <h2>New Order Received!</h2>
        <p><b>Customer:</b> ${customerName}</p>
        <p><b>Email:</b> ${customerEmail}</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <p><b>Total:</b> ₹${totalAmount}</p>
        <p><b>Items:</b></p>
        <ul>${itemList}</ul>
      `,
    };

    await Promise.all([
      transporter.sendMail(customerMail),
      transporter.sendMail(adminMail),
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return Response.json({ error: "Failed to send emails" }, { status: 500 });
  }
}

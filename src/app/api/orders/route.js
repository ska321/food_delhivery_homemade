import connectDB from "@/lib/db";
import Order from "@/models/Order";

// ✅ GET: Fetch all orders or filter by userId
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  let orders;
  if (userId) {
    orders = await Order.find({ userId }); // filter by logged-in user
  } else {
    orders = await Order.find(); // all orders (admin use)
  }

  return Response.json(orders);
}

// ✅ POST: Create a new order with validation
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    // 🧩 Validation checks
    if (!body.userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!body.email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    // ✅ Create new order if valid
    const newOrder = await Order.create(body);

    return Response.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

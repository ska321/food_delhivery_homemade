import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await connectDB();

    const customers = await Customer.find().lean();

    return Response.json({ success: true, customers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return Response.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

import connectDB from "@/lib/db";
import Menu from "@/models/Menu";

export async function GET() {
  await connectDB();
  const items = await Menu.find();
  return Response.json(items);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const newItem = await Menu.create(body);
  return Response.json(newItem);
}

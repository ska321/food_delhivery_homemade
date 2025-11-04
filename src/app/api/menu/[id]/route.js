import connectDB from "@/lib/db";
import Menu from "@/models/Menu";

// ✅ PUT — Update menu item
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const body = await req.json();

    const updated = await Menu.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return Response.json({ error: "Menu item not found" }, { status: 404 });
    }

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating menu:", error);
    return Response.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

// ✅ GET — Get one menu item by ID (optional)
export async function GET(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const item = await Menu.findById(id);

    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(item, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

// ✅ DELETE — Delete menu item (optional)
export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const deleted = await Menu.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return Response.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

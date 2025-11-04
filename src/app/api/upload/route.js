import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// ✅ Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * ✅ POST — Upload image to Cloudinary securely
 * Expects JSON body: { dataUrl: "<base64 encoded image>" }
 */
export async function POST(req) {
  try {
    const { dataUrl } = await req.json();

    if (!dataUrl) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary inside "pizza-cake" folder
    const uploaded = await cloudinary.uploader.upload(dataUrl, {
      folder: "pizza-cake",
    });

    return NextResponse.json({ url: uploaded.secure_url });
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

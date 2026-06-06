const cloudinary = require("cloudinary").v2;
const { getDatabase } = require("../lib/mongodb");
require("dotenv").config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

async function uploadPost(request, response) {
  const { image, caption, authorEmail } = request.body || {};

  if (!image) {
    return response.status(400).json({ error: "Image is required." });
  }

  if (!caption) {
    return response.status(400).json({ error: "Caption is required." });
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "dashboard_posts"
    });

    const database = await getDatabase();
    const post = {
      imageUrl: uploadResult.secure_url,
      caption: caption,
      authorEmail: authorEmail || null,
      createdAt: new Date()
    };

    const result = await database.collection("posts").insertOne(post);

    response.json({
      id: result.insertedId.toString(),
      url: uploadResult.secure_url,
      caption: caption,
      authorEmail: authorEmail || null,
      createdAt: post.createdAt
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    response.status(500).json({ error: "Image upload failed." });
  }
}

module.exports = uploadPost;

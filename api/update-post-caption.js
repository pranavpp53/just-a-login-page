const { getDatabase } = require("../lib/mongodb");
const { ObjectId } = require("mongodb");

function sendJson(response, data, statusCode = 200) {
  if (typeof response.json === "function") {
    if (typeof response.status === "function") {
      response.status(statusCode);
    }
    response.json(data);
    return;
  }

  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(data));
}

async function updatePostCaption(request, response) {
  try {
    const { id, caption, adminEmail } = request.body || {};

    if (adminEmail !== "admin@gmail.com") {
      return sendJson(response, { error: "Unauthorized." }, 401);
    }

    if (!id || typeof caption !== "string") {
      return sendJson(response, { error: "Post id and caption are required." }, 400);
    }

    const database = await getDatabase();
    const result = await database
      .collection("posts")
      .updateOne({ _id: new ObjectId(id) }, { $set: { caption: caption.trim() } });

    if (!result.matchedCount) {
      return sendJson(response, { error: "Post not found." }, 404);
    }

    sendJson(response, { success: true });
  } catch (error) {
    console.error("Error updating post caption:", error);
    sendJson(response, { error: "Could not update caption." }, 500);
  }
}

module.exports = updatePostCaption;

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

async function deletePost(request, response) {
  try {
    const { id, adminEmail } = request.body || {};

    if (adminEmail !== "admin@gmail.com") {
      return sendJson(response, { error: "Unauthorized." }, 401);
    }

    if (!id) {
      return sendJson(response, { error: "Post id is required." }, 400);
    }

    const database = await getDatabase();
    const result = await database
      .collection("posts")
      .deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      return sendJson(response, { error: "Post not found." }, 404);
    }

    sendJson(response, { success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    sendJson(response, { error: "Could not delete post." }, 500);
  }
}

module.exports = deletePost;

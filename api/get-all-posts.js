const { getDatabase } = require("../lib/mongodb");

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

async function getAllPosts(request, response) {
  try {
    const database = await getDatabase();
    const posts = await database
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    sendJson(response, {
      posts: posts.map(post => ({
        id: post._id.toString(),
        image: post.imageUrl,
        caption: post.caption,
        authorEmail: post.authorEmail,
        createdAt: post.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    sendJson(response, { error: "Could not load posts." }, 500);
  }
}

module.exports = getAllPosts;

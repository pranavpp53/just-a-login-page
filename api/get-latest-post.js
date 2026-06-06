const { getDatabase } = require("../lib/mongodb");

async function getLatestPost(request, response) {
  try {
    const database = await getDatabase();
    const post = await database
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!post) {
      return response.json({ post: null });
    }

    response.json({
      post: {
        id: post._id.toString(),
        image: post.imageUrl,
        caption: post.caption,
        authorEmail: post.authorEmail,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching latest post:", error);
    response.status(500).json({ error: "Could not load latest post." });
  }
}

module.exports = getLatestPost;

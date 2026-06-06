const { getDatabase } = require("../lib/mongodb");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ success: false });
    return;
  }

  const email = request.query && request.query.email;

  if (!email) {
    response.status(400).json({ success: false });
    return;
  }

  try {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      response.status(404).json({ success: false, exists: false });
      return;
    }

    response.status(200).json({
      success: true,
      exists: true,
      blocked: Boolean(user.blocked)
    });
  } catch (error) {
    console.error("User status API error:", error);
    response.status(500).json({ success: false });
  }
};

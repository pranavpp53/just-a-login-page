const { getDatabase } = require("../lib/mongodb");
const { requireAdmin } = require("../lib/admin");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ success: false });
    return;
  }

  const adminEmail = request.query && request.query.adminEmail;

  if (!requireAdmin(adminEmail, response)) {
    return;
  }

  try {
    const db = await getDatabase();
    const users = await db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    response.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        password: user.password,
        blocked: Boolean(user.blocked),
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error("Users API error:", error);
    response.status(500).json({ success: false });
  }
};

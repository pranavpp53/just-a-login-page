const { ObjectId } = require("mongodb");
const { getDatabase } = require("../lib/mongodb");
const { getRequestBody } = require("../lib/request-body");
const { isAdminEmail, requireAdmin } = require("../lib/admin");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ success: false });
    return;
  }

  try {
    const body = getRequestBody(request);

    if (!requireAdmin(body.adminEmail, response)) {
      return;
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(body.id) });

    if (!user || isAdminEmail(user.email)) {
      response.status(400).json({ success: false });
      return;
    }

    await db.collection("users").deleteOne({ _id: new ObjectId(body.id) });
    response.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete user API error:", error);
    response.status(500).json({ success: false });
  }
};

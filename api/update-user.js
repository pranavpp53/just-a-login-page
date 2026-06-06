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

    if (!body.id || !body.email || !body.username || !body.password) {
      response.status(400).json({ success: false });
      return;
    }

    const db = await getDatabase();

    await db.collection("users").updateOne(
      { _id: new ObjectId(body.id) },
      {
        $set: {
          email: body.email,
          username: body.username,
          password: body.password,
          blocked: isAdminEmail(body.email) ? false : Boolean(body.blocked),
          updatedAt: new Date()
        }
      }
    );

    response.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 11000) {
      response.status(409).json({ success: false });
      return;
    }

    console.error("Update user API error:", error);
    response.status(500).json({ success: false });
  }
};

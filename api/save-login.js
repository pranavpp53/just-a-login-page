const { getDatabase } = require("../lib/mongodb");
const { getRequestBody } = require("../lib/request-body");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ success: false });
    return;
  }

  try {
    const db = await getDatabase();
    const users = db.collection("users");
    const logins = db.collection("logins");
    const loginData = getRequestBody(request);

    if (!loginData.email || !loginData.password) {
      response.status(400).json({ success: false });
      return;
    }

    const user = await users.findOne({
      email: loginData.email,
      password: loginData.password
    });

    if (!user) {
      response.status(401).json({ success: false });
      return;
    }

    await logins.insertOne({
      email: loginData.email,
      remember: Boolean(loginData.remember),
      createdAt: new Date()
    });

    response.status(200).json({ success: true });
  } catch (error) {
    console.error("Login API error:", error);
    response.status(500).json({ success: false });
  }
};

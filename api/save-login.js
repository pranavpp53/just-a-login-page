const { getDatabase } = require("../lib/mongodb");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ success: false });
    return;
  }

  try {
    const db = await getDatabase();
    const users = db.collection("users");
    const logins = db.collection("logins");
    const loginData = request.body;

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
    response.status(500).json({ success: false });
  }
};

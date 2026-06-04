const { getDatabase } = require("../lib/mongodb");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ success: false });
    return;
  }

  try {
    const db = await getDatabase();
    const users = db.collection("users");
    const signupData = request.body;

    await users.insertOne({
      email: signupData.email,
      username: signupData.username,
      password: signupData.password,
      createdAt: new Date()
    });

    response.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 11000) {
      response.status(409).json({ success: false });
      return;
    }

    response.status(500).json({ success: false });
  }
};

const http = require("http");
const fs = require("fs");
const path = require("path");
const { getDatabase } = require("./lib/mongodb");

const PORT = process.env.PORT || 3000;

function sendResponse(response, statusCode, contentType, content) {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(content);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", chunk => {
      body += chunk.toString();
    });

    request.on("end", () => {
      resolve(body);
    });

    request.on("error", reject);
  });
}

function serveHtml(response, fileName) {
  const htmlFile = path.join(__dirname, fileName);
  const html = fs.readFileSync(htmlFile, "utf8");
  sendResponse(response, 200, "text/html", html);
}

async function saveSignup(signupData) {
  const db = await getDatabase();
  const users = db.collection("users");

  await users.insertOne({
    email: signupData.email,
    username: signupData.username,
    password: signupData.password,
    createdAt: new Date()
  });
}

async function saveLogin(loginData) {
  const db = await getDatabase();
  const logins = db.collection("logins");

  await logins.insertOne({
    email: loginData.email,
    remember: Boolean(loginData.remember),
    createdAt: new Date()
  });
}

async function isValidLogin(loginData) {
  const db = await getDatabase();
  const users = db.collection("users");

  const user = await users.findOne({
    email: loginData.email,
    password: loginData.password
  });

  return Boolean(user);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/") {
    serveHtml(response, "index.html");
    return;
  }

  if (request.method === "GET" && request.url === "/signup") {
    serveHtml(response, "signup.html");
    return;
  }

  if (request.method === "GET" && request.url === "/dashboard") {
    serveHtml(response, "dashboard.html");
    return;
  }

  if (
    request.method === "POST" &&
    (request.url === "/save-login" || request.url === "/api/save-login")
  ) {
    try {
      const body = await readRequestBody(request);
      const loginData = JSON.parse(body);

      if (!await isValidLogin(loginData)) {
        sendResponse(response, 401, "application/json", JSON.stringify({ success: false }));
        return;
      }

      await saveLogin(loginData);
      sendResponse(response, 200, "application/json", JSON.stringify({ success: true }));
    } catch (error) {
      sendResponse(response, 500, "application/json", JSON.stringify({ success: false }));
    }

    return;
  }

  if (
    request.method === "POST" &&
    (request.url === "/save-signup" || request.url === "/api/save-signup")
  ) {
    try {
      const body = await readRequestBody(request);
      const signupData = JSON.parse(body);

      await saveSignup(signupData);
      sendResponse(response, 200, "application/json", JSON.stringify({ success: true }));
    } catch (error) {
      if (error.code === 11000) {
        sendResponse(response, 409, "application/json", JSON.stringify({ success: false }));
        return;
      }

      sendResponse(response, 500, "application/json", JSON.stringify({ success: false }));
    }

    return;
  }

  sendResponse(response, 404, "text/plain", "Not found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

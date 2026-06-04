const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const dataFile = path.join(__dirname, "logins.json");
const signupFile = path.join(__dirname, "signups.json");

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

function saveLogin(loginData) {
  let logins = [];

  if (fs.existsSync(dataFile)) {
    const fileContent = fs.readFileSync(dataFile, "utf8");
    logins = fileContent ? JSON.parse(fileContent) : [];
  }

  logins.push({
    email: loginData.email,
    password: loginData.password,
    remember: Boolean(loginData.remember),
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(dataFile, JSON.stringify(logins, null, 2));
}

function readSignups() {
  if (!fs.existsSync(signupFile)) {
    return [];
  }

  const fileContent = fs.readFileSync(signupFile, "utf8");
  return fileContent ? JSON.parse(fileContent) : [];
}

function saveSignup(signupData) {
  const signups = readSignups();

  signups.push({
    email: signupData.email,
    username: signupData.username,
    password: signupData.password,
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(signupFile, JSON.stringify(signups, null, 2));
}

function isValidLogin(loginData) {
  const signups = readSignups();

  return signups.some(user =>
    user.email === loginData.email &&
    user.password === loginData.password
  );
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/") {
    const htmlFile = path.join(__dirname, "index.html");
    const html = fs.readFileSync(htmlFile, "utf8");
    sendResponse(response, 200, "text/html", html);
    return;
  }

  if (request.method === "GET" && request.url === "/signup") {
    const htmlFile = path.join(__dirname, "signup.html");
    const html = fs.readFileSync(htmlFile, "utf8");
    sendResponse(response, 200, "text/html", html);
    return;
  }

  if (request.method === "GET" && request.url === "/dashboard") {
    const htmlFile = path.join(__dirname, "dashboard.html");
    const html = fs.readFileSync(htmlFile, "utf8");
    sendResponse(response, 200, "text/html", html);
    return;
  }

  if (request.method === "POST" && request.url === "/save-login") {
    try {
      const body = await readRequestBody(request);
      const loginData = JSON.parse(body);

      if (!isValidLogin(loginData)) {
        sendResponse(response, 401, "application/json", JSON.stringify({ success: false }));
        return;
      }

      saveLogin(loginData);
      sendResponse(response, 200, "application/json", JSON.stringify({ success: true }));
    } catch (error) {
      sendResponse(response, 500, "application/json", JSON.stringify({ success: false }));
    }

    return;
  }

  if (request.method === "POST" && request.url === "/save-signup") {
    try {
      const body = await readRequestBody(request);
      const signupData = JSON.parse(body);

      saveSignup(signupData);
      sendResponse(response, 200, "application/json", JSON.stringify({ success: true }));
    } catch (error) {
      sendResponse(response, 500, "application/json", JSON.stringify({ success: false }));
    }

    return;
  }

  sendResponse(response, 404, "text/plain", "Not found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

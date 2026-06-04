const http = require("http");
const fs = require("fs");
const path = require("path");
const saveSignup = require("./api/save-signup");
const saveLogin = require("./api/save-login");

const PORT = process.env.PORT || 3000;

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", chunk => {
      body += chunk.toString();
    });

    request.on("end", () => {
      resolve(body ? JSON.parse(body) : {});
    });

    request.on("error", reject);
  });
}

function createApiResponse(response) {
  return {
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(data) {
      response.writeHead(response.statusCode || 200, {
        "Content-Type": "application/json"
      });
      response.end(JSON.stringify(data));
    }
  };
}

function sendHtml(response, fileName) {
  const htmlFile = path.join(__dirname, fileName);
  const html = fs.readFileSync(htmlFile, "utf8");

  response.writeHead(200, { "Content-Type": "text/html" });
  response.end(html);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/") {
    sendHtml(response, "index.html");
    return;
  }

  if (request.method === "GET" && request.url === "/signup") {
    sendHtml(response, "signup.html");
    return;
  }

  if (request.method === "GET" && request.url === "/dashboard") {
    sendHtml(response, "dashboard.html");
    return;
  }

  if (request.method === "POST" && request.url === "/api/save-signup") {
    request.body = await readRequestBody(request);
    await saveSignup(request, createApiResponse(response));
    return;
  }

  if (request.method === "POST" && request.url === "/api/save-login") {
    request.body = await readRequestBody(request);
    await saveLogin(request, createApiResponse(response));
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

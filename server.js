const http = require("http");
const fs = require("fs");
const path = require("path");
const saveSignup = require("./api/save-signup");
const saveLogin = require("./api/save-login");
const usersApi = require("./api/users");
const updateUser = require("./api/update-user");
const deleteUser = require("./api/delete-user");
const toggleBlock = require("./api/toggle-block");
const uploadPost = require("./api/upload-post");
const getLatestPost = require("./api/get-latest-post");

const PORT = process.env.PORT || 3000;

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", chunk => {
      body += chunk.toString();
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON payload."));
      }
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

function sendErrorResponse(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ error: message }));
}

function addQueryToRequest(request) {
  try {
    const url = new URL(request.url, "http://localhost");
    request.query = Object.fromEntries(url.searchParams.entries());
    return url.pathname;
  } catch (error) {
    console.error("Query parsing error:", error);
    throw new Error("Failed to parse request URL.");
  }
}

function sendHtml(response, fileName) {
  try {
    const htmlFile = path.join(__dirname, fileName);
    const html = fs.readFileSync(htmlFile, "utf8");

    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(html);
  } catch (error) {
    console.error("HTML send error:", error);
    throw new Error(`Could not load page: ${fileName}`);
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const pathname = addQueryToRequest(request);

    if (request.method === "GET" && pathname === "/") {
      sendHtml(response, "index.html");
      return;
    }

    if (request.method === "GET" && pathname === "/signup") {
      sendHtml(response, "signup.html");
      return;
    }

    if (request.method === "GET" && pathname === "/dashboard") {
      sendHtml(response, "dashboard.html");
      return;
    }

    if (request.method === "POST" && pathname === "/api/save-signup") {
      request.body = await readRequestBody(request);
      await saveSignup(request, createApiResponse(response));
      return;
    }

    if (request.method === "POST" && pathname === "/api/save-login") {
      request.body = await readRequestBody(request);
      await saveLogin(request, createApiResponse(response));
      return;
    }

    if (request.method === "POST" && pathname === "/api/upload-post") {
      request.body = await readRequestBody(request);
      await uploadPost(request, createApiResponse(response));
      return;
    }

    if (request.method === "GET" && pathname === "/api/posts/latest") {
      await getLatestPost(request, createApiResponse(response));
      return;
    }

    if (request.method === "GET" && pathname === "/api/users") {
      await usersApi(request, createApiResponse(response));
      return;
    }

    if (request.method === "POST" && pathname === "/api/update-user") {
      request.body = await readRequestBody(request);
      await updateUser(request, createApiResponse(response));
      return;
    }

    if (request.method === "POST" && pathname === "/api/delete-user") {
      request.body = await readRequestBody(request);
      await deleteUser(request, createApiResponse(response));
      return;
    }

    if (request.method === "POST" && pathname === "/api/toggle-block") {
      request.body = await readRequestBody(request);
      await toggleBlock(request, createApiResponse(response));
      return;
    }

    if (request.method === "GET" && (pathname.startsWith("/public/") || pathname === "/browser-image-compression.js")) {
      const assetPath = pathname.startsWith("/public/")
        ? path.join(__dirname, pathname)
        : path.join(__dirname, "public", pathname.slice(1));

      if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
        const ext = path.extname(assetPath).toLowerCase();
        const mimeTypes = {
          ".js": "application/javascript",
          ".css": "text/css",
          ".html": "text/html",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".map": "application/json"
        };

        response.writeHead(200, {
          "Content-Type": mimeTypes[ext] || "application/octet-stream"
        });
        response.end(fs.readFileSync(assetPath));
        return;
      }
    }

    if (pathname.startsWith("/api/")) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
  } catch (error) {
    console.error("Server error:", error);
    const statusCode = error.message === "Invalid JSON payload." ? 400 : 500;
    sendErrorResponse(response, statusCode, error.message || "Internal server error.");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

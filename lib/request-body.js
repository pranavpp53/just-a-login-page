function getRequestBody(request) {
  if (!request.body) {
    return {};
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      console.error("Request body parse error:", error);
      return {};
    }
  }

  return request.body;
}

module.exports = {
  getRequestBody
};

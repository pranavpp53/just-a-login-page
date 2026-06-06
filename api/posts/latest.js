const getLatestPost = require("../../api/get-latest-post");

module.exports = async function (req, res) {
  await getLatestPost(req, res);
};

function isAdminEmail(email) {
  return email === "admin@gmail.com";
}

function requireAdmin(email, response) {
  if (!isAdminEmail(email)) {
    response.status(403).json({ success: false });
    return false;
  }

  return true;
}

module.exports = {
  isAdminEmail,
  requireAdmin
};

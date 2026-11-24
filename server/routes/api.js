const express = require("express");
const pollController = require("../controllers/pollController");
const adminController = require("../controllers/adminController");

// Admin routes need the x-admin-key header to match ADMIN_API_KEY.
function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return res.status(503).json({ error: "Admin API is disabled (ADMIN_API_KEY not set)" });
  if (req.get("x-admin-key") !== expected) return res.status(401).json({ error: "Invalid admin key" });
  next();
}

module.exports = ({ readContract, adminContract }) => {
  const router = express.Router();
  const polls = pollController(readContract);
  const admin = adminController(adminContract);

  router.get("/polls", polls.listPolls);
  router.get("/polls/:id", polls.getPoll);
  router.get("/polls/:id/results", polls.getResults);
  router.get("/polls/:id/analysis", polls.getAnalysis);

  router.post("/admin/polls", requireAdminKey, admin.createPoll);
  router.post("/admin/polls/:id/end", requireAdminKey, admin.endPoll);

  return router;
};

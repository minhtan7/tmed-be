const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const router = express.Router();

/**
 * @route POST api/specialization
 * @description Create a specialization
 * @access Admin require
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  reviewController.addReview
);

module.exports = router;

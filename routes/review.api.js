const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const reviewController = require("../controllers/review.controller.js/review.controller");
const router = express.Router();

//
/**
 * @route GET api/review/user/:id
 * @description Get review from specific user
 * @access Public
 */
/* router.get("/user/:id", reviewController.getUserReview()); */

/**
 * @route POST api/review
 * @description Create a review
 * @access Patient require
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  authMiddleware.patientRequired,
  reviewController.addReview
);

module.exports = router;

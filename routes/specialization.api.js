const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const specializationController = require("../controllers/specialization.controller/specialization.controller");
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
  specializationController.addCategory
);

/**
 * @route GET api/specialization
 * @description Get all specialization
 * @access Public
 */
router.get("/", specializationController.getAllSpecialization);
module.exports = router;

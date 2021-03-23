const express = require("express");
const authController = require("../controllers/auth.controller/auth.controller");
const router = express.Router();

/**
 * @route POST api/users/
 * @description User can register account
 * @access Public
 */
router.post("/register", authController.register);

/**
 * @route POST api/auth/login
 * @description User can Login with email
 * @access Public
 */
router.post("/login", authController.login);

module.exports = router;

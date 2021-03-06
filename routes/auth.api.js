const express = require("express");
const authController = require("../controllers/auth.controller/auth.controller");
const router = express.Router();
const passport = require("passport");
const validators = require("../middlewares/validation");
const { body } = require("express-validator");

router.post("/register/admin", authController.registerAdmin);

/**
 * @route POST api/users/
 * @description User can register account
 * @access Public
 */
router.post(
  "/register",
  validators.validate([body("email").isEmail(), body("password").isLength(6)]),
  authController.register
);

/**
 * @route POST api/auth/login
 * @description User can Login with email
 * @access Public
 */
/* router.post("/login", authController.login); */

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.login
);

router.post(
  "/login/google",
  passport.authenticate("google-token", { session: false }),
  authController.login
);

router.post(
  "/login/facebook",
  passport.authenticate("facebook-token", { session: false }),
  authController.login
);

/**
 * @route POST api/auth/verify
 * @description User can verify email
 * @access Public
 */
router.post("/verify", authController.verifyEmail);

module.exports = router;

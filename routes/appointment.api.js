const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const appointmentController = require("../controllers/appointment.controller/appointment.controller");

/**
 * @route POST api/appointment/doctor/:id
 * @description Patient can request an appointment
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  appointmentController.requestAppoinment
);

/**
 * @route POST api/appointment/:id
 * @description Doctor can accepted an appointment
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  appointmentController.acceptedAppoinment
);

module.exports = router;

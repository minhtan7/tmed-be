const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const appointmentController = require("../controllers/appointment.controller/appointment.controller");

/**
 * @route POST api/appointment/doctor/:id
 * @description Patient can request an appointment, patient have to pay for reservation fee or full if they want.
 * @access Login required
 */
router.post(
  "/doctor/:id",
  authMiddleware.loginRequired,
  appointmentController.requestAppointment
);

/**
 * @route put api/appointment/:id/accepted
 * @description Doctor can accepted an appointment
 * @access Login required
 */
router.put(
  "/:id/accepted",
  authMiddleware.loginRequired,
  appointmentController.acceptedAppointment
);

/**
 * @route put api/appointment/:id/completed
 * @description System can mark appointment as completed automatically
 * @access Login required
 */
router.put(
  "/:id/completed",
  authMiddleware.loginRequired,
  appointmentController.completedAppointment
);

/**
 * @route POST api/appointment/:id/cancel
 * @description Doctor or patient can cancel an appointment the day before and the patient can get back the reservation fee
 * @access Login required
 */
router.post(
  "/:id/cancel",
  authMiddleware.loginRequired,
  appointmentController.cancelAppointment
);

/**
 * @route POST api/appointment/:id
 * @description User can get a single appointment
 */
router.get(
  "/:id",
  authMiddleware.loginRequired,
  appointmentController.getSingleAppointment
);

module.exports = router;

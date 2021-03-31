const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const appointmentController = require("../controllers/appointment.controller/appointment.controller");

/**
 * @route POST api/appointment/doctor/:id
 * @description Patient can request an appointment, patient have to pay for reservation fee or full if they want.
 * Doctor can requrest an appointment and that would be the day off
 * @access Login required
 */
router.put(
  "/",
  authMiddleware.loginRequired,
  authMiddleware.patientRequired,
  appointmentController.requestAppointment
);

/**
 * @route POST api/appointment/doctor/:id
 * @description Patient create an appointment with isPaid: false
 * Doctor can requrest an appointment and that would be the day off
 * @access Login required
 */
router.post(
  "/doctor/:id",
  authMiddleware.loginRequired,
  appointmentController.requestAppointmentIsPaidFalse
);

/**
 * @route put api/appointment/:id/accepted
 * @description Doctor can accepted an appointment
 * @access Login required
 */
router.put(
  "/:id/accepted",
  authMiddleware.loginRequired,
  authMiddleware.doctorRequired,
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
router.put(
  "/:id/cancel",
  authMiddleware.loginRequired,
  appointmentController.cancelAppointment
);

/**
 * @route GET api/appointment/:date/doctor/:id
 * @description Get appointments of the next 7 day of a doctor
 */
router.get("/:date/doctor/:id", appointmentController.getAppointmentsByDate);

/**
 * @route POST api/appointment/:id/payment
 * @description Doctor or patient can cancel an appointment the day before and the patient can get back the reservation fee
 * @access patient required
 */
/* router.put(
  "/:id/payment",
  authMiddleware.loginRequired,
  authMiddleware.patientRequired,
  appointmentController.payReservationFeeAppointment
);
 */
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

const express = require("express");
const authMiddleware = require("../middlewares/authentication");
const patientController = require("../controllers/patient.controller.js/patient.controller");

const router = express.Router();
//-------------------------- patient action
/**
 * @route GET api/patient/me
 * @description Return current patient info, populate all: ...
 * @access Login required
 */
router.get(
  "/me",
  authMiddleware.loginRequired,
  authMiddleware.patientRequired,
  patientController.getCurrentPatient
);

/**
 * @route PUT api/patient/me
 * @description patient an update their infomation
 * @access Login required
 */
router.put(
  "/me",
  authMiddleware.loginRequired,
  authMiddleware.patientRequired,
  patientController.updateCurrentPatient
);

//------------------------- Admin action

/**
 * @route GET api/patients
 * @description Get all patients
 * @access Admin
 */
/* router.get(
  "/",
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  patientController.getpatients
); */

/**
 * @route GET api/patients/:id
 * @description Admin get patient's order by id
 * @access Login require or Admin
 */
/* router.get(
  "/:id",
  authMiddleware.loginRequired,
  patientController.getCurrentpatientOrder
); */

/**
 * @route PUT api/patients/:id
 * @description Admin can update patient info
 * @access Admin
 */
/* router.put(
  "/:id",
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  patientController.updatepatient
); */

/**
 * @route DELETE api/patients/:id
 * @description Admin can delete patient
 * @access Admin
 */
/* router.delete(
  "/:id",
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  patientController.deletepatient
); */

//--------------------------------------
/**
 * @route Put api/patient/:id/payment
 * @description patient can make payment
 * @access Login required
 */
/* router.put(
  "/:id/payment",
  authMiddleware.loginRequired,
  patientController.paymentpatientOrder
); */

/**
 * @route PUT api/patient/:id/topup
 * @description Top-up patient balance
 * @access Admin requied
 */
/* router.put(
  "/:id/topup",
  authMiddleware.loginRequired,
  authMiddleware.adminRequired,
  patientController.topUppatient
); */

//------dont know if this is needed
/**
 * @route PUT api/patient/:id/order/:id
 * @description patient can get all the order of a patient
 * @access Admin requied
 */
/* router.put(
  "/:id/order/:id",
  authMiddleware.loginRequired,
  patientController.topUppatient
);
 */

module.exports = router;

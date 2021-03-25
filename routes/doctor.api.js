const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authentication");
const doctorController = require("../controllers/doctor.controller.js/doctor.controller");

//
/**
 * @route GET api/doctor?page=1&limit=10
 * @description Guess can see list of all doctors
 * @access Public
 */
router.get("/", doctorController.getAllDoctors);

/**
 * @route PUT api/doctor/me
 * @description Doctor can update their infomation
 * @access doctor
 */
router.put(
  "/me",
  authMiddleware.loginRequired,
  authMiddleware.doctorRequired,
  doctorController.updateDoctor
);

/**
 * @route GET api/doctor/me
 * @description Guess can get product by id
 * @access Login required
 */
router.get(
  "/me",
  authMiddleware.loginRequired,
  authMiddleware.doctorRequired,
  doctorController.getDoctorMe
);

/**
 * @route GET api/doctor/me
 * @description Guess can get product by id
 * @access Login required
 */
router.get(
  "/:id",
  authMiddleware.loginRequired,
  doctorController.getSingleDoctor
);

module.exports = router;

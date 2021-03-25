var express = require("express");
var router = express.Router();

// userApi
/* const userApi = require("./user.api");
router.use("/users", userApi); */

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// doctorApi
const doctorApi = require("./doctor.api");
router.use("/doctor", doctorApi);

// patientApi
const patientApi = require("./patient.api");
router.use("/patient", patientApi);

// reviewApi
const reviewApi = require("./review.api");
router.use("/review", reviewApi);

module.exports = router;

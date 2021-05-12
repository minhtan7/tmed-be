var express = require("express");
var router = express.Router();
var email = require("../helpers/email");

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

//specializationApi
const specializationApi = require("./specialization.api");
router.use("/specialization", specializationApi);

//appointmentAPI
const appointmentApi = require("./appointment.api");
router.use("/appointment", appointmentApi);

//send test email
router.get("/test-email", (req, res) => {
  email.sendTestEmail();
  res.send("email sent");
});

module.exports = router;

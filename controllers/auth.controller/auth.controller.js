const utilsHelper = require("../../helpers/utils.helper");
const Patient = require("../../models/Patient");
const bcrypt = require("bcryptjs");
const Doctor = require("../../models/Doctor");

const authController = {};
authController.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    console.log(email, password);
    let patient = await Patient.findOne({ email });
    let doctor = await Doctor.findOne({ email });
    console.log("p", patient);
    console.log("d", doctor);
    if (!patient && !doctor) return next(new Error("401 - User not exits"));
    if (patient) {
      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) return next(new Error("401 - Email or password is wrong"));

      const accessToken = await patient.generateToken();
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { patient, accessToken },
        null,
        "Login successfully"
      );
    } else {
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) return next(new Error("401 - Email or password is wrong"));

      const accessToken = await doctor.generateToken();
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { doctor, accessToken },
        null,
        "Login successfully"
      );
    }
  } catch (err) {
    next(err);
  }
};

authController.register = async (req, res, next) => {
  try {
    let { name, email, password, phone, role } = req.body;
    if (role === "patient") {
      let patient = await Patient.findOne({ email, phone });
      if (patient)
        return next(new Error("401 - Email or Phone number already exits"));

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      patient = await Patient.create({
        name,
        email,
        password,
        phone,
      });
      const accessToken = await patient.generateToken();
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { patient, accessToken },
        null,
        "Register successfully"
      );
    } else {
      let doctor = await Doctor.findOne({ email, phone });
      if (doctor)
        return next(new Error("401 - Email or Phone number already exits"));

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      doctor = await Doctor.create({
        name,
        email,
        password,
        phone,
      });
      const accessToken = await doctor.generateToken();
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { doctor, accessToken },
        null,
        "Register successfully"
      );
    }
  } catch (err) {
    next(err);
  }
};

module.exports = authController;

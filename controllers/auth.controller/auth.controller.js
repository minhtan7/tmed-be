const utilsHelper = require("../../helpers/utils.helper");
const Patient = require("../../models/Patient");
const bcrypt = require("bcryptjs");
const Doctor = require("../../models/Doctor");
const Admin = require("../../models/Admin");
const { emailInternalHelper } = require("../../helpers/email");

const authController = {};

authController.login = async ({ user }, res, next) => {
  try {
    if (user) {
      if (user.role === "patient") {
        const patient = await Patient.findByIdAndUpdate(
          user._id,
          { avatarUrl: user.avatarUrl },
          { new: true }
        );
        const accessToken = await patient.generateToken();
        utilsHelper.sendResponse(
          res,
          200,
          true,
          { patient, accessToken },
          null,
          "Login successfully"
        );
      } else if (user.role === "doctor") {
        const doctor = await Doctor.findByIdAndUpdate(
          user._id,
          { avatarUrl: user.avatarUrl },
          { new: true }
        );
        const accessToken = await doctor.generateToken();
        utilsHelper.sendResponse(
          res,
          200,
          true,
          { doctor, accessToken },
          null,
          "Login successfully"
        );
      } else if (user.role === "admin") {
        const admin = await Admin.find();
        const accessToken = await admin.generateToken();
        utilsHelper.sendResponse(
          res,
          200,
          true,
          { admin, accessToken },
          null,
          "Login successfully"
        );
      }
    } else return next(new Error("401 - Incorrect username of password"));
  } catch (err) {
    next(err);
  }
};

authController.register = async (req, res, next) => {
  try {
    let { name, email, password, phone } = req.body;
    let doctor = await Doctor.findOne({ email });
    let patient = await Patient.findOne({ email });
    if (doctor || patient) return next(new Error("401 - Email already exits"));
    const emailVerificationCode = utilsHelper.generateRandomHexString(20);
    console.log(emailVerificationCode);
    if (req.body.role === "patient") {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      patient = await Patient.create({
        parentName: name,
        phone,
        email,
        password,
        emailVerificationCode,
      });
      const accessToken = await patient.generateToken();
      const verificationURL = `${process.env.FRONTEND_URL}/verify?code=${emailVerificationCode}`;
      const emailData = await emailInternalHelper.renderEmailTemplate(
        "verify_email",
        { name, code: verificationURL },
        email
      );

      if (emailData.error) {
        throw new Error(emailData.error);
      } else {
        emailHelper.send(emailData);
      }
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { patient, accessToken },
        null,
        "Register successfully"
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      doctor = await Doctor.create({
        name,
        email,
        password,
        phone,
        emailVerificationCode,
      });
      const accessToken = await doctor.generateToken();

      const verificationURL = `${process.env.FRONTEND_URL}/verify?code=${emailVerificationCode}`;
      const emailData = await emailInternalHelper.renderEmailTemplate(
        "verify_email",
        { name, code: verificationURL },
        email
      );

      if (emailData.error) {
        throw new Error(emailData.error);
      } else {
        emailInternalHelper.send(emailData);
      }
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

authController.registerAdmin = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ name, email, password });

    const accessToken = await admin.generateToken();
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { admin, accessToken },
      null,
      "Register successfully"
    );
  } catch (err) {
    next(err);
  }
};

authController.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    let doctor = await Doctor.findOne({ emailVerificationCode: code });

    if (!doctor) throw new Error("Doctor hasn't register yet");
    await Doctor.findOneAndUpdate(
      { emailVerificationCode: code },
      { emailVerified: true },
      { new: true }
    );

    return utilsHelper.sendResponse(res, 200, true, null, null, "Verified");
  } catch (err) {
    next(err);
  }
};

module.exports = authController;

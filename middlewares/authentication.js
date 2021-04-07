const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = {};

authMiddleware.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) return next(new Error("401 - Access Token required"));
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new Error("401 - Token expired"));
        } else {
          return next(new Error("401 - Token is unvalid"));
        }
      }
      req.userId = payload._id;
      next();
    });
  } catch (err) {
    next(err);
  }
};

authMiddleware.doctorRequired = async (req, res, next) => {
  try {
    const userId = req.userId;
    const currentUser = await Doctor.findById(userId);
    if (!currentUser) return next(new Error("401 - You are not authorized"));
    const isDoctor = currentUser.role === "doctor";

    if (!isDoctor) return next(new Error("401 - You are not authorized"));
    req.isDoctor = isDoctor;

    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.patientRequired = async (req, res, next) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const currentUser = await Patient.findById(userId);
    if (!currentUser) return next(new Error("401 - You are not authorized"));
    const isPatient = currentUser.role === "patient";

    if (!isPatient) return next(new Error("401 - You are not authorized"));
    req.isPatient = isPatient;

    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.adminRequired = async (req, res, next) => {
  try {
    const userId = req.userId;
    const currentUser = await Admin.findById(userId);
    const isAdmin = currentUser.role === "admin";

    if (!isAdmin) return next(new Error("401 - You are not authorized"));
    req.isAdmin = isAdmin;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;

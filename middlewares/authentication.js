const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

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
    const isDoctor = currentUser.role === "doctor";

    if (!isDoctor) return next(new Error("401 - You are not authorized"));
    req.isDoctor = isDoctor;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;

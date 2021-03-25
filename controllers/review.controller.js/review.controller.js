const Review = require("../../models/Review");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const utilsHelper = require("../../helpers/utils.helper");
const reviewController = {};

reviewController.addReview = async (req, res, next) => {
  try {
    const patientId = req.userId;
    const { doctorId, title, body, rating } = req.body;
    let review = await Review.findOne({ doctor: doctorId, patient: patientId });
    if (review) {
      return next(new Error("You have already reviewed this Doctor"));
    }
    review = await Review.create({
      doctor: doctorId,
      patient: patientId,
      title,
      body,
      rating,
    });
    await Patient.findByIdAndUpdate(patientId, {
      $push: { reviews: review._id },
    });
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { reviews: review._id },
    });
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { review },
      null,
      "Review created"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = reviewController;

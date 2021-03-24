const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    rating: { type: Number, min: 1, max: 5, required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient" },
    title: String,
    body: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamp: true }
);
reviewSchema.plugin(require("./plugins/isDeletedFalse"));

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

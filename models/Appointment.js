const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const appointmentSchema = Schema(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    date: { type: String, required: true },
    slot: { type: Number, min: 0, max: 17, required: true },
    status: {
      type: String,
      required: true,
      enum: ["request", "accepted", "completed", "cancel", "unavailable"],
      default: "request",
    },
    isPaid: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* appointmentSchema.plugin(require("./plugins/isDeletedFalse")); */

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;

/* 
- 3 shift/day, 3 hour/shift, 30min/slot => 6 slot/shift
- shift 1: 8:00 - 11:00 => 6 slot
- shift 2: 14:00 - 17:00
- shift 3: 18:00 - 21:00

*/

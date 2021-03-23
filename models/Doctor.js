const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const doctorSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, requried: true, unique: true },
    phone: { type: Number, required: false },
    password: { type: String, required: true },
    imageUrl: {
      type: String,
      default:
        "https://i.picsum.photos/id/614/300/300.jpg?hmac=E2RgPRyVruvw4rXcrM6nY2bwwKPUvnU7ZwXSSiP95JE",
    },
    appoitments: { type: Schema.Types.ObjectId, ref: "Appointment" },
    role: { type: String, default: "doctor" },
    timeslot: {},
    isDeleted: { type: Boolean, default: false },
  },
  { timestamp: true }
);
/* 
doctorSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.emailVerified;
  delete obj.emailVerificationCode;
  delete obj.isDeleted;
  return obj;
}; */

doctorSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  return accessToken;
};

/* doctorSchema.plugin(require("./plugins/isDeletedFalse")); */

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;

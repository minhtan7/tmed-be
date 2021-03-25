const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const patientSchema = Schema(
  {
    name: { type: String, required: true },
    dob: { type: Object, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    parent: {
      parentName: { type: String, required: true },
      phone: { type: Number, required: true },
      email: { type: String, requried: true, unique: true },
      password: { type: String, required: true },
    },
    balance: { type: Number, default: 0 },
    reviews: { type: Schema.Types.ObjectId, ref: "Review" },
    imageUrl: {
      type: String,
      default:
        "https://i.picsum.photos/id/614/300/300.jpg?hmac=E2RgPRyVruvw4rXcrM6nY2bwwKPUvnU7ZwXSSiP95JE",
    },
    appoitments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    role: { type: String, default: "patient" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamp: true }
);

patientSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.emailVerified;
  delete obj.emailVerificationCode;
  delete obj.isDeleted;
  return obj;
};

patientSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  return accessToken;
};

/* patientSchema.plugin(require("./plugins/isDeletedFalse")); */

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;

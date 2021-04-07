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
    avatarUrl: {
      type: String,
      default:
        "https://i.picsum.photos/id/614/300/300.jpg?hmac=E2RgPRyVruvw4rXcrM6nY2bwwKPUvnU7ZwXSSiP95JE",
    },
    balance: { type: Number, default: 0 },
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],

    availableDaySlot: [
      {
        date: {
          type: String,
          require: true,
          enum: [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
        },
        shift: {
          type: String,
          require: true,
          enum: [
            "16:00-18:30",
            "18:30-21:00",
            "16:00-21:00",
          ] /* unique: true  */,
        },
      },
    ],
    district: {
      type: String,
      required: true,
      enum: [
        "district-1",
        "district-5",
        "district-8",
        "thu-duc-district",
        "binh-thanh-district",
      ],
    },
    role: { type: String, default: "doctor" },
    profile: {
      gender: {
        type: String,
        enum: ["male", "female"],
        default: "female",
      },
      degree: { type: String, required: true, default: "none" },
      address: { type: String, required: true, default: "none" },
      about: { type: String, required: true, default: "none" },
    },
    specialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
      default: "605d9e93257db45ebda2b52f",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.emailVerified;
  delete obj.emailVerificationCode;
  delete obj.isDeleted;
  delete obj.balance;
  delete obj.role;
  return obj;
};

doctorSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  return accessToken;
};

doctorSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password, function (_, isMatch) {
    return isMatch;
  });
};

/* doctorSchema.plugin(require("./plugins/isDeletedFalse")); */

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;

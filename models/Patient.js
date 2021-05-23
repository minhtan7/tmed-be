const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const bcrypt = require("bcryptjs");

const patientSchema = new Schema(
  {
    parentName: { type: String, required: true },
    phone: { type: Number, required: false },
    email: { type: String, requried: true, unique: true },
    password: { type: String, required: true },

    children: {
      childName: { type: String, required: true, default: "none" },
      dob: { type: String, required: true, default: "none" },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
        default: "female",
      },
    },
    balance: { type: Number, default: 0 },
    reviews: { type: Schema.Types.ObjectId, ref: "Review" },
    avatarUrl: {
      type: String,
      default:
        "https://i.picsum.photos/id/614/300/300.jpg?hmac=E2RgPRyVruvw4rXcrM6nY2bwwKPUvnU7ZwXSSiP95JE",
    },
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    role: { type: String, default: "patient" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
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

patientSchema.statics.findOrCreate = function findOrCreate(profile, cb) {
  const patientObj = new this(); // create a new User class
  this.findOne({ email: profile.email }, async function (err, result) {
    if (!result) {
      let newPassword =
        profile.password || "" + Math.floor(Math.random() * 100000000);
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(newPassword, salt);

      patientObj.parentName = profile.name;
      patientObj.email = profile.email;
      patientObj.password = newPassword;
      if (profile.googleId) patientObj.googleId = profile.googleId;
      if (profile.facebookId) patientObj.facebookId = profile.facebookId;
      if (profile.avatarUrl) patientObj.avatarUrl = profile.avatarUrl;
      patientObj.save(cb);
    } else {
      cb(err, result);
    }
  });
};

patientSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password, function (_, isMatch) {
    return isMatch;
  });
};

/* patientSchema.plugin(require("./plugins/isDeletedFalse")); */

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;

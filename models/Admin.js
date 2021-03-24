const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const AdminSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  return accessToken;
};

AdminSchema.plugin(require("./plugins/isDeletedFalse"));

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;

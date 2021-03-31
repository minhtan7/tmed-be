const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const specializationSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
specializationSchema.plugin(require("./plugins/isDeletedFalse"));

const Specialization = mongoose.model("Specialization", specializationSchema);
module.exports = Specialization;

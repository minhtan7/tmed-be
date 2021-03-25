const bcrypt = require("bcryptjs");

const utilsHelper = require("../../helpers/utils.helper");
const Patient = require("../../models/Patient");

const patientController = {};

//get current patient .
patientController.getCurrentPatient = async (req, res, next) => {
  try {
    const patientId = req.userId;
    const patient = await User.findById(patientId);
    if (!patient) return next(new Error("401 - Patient not found"));
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { patient },
      "Current patient information"
    );
  } catch (err) {
    next(err);
  }
};

//update current patient profile.
patientController.updateCurrentPatient = async (req, res, next) => {
  try {
    const patientId = req.userId;
    let { name, dob, gender, parent, imageUrl } = req.body;
    let { parentName, phone, email, password } = parent;
    console.log(parentName);
    let patient = await User.findById(patientId);
    if (!patient) return next(new Error("401 - User not found"));

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    patient = await User.findByIdAndUpdate(
      patientId,
      {
        name,
        dob,
        gender,
        imageUrl,
        parent: { parentName, phone, email, password },
      },
      { new: true }
    );
    utilsHelper.sendResponse(res, 200, true, { patient }, "Profile updated");
  } catch (err) {
    next(err);
  }
};
//------------------- Admin action
patientController.getPatients = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users)
      return next(
        new Error("401 - There is no patient or your are not authorized")
      );
    utilsHelper.sendResponse(res, 200, true, { users }, "Get all users");
  } catch (err) {
    next(err);
  }
};

patientController.updatePatient = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let { name, email, password, phone, role, imageUrl } = req.body;
    let patient = await User.findById(userId);
    if (!patient) return next(new Error("401 - User not found"));
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) return next(new Error("401 - Email does exist"));

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    console.log(password);
    patient = await User.findByIdAndUpdate(
      userId,
      { name, email, password, role, phone, imageUrl },
      { new: true }
    );
    utilsHelper.sendResponse(res, 200, true, { patient }, `Update profile`);
  } catch (err) {
    next(err);
  }
};

patientController.deletePatient = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let patient = await User.findById(userId);
    if (!patient) return next(new Error("401 - User not found"));
    patient = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );
    utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      `Delete patient ${patient.name} `
    );
  } catch (err) {
    next(err);
  }
};

//----------------------
//Get order of current patient
patientController.getCurrentUserOrder = async (req, res, next) => {
  try {
    //pagination
    let { page, limit, sortBy, ...filter } = { ...req.query };
    //SOMETHING MISSING HERE !!
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const totalOrders = await Order.count({ ...filter });
    console.log(totalOrders);
    const totalPages = Math.ceil(totalOrders / limit);
    const offset = limit * (page - 1);
    //current patient
    //SOMETHING MISSING HERE !!
    const currentUserId = req.userId;
    const currentUser = await User.findById(currentUserId);

    //target patient
    const userId = req.params.id;

    // current patient request other Order
    if (userId !== currentUserId && currentUser.role !== "admin") {
      return next(
        new Error("401- only admin able to check other patient Order detail")
      );
    }
    // current patient request its Order or Admin request patient's order
    const order = await Order.find({ userId })
      .sort({ ...sortBy, createdAt: -1 })
      .skip(offset)
      .limit(limit);
    // in case no order

    if (!order) return next(new Error(`401- ${patient} has no order`));

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { order, totalPages },
      null,
      "get order from userId success"
    );
  } catch (error) {
    next(error);
  }
};

patientController.paymentUserOrder = async (req, res, next) => {
  try {
    //get request detail
    const orderId = req.params.id; //SOMETHING MISSING HERE !!
    const currentUserId = req.userId; //SOMETHING MISSING HERE !!

    //find the order to pay , get balance
    let order = await Order.findById(orderId); //SOMETHING MISSING HERE !!
    let currentUser = await User.findById(userId); //SOMETHING MISSING HERE !!
    const total = order.total;
    const funds = currentUser.balance;
    //check funds
    if (total > funds) return next(new Error("403-Insufficient balance"));

    //update new balance
    patient = await User.findOneAndUpdate(
      {
        _id: currentUserId,
      },
      { balance: funds - total },
      { new: true }
    );
    //update new order
    order = await Order.findOneAndUpdate(
      //SOMETHING MISSING HERE !!
      {
        _id: orderId,
      },
      { status: "paid" },
      { new: true }
    );
  } catch (error) {
    next(error);
  }
};

patientController.topUpUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { amount } = req.body;
    let patient = await User.findById(userId);
    const balance = parseInt(patient.balance) + parseInt(amount);
    patient = await User.findByIdAndUpdate(userId, { balance }, { new: true });
    if (!patient) next(new Error("401 - User not found"));
    utilsHelper.sendResponse(res, 200, true, { patient }, "Top up the balance");
  } catch (err) {
    next(err);
  }
};

module.exports = patientController;

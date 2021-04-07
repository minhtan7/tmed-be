const utilsHelper = require("../../helpers/utils.helper");
const mongoose = require("mongoose");
const Doctor = require("../../models/Doctor");
const Review = require("../../models/Review");
const bcrypt = require("bcryptjs");
const Specialization = require("../../models/Specialization");
const Appointment = require("../../models/Appointment");

const doctorController = {};
//get all Doctors with filter and query
doctorController.getAllDoctors = async (req, res, next) => {
  try {
    let { page, limit, search, sortBy, district, specializations } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = limit * (page - 1);
    let totalDoctors = 0;
    let totalPages;
    let doctors;
    let r;
    let x;
    if (sortBy === "null") sortBy = "all";
    if (district === "null") district = "all";
    if (specializations === "null") specializations = "all";
    //--- calculate avg reviews rating
    /* await Doctor.aggregate(
      [
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviews",
          },
        },
        { $addFields: { avgRating: { $avg: "$reviews.rating" } } },
        { $project: { reviews: 1 } }, //hide reviews
      ],
      function (err, results) {
        console.log(results);
        r = results;
      }
    ); */

    //------- search function

    if (search) {
      totalDoctors = await Doctor.find({
        /* $or: [ */
        /* { description: { $regex: new RegExp(query, "i") } }, */ //"i" = insensitive: khong phan biet hoa thuong
        name: { $regex: new RegExp(search, "i") },
        /* ], */
      }).countDocuments();

      totalPages = Math.ceil(totalDoctors / limit);

      doctors = await Doctor.find({ name: { $regex: new RegExp(search, "i") } })
        .skip(offset)
        .limit(limit)
        .populate("specialization", "name -_id")
        .populate("reviews");
      //------------ Calculate the average Rating in an HIGH PERFORMANCE way
      let doctorIds = doctors.map((i) => i._id);
      await Review.aggregate(
        [
          { $match: { doctor: { $in: doctorIds } } },
          { $group: { _id: `$doctor`, avgRating: { $avg: "$rating" } } },
        ],
        function (err, results) {
          results.forEach((r) => {
            let doctorIndex = doctors.findIndex(
              (p) => p._id.toString() === r._id.toString()
            );
            doctors[doctorIndex].avgRating = r.avgRating;
          });
        }
      );
    } else {
      console.log(district, specializations);
      console.log(sortBy);
      let sortDoctor;

      if (district === "all" && specializations === "all") {
        totalDoctors = await Doctor.find().countDocuments();
        totalPages = Math.ceil(totalDoctors / limit);
        const offset = limit * (page - 1);
        doctors = await Doctor.find({})
          .skip(offset)
          .limit(limit)
          .lean()
          .populate("specialization", "name -_id")
          .populate("reviews");
      } else if (district != "all" && specializations != "all") {
        x = await Specialization.findOne({ name: specializations });
        specializationsId = x._id;
        totalDoctors = await Doctor.find({
          $and: [{ district: district }, { specialization: specializationsId }],
        }).countDocuments();
        doctors = await Doctor.find({
          $and: [{ district: district }, { specialization: specializationsId }],
        })
          .skip(offset)
          .limit(limit)
          .populate("specialization", "name -_id")
          .populate("reviews");
      } else if (district === "all") {
        x = await Specialization.findOne({ name: specializations });
        specializationsId = x._id;
        totalDoctors = await Doctor.find({
          specialization: specializationsId,
        }).countDocuments();
        doctors = await Doctor.find({
          specialization: specializationsId,
        })
          .skip(offset)
          .limit(limit)
          .populate("specialization", "name -_id")
          .populate("reviews");
      } else if (specializations === "all") {
        totalDoctors = await Doctor.find({
          district,
        }).countDocuments();
        doctors = await Doctor.find({
          district,
        })
          .skip(offset)
          .limit(limit)
          .populate("specialization", "name -_id")
          .populate("reviews");
      }
      //------------ Calculate the average Rating in an HIGH PERFORMANCE way
      if (sortBy != "all") {
        sortDoctor = await Doctor.aggregate([
          {
            $lookup: {
              from: "reviews",
              localField: "reviews",
              foreignField: "_id",
              as: "reviews",
            },
          },
          { $addFields: { avgRating: { $avg: "$reviews.rating" } } },
          { $sort: { avgRating: -1 } },
        ]);

        if (doctors) {
          let testDoc = [];
          console.log("hee");
          sortDoctor.map((sD) => {
            doctors.map((d) => {
              if (sD._id === d._id) {
                d.avgRating = sD.avgRating;
                console.log(sD.avgRating);
                testDoc.push(d);
              }
            });
          });
          doctors = testDoc;
        }
      } else if (sortBy === "all") {
        totalPages = Math.ceil(totalDoctors / limit);
        let doctorIds = doctors.map((i) => i._id);
        console.log("here");
        await Review.aggregate(
          [
            { $match: { doctor: { $in: doctorIds } } },
            { $group: { _id: `$doctor`, avgRating: { $avg: "$rating" } } },
          ],
          function (err, results) {
            results.forEach((r) => {
              let doctorIndex = doctors.findIndex(
                (p) => p._id.toString() === r._id.toString()
              );
              doctors[doctorIndex].avgRating = r.avgRating;
            });
          }
        );
      }
    }

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { doctors, totalPages, totalDoctors },
      null,
      "Get Doctors success"
    );
  } catch (err) {
    next(err);
  }
};

//get  doctor me
doctorController.getDoctorMe = async (req, res, next) => {
  try {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    let offset = limit * (page - 1);
    let totalAppointments = 0;
    let totalPages;

    let doctorId = req.userId;
    let doctor = await Doctor.findById(doctorId);
    totalAppointments = doctor.appointments.length;
    totalPages = Math.ceil(totalAppointments / limit);
    console.log("totalAppointments", totalAppointments);
    console.log("totalPages", totalPages);
    console.log("offset", offset);

    doctor = await Doctor.findById(doctorId)
      .populate("specialization", "name -_id")
      .populate("reviews");
    let appointmentIds = doctor.appointments.map((i) => i._id);
    let orderAppointments = await Appointment.aggregate([
      { $match: { _id: { $in: appointmentIds } } },
      { $sort: { date: -1 } },
    ])
      .skip(offset)
      .limit(limit);
    doctor.appointments = orderAppointments;
    doctor = await doctor
      .populate("appointments")
      .populate({ path: "appointments", populate: "patient" })
      .execPopulate();
    if (search) {
      doctor = await doctor
        .populate({ path: "appointments", populate: "patient" })
        .execPopulate();
      let x = [];

      doctor.appointments.forEach((a) => {
        if (a.patient) {
          let isIncludes = a.patient.parentName
            .toLowerCase()
            .includes(search.toLowerCase());
          if (isIncludes) {
            x.push(a);
          }
        }
      });
      doctor.appointments = x;
      totalAppointments = doctor.appointments.length;
      totalPages = Math.ceil(totalAppointments / limit);
      /* await doctor.skip(offset).limit(limit); */
    }

    if (!doctor) return next(new Error("401 - Doctor not found"));
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { doctor, totalPages },
      null,
      "Get single Doctor successfully"
    );

    /* let orderDoctors = await Doctor.aggregate([
      {
        $lookup: {
          from: "appointments",
          localField: "appointments",
          foreignField: "_id",
          as: "appointments",
        },
      },
      { $match: { _id: mongoose.Types.ObjectId(doctorId) } },
      { $unwind: "$appointments" },
      { $sort: { "appointments.date": -1 } },
    ]); */
  } catch (error) {
    next(error);
  }
};

//get  single doc
doctorController.getSingleDoctor = async (req, res, next) => {
  try {
    let doctorId = req.params.id;
    let doctor = await Doctor.findById(doctorId)
      .populate("appointments")
      .populate("specialization")
      .populate("reviews")
      .populate({ path: "reviews", populate: "patient" });
    doctor = await doctor.toJSON();
    const test = await Review.aggregate([
      { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
      { $group: { _id: `$doctor`, avgRating: { $avg: "$rating" } } },
    ]);

    doctor.avgRating = test[0].avgRating;
    if (!doctor) return next(new Error("401 - Doctor not found"));
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { doctor },
      null,
      "Get single Doctor successfully"
    );
  } catch (error) {
    next(error);
  }
};

doctorController.updateDoctor = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    let {
      name,
      email,
      phone,
      avatarUrl,
      specialization,
      gender,
      degree,
      address,
      about,
      dayOfWeek,
    } = req.body;
    let doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new Error("401 - Doctor not found"));
    if (dayOfWeek) {
      console.log(dayOfWeek);

      let availableDaySlot = dayOfWeek
        .filter((day) => day.shift != "")
        .map((day) => {
          return { date: day.date, shift: day.shift };
        });
      console.log(availableDaySlot);
      doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        {
          availableDaySlot,
        },
        { new: true }
      );
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { doctor },
        `Update working hour`
      );
    } else {
      const isEmailExist = await Doctor.findOne({ email });
      if (isEmailExist) return next(new Error("401 - Email does exist"));
      console.log(req.body);
      /* const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt); */
      specialization = await Specialization.findOne({ specialization })._id;
      if (!avatarUrl) avatarUrl = doctor.avatarUrl;
      doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        {
          name,
          email,
          phone,
          avatarUrl,
          specialization,
          profile: { gender, degree, address, about },
        },
        { new: true }
      );
      utilsHelper.sendResponse(res, 200, true, { doctor }, `Update profile`);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = doctorController;

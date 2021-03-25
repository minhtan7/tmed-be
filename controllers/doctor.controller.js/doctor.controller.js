const utilsHelper = require("../../helpers/utils.helper");

const Doctor = require("../../models/Doctor");

const doctorController = {};
//get all Doctors with filter and query
doctorController.getAllDoctors = async (req, res, next) => {
  try {
    let { page, limit, search, sortBy } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = limit * (page - 1);
    let totalDoctors = 0;
    let totalPages;
    let doctors;
    let r;
    //--- calculate avg reviews rating
    await Doctor.aggregate(
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
    );

    //------- search function
    if (search) {
      totalDoctors = await Doctor.find({
        $or: [
          { description: { $regex: new RegExp(search, "i") } }, //"i" = insensitive: khong phan biet hoa thuong
          { name: { $regex: new RegExp(search, "i") } },
        ],
      }).countDocuments();

      totalPages = Math.ceil(totalDoctors / limit);

      doctors = await Doctor.find({
        $or: [
          { description: { $regex: new RegExp(search, "i") } },
          { name: { $regex: new RegExp(search, "i") } },
        ],
      })
        .skip(offset)
        .limit(limit)
        .populate("specialization", "name -_id")
        .populate("reviews");
    } else {
      totalDoctors = await Doctor.find().countDocuments();
      totalPages = Math.ceil(totalDoctors / limit);
      const offset = limit * (page - 1);

      doctors = await Doctor.find({}).skip(offset).limit(limit).lean();
    }
    /*------------ Calculate the average Rating in an HIGH PERFORMANCE way
     let DoctorIds = Doctors.map((i) => i._id);
    await Review.aggregate(
      [
        { $match: { Doctor: { $in: DoctorIds } } },
        { $group: { _id: `$Doctor`, avgRating: { $avg: "$rating" } } },
      ],
      function (err, results) {
        console.log(results);
        results.forEach((r) => {
          let DoctorIndex = Doctors.findIndex(
            (p) => p._id.toString() === r._id.toString( )
          );
          Doctors[DoctorIndex].avgRating = r.avgRating;
        });
      }
    );
 */
    //------------------ Second way, more usable

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { doctors, totalPages },
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
    let doctorId = req.userId;
    const doctor = await Doctor.findById(doctorId)
      .populate("specialization", "name -_id")
      .populate("reviews");
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

//get  single doc
doctorController.getSingleDoctor = async (req, res, next) => {
  try {
    let doctorId = req.params.id;
    let doctor = await Doctor.findById(doctorId);
    doctor = await doctor.toJSON();
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
    const doctorId = req.params.id;
    let {
      name,
      email,
      password,
      phone,
      imageUrl,
      profile,
      specialization,
    } = req.body;
    let doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new Error("401 - User not found"));
    const isEmailExist = await Doctor.findOne({ email });
    if (isEmailExist) return next(new Error("401 - Email does exist"));

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    doctor = await User.findByIdAndUpdate(
      doctorId,
      { name, email, password, phone, imageUrl, profile, specialization },
      { new: true }
    );
    utilsHelper.sendResponse(res, 200, true, { doctor }, `Update profile`);
  } catch (err) {
    next(err);
  }
};

module.exports = doctorController;

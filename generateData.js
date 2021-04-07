const faker = require("faker");
require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");
const bcrypt = require("bcryptjs");
var moment = require("moment");
const fs = require("fs");

const Review = require("./models/Review");
const Appointment = require("./models/Appointment");
const Specialization = require("./models/Specialization");
const cloudinary = require("cloudinary").v2;

/* cloudinary.config({
  cloud_name: "tanvo",
  api_key: "356268699242227",
  api_secret: "eP98cnSCsByh38t8zRgu0HqHwf8",
}); */

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI, {
    // some options to deal with deprecated warning
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Mongoose connected to ${mongoURI}`))
  .catch((err) => console.log(err));

const genderArray = [0, 1];

//USer model
/* name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"] },
    gender:{type: String, enum:["male", "female", "other"]}
    balance: { type: Number, default: 0 },
    order: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    isDeleted: { type: Boolean, default: false }, */
const generateSpecialization = async () => {
  await Specialization.collection.drop();
  const specializationsArray = [
    "hematology",
    "dermatology",
    "gastroenterology",
    "pulmonology",
    "nephrology",
    "cardiology",
    "infectious diseases",
    "nutrician",
  ];
  for (let i = 0; i < specializationsArray.length; i++) {
    await Specialization.create({ name: specializationsArray[i] });
  }
};
/* generateSpecialization(); */

const districts = [
  "district-1",
  "district-5",
  "district-8",
  "thu-duc-district",
  "binh-thanh-district",
];

/*  const shifts = [0, 1]; */
const availableDaysOfNum = [0, 1, 2, 3, 4, 5, 6];
const shifts = ["16:00-18:30", "18:30-21:00", "16:00-21:00"];
const availableDaysOf = [
  ["monday", "wednesday", "friday"],
  ["tuesday", "thursday", "saturday"],
  ["sunday", "wednesday", "saturday"],
  ["monday", "thursday", "saturday"],
];

const generatorDoctor = async (num) => {
  /* await Doctor.collection.drop(); */
  /* await Doctor.collection.drop();
  await Patient.collection.drop();
  await Appointment.collection.drop();
  await Review.collection.drop(); */
  const specializations = await Specialization.find();
  const doctorIDs = [];
  const degree = ["B.Med", "MD"];
  const street = [
    "Vo Van Tan",
    "Nguyen Thi Minh Khai",
    "Nguyen Thien Thuat",
    "Dien Bien Phu",
    "Ngo Thoi Nhiem",
    "Vo Thi Sau",
    "Ly Chinh Thang",
  ];
  for (i = 0; i < num; i++) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash("123", salt);

    const user = {};
    user.gender = faker.random.arrayElement(genderArray);
    const firstName = faker.name.firstName(user.gender);
    const lastName = faker.name.lastName();

    user.name = firstName + " " + lastName;

    user.email = faker.internet.email("", lastName);
    if (user.gender === 1) {
      user.gender = "male";
    } else user.gender = "female";
    let d = faker.random.arrayElement(districts);
    address =
      `${faker.random.number(200)}` +
      " " +
      `${faker.random.arrayElement(street)}` +
      ", " +
      `${d}, HCMC`;
    let availableDays = faker.random.arrayElement(availableDaysOf, 1);

    /* availableDays.sort(function (a, b) {
      return a - b;
    });
    let xx = [];
    console.log(availableDays);
    availableDays.forEach((a, index) => {
      a = availableDaysOf[a];
      console.log(availableDaysOf[a]);
    }); */
    console.log(availableDays);
    /* 
    for (i = 0; i < 3; i++) {
      let shift = faker.random.arrayElements(shifts, faker.random.number(2));
      availableDaySlot[i] = shift;
    } */
    let day_1_shift = faker.random.arrayElement(shifts, 1);
    let day_2_shift = faker.random.arrayElement(shifts, 1);
    let day_3_shift = faker.random.arrayElement(shifts, 1);
    let y = [day_1_shift, day_2_shift, day_3_shift];
    console.log(y);
    let x = {};
    let m = {};
    let n = {};
    /* for (let key of availableDays) {
      x[key] = y[availableDays.indexOf(key)];
      availableDaySlot.push(x);
    }
    console.log(availableDaySlot[0]); */
    x.date = availableDays[0];
    x.shift = y[0];
    m.date = availableDays[1];
    m.shift = y[1];
    n.date = availableDays[2];
    n.shift = y[2];
    console.log(x, m, n);
    /*  console.log(availableDaySlot);
    availableDaySlot[availableDays[1]] = day_2_shift;
    availableDaySlot[availableDays[2]] = day_3_shift;
    console.log(availableDaySlot); */
    const doctor = await Doctor.create({
      name: user.name,
      email: user.email,
      phone: faker.phone.phoneNumber("+84164######"),
      balance: faker.random.number(1000),
      avatarUrl: faker.internet.avatar(),
      password,
      role: "doctor",
      specialization: faker.random.arrayElement(specializations),
      profile: {
        gender: user.gender,
        address: address,
        degree: faker.random.arrayElement(degree),
        about: faker.lorem.paragraphs(faker.random.number(1) + 3),
      },
      district: d,
      availableDaySlot: [x, m, n],
    });
    console.log(`#${i + 1}${doctor.name} has been created`);
    doctorIDs.push(doctor._id);
  }
  return doctorIDs;
};

/* generatorDoctor(10); */

const generatorPatient = async (num) => {
  const patientIDs = [];
  for (i = 0; i < num; i++) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash("123", salt);

    const user = {};
    user.gender = faker.random.arrayElement(genderArray);
    const firstName = faker.name.firstName(user.gender);
    const lastName = faker.name.lastName();
    const parentNameFirstName = faker.name.firstName();

    user.name = firstName + " " + lastName;
    user.parentName = parentNameFirstName + " " + lastName;

    user.email = faker.internet.email("", lastName);
    if (user.gender === 1) {
      user.gender = "male";
    } else user.gender = "female";
    const patient = await Patient.create({
      parentName: user.parentName,
      phone: faker.phone.phoneNumber("+84164######"),
      email: user.email,
      password,
      balance: faker.random.number(1000),
      avatarUrl: faker.internet.avatar(),
      role: "patient",
      children: {
        childName: user.name,
        dob: moment(faker.date.between("2012", "2021")).format("YYYY-MM-DD"),
        gender: user.gender,
      },
    });
    console.log(`#${i + 1}${patient.parentName} has been created`);
    patientIDs.push(patient._id);
  }
  return patientIDs;
};

/* generatorDoctor(5); */
/* generatorPatient(5); */

const generatePatientAndDoctor = async (num) => {
  await Doctor.collection.drop();
  await Patient.collection.drop();
  /* await Appointment.collection.drop();
  await Review.collection.drop(); */
  let doctorIDs = await generatorDoctor(20);
  let patientIDs = await generatorPatient(60);
  console.log("doctorIDs", doctorIDs);
  console.log("patiengIDs", patientIDs);
  const today = moment();
  for (i = 0; i < doctorIDs.length; i++) {
    const numberOfReviewsOfDoctor = faker.random.number(3) + 2;
    const reviewers = faker.random.arrayElements(
      patientIDs,
      numberOfReviewsOfDoctor
    );

    for (let j = 0; j < numberOfReviewsOfDoctor; j++) {
      await generateSingleReview(doctorIDs[i], reviewers[j]);
    }
  }

  for (i = 0; i < num; i++) {
    let date = faker.date.between("2021-04-02", "2021-04-11");
    date = moment(date).format("YYYY-MM-DD");
    let slot = faker.random.number(9);
    const status = ["request", "accepted", "cancel"];
    let appointment;

    let doctorId = faker.random.arrayElement(doctorIDs);

    let patientId = faker.random.arrayElement(patientIDs);
    const doctor = await Doctor.findById(doctorId).populate("appointments");

    const patient = await Patient.findById(patientId).populate("appointments");
    const x = doctor.appointments.filter(
      (a) => a.date === date && a.slot === slot
    );
    const y = patient.appointments.filter(
      (a) => a.date === date && a.slot === slot
    );

    if (x.length === 0 && y.length === 0) {
      appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId,
        date,
        slot,
        isPaid: true,
        status: faker.random.arrayElement(status),
      });
      await Doctor.findByIdAndUpdate(doctorId, {
        $push: { appointments: appointment._id },
      });
      await Patient.findByIdAndUpdate(patientId, {
        $push: { appointments: appointment._id },
      });
      console.log(`#${i + 1} ${appointment.date} has been created`);
    }
  }
};

generatePatientAndDoctor(1500);

/* const folderPath = "./archive";
const productPhotos = fs.readdirSync(folderPath);

const uploadToCloudinary = (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};
 */
const generateSingleReview = async (doctorId, patientId) => {
  const review = await Review.create({
    doctor: doctorId,
    patient: patientId,
    rating: faker.random.number(1) + 3,
    title: faker.lorem.words(faker.random.number(4) + 2),
    body: faker.lorem.paragraphs(faker.random.number(1) + 1),
  });

  //mofidy product to update the reviews array
  await Doctor.findByIdAndUpdate(doctorId, {
    $push: { reviews: review._id },
  });
  await Patient.findByIdAndUpdate(patientId, {
    $push: { reviews: review._id },
  });
};

const generateAppointment = async (doctorId, patientId) => {
  const today = moment().format();
  const date = faker.date.between(today, today + 3);
  let slot = faker.random.number(17);
  const status = ["request", "accepted", "cancel", "completed"];
  let appointment;
  const doctor = await Doctor.findById(doctorId).populate("appointments");
  const patient = await Patient.findById(patientId).populate("appointments");
  const x = doctor.appointment.filter(
    (a) => a.date === date && a.slot === slot
  );
  if (x.length === 0) {
    appointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      date,
      slot,
      status: faker.random.arrayElement(status),
    });
  } else {
    slot = faker.random.number(17);
    appointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      date,
      slot,
      status: faker.random.arrayElement(status),
    });
  }
};

/* const randomNumber = faker.random.number({ min: 10, max: 100 }); //random number from 10-100 */
/* const random = faker.random.number() */

//--------- how to generate user infomation
/* const genderArray = [0, 1];
const user = {};
user.gender = faker.random.arrayElement(genderArray);
const firstName = faker.name.firstName(user.gender);
const lastName = faker.name.lastName();

user.name = firstName + " " + lastName;

user.email = faker.internet.email("", lastName); */

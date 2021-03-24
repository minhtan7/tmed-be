const Appointment = require("../../models/Appointment");
const utilsHelper = require("../../helpers/utils.helper");
const Doctor = require("../../models/Doctor");
const Patient = require("../../models/Patient");

const appointmentController = {};

//Create the order
appointmentController.requestAppoinment = async (req, res, next) => {
  try {
    const { date, slot } = req.body;
    let patientId = req.userId;
    let doctorId = req.params.id;
    console.log(userId);
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new Error("401 - Doctor not found"));

    const dateCheck = Object.fromEntries(
      Object.entries(doctor.timeslots).filter(
        ([key, value]) => value.date === date
      )
    );
    if (!dateCheck) return next(new Error("401 - Date not verified"));
    const slotCheck = Object.values(dateCheck).slot.includes(slot);
    if (!slotCheck)
      next(new Error("401 - The Doctor is not available this time"));
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      date,
      slot,
    });
    doctor = await Doctor.findByIdAndUpdate(doctor, {
      $push: { appointments: appointment._id },
    });
    patient = await Patient.findByIdAndUpdate(doctor, {
      $push: { appointments: appointment._id },
    });
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { appointment },
      null,
      "Request appointment created"
    );
  } catch (error) {
    next(error);
  }
};

appointmentController.acceptedAppoinment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    let appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return next(new Error("401 - Appointment is no longer exist"));
    appointmentId = await Appointment.findByIdAndUpdate(appointmentId, {
      status: "accepted",
    });

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { appointment },
      null,
      "Request appointment created"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = appointmentController;

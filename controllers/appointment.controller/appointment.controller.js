const Appointment = require("../../models/Appointment");
const utilsHelper = require("../../helpers/utils.helper");
const Doctor = require("../../models/Doctor");
const Patient = require("../../models/Patient");
const moment = require("moment");

const appointmentController = {};

//Create the order
appointmentController.requestAppointment = async (req, res, next) => {
  try {
    const { date, slot } = req.body;
    let patientId = req.userId;
    let doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new Error("401 - Doctor not found"));
    let appointment;
    if (patientId === doctorId) {
      appointment = await Appointment.create({
        doctor: doctorId,
        date,
        slot,
        status: "dOff",
      });
      await Doctor.findByIdAndUpdate(doctor, {
        $push: { appointments: appointment._id },
      });
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { appointment },
        null,
        "Slot off created"
      );
    } else {
      appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId,
        date,
        slot,
      });
      await Patient.findByIdAndUpdate(patientId, {
        $push: { appointments: appointment._id },
      });
      await Doctor.findByIdAndUpdate(doctor, {
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
    }

    /* const dateCheck = Object.fromEntries(
      Object.entries(doctor.timeslots).filter(
        ([key, value]) => value.date === date
      )
    );
    if (!dateCheck) return next(new Error("401 - Date not verified"));
    const slotCheck = Object.values(dateCheck).slot.includes(slot);
    if (!slotCheck)
      next(new Error("401 - The Doctor is not available this time"));*/
  } catch (error) {
    next(error);
  }
};

appointmentController.acceptedAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const doctorId = req.userId;
    let appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return next(new Error("401 - Appointment is no longer exist"));
    if (doctorId !== appointment.doctor)
      next(new Error("401 - You are not authorized"));
    appointmentId = await Appointment.findByIdAndUpdate(appointmentId, {
      status: "accepted",
    });

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { appointment },
      null,
      "Appointment accepted"
    );
  } catch (error) {
    next(error);
  }
};

appointmentController.completedAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const doctorId = req.userId;
    let appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return next(new Error("401 - Appointment is no longer exist"));
    if (doctorId !== appointment.doctor)
      next(new Error("401 - You are not authorized"));
    appointmentId = await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
      balance: balance + 500000,
    });

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { appointment },
      null,
      "Appointment accepted"
    );
  } catch (error) {
    next(error);
  }
};

appointmentController.cancelAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.userId;
    const { date } = req.body;
    let currentDate = moment().get("date");
    let appointment = await Appointment.findById(appointmentId);

    if (!appointment) return next(new Error("401 - Appointment not found"));

    let patient = await Patient.findById(userId);
    let doctor = await Doctor.findById(userId);
    const diffDay = currentDate.diff(date, "days"); //count the different day between the appointment and currenday
    if (!patient && !doctor) return next(new Error("401 - User not found"));
    if (patient) {
      //the patient can cancel
      if (diffDay < 1) {
        //only can cancel before 24hour and get the reservation fee back
        return next(new Error("401 - User can not cancel due to the policy"));
      } else {
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { isDeleted: true },
          { new: true }
        );
        await patient.update({ $inc: { balance: 100000 } }); //get back reservation fee
      }
    } else {
      //doctor can also cancel the appointment
      if (diffDay > 1) {
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { isDeleted: true },
          { new: true }
        );
        patient = await Patient.findById(appointment.patient);
        await patient.update({ $inc: { balance: 100000 } }); //get back reservation fee
      } else {
        //some punishment should be placed here}
      }
    }
    utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Oppointment accepted"
    );
  } catch (error) {
    next(error);
  }
};

appointmentController.getSingleAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    let appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return next(new Error("401 - Appointment is no longer exist"));
    appointment = await Appointment.findById(appointmentId);

    utilsHelper.sendResponse(
      res,
      200,
      true,
      { appointment },
      null,
      "Get single appointment"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = appointmentController;

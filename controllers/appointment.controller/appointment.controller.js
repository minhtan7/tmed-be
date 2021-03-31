const Appointment = require("../../models/Appointment");
const utilsHelper = require("../../helpers/utils.helper");
const Doctor = require("../../models/Doctor");
const Patient = require("../../models/Patient");
const moment = require("moment");

const appointmentController = {};

//Create the appointment isPaid false
appointmentController.requestAppointmentIsPaidFalse = async (
  req,
  res,
  next
) => {
  try {
    let { date, slot } = req.body;
    date = moment(date);
    if (date.diff(moment(), "days") < 0)
      return next(new Error("401 - You can not request a previous day!"));
    let patientId = req.userId;
    let doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new Error("401 - Doctor not found"));
    let appointment;
    if (patientId === doctorId) {
      appointment = await Appointment.create({
        doctor: doctorId,
        date: date.format("YYYY-MM-DD"),
        slot,
        status: "unavailable",
      });
      appointment = await appointment
        .populate("patient")
        .populate("doctor")
        .execPopulate();
      await Doctor.findByIdAndUpdate(doctor, {
        $push: { appointments: appointment._id },
      });
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { appointment },
        null,
        "Unvailable slot created"
      );
    } else {
      appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId,
        date: date.format("YYYY-MM-DD"),
        slot,
      });
      appointment = await appointment
        .populate("doctor")
        .populate("patient")
        .execPopulate();
      console.log(appointment);
      await Patient.findByIdAndUpdate(
        patientId,
        {
          $push: { appointments: appointment._id },
        },
        { new: true }
      );

      await Doctor.findByIdAndUpdate(
        doctor,
        {
          $push: { appointments: appointment._id },
        },
        { new: true }
      );
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { appointment },
        null,
        "Request appointment created is not Paid"
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

appointmentController.requestAppointment = async (req, res, next) => {
  try {
    let { status, appointmentId } = req.body;

    let appointment = await Appointment.findById(appointmentId);
    if (status === "COMPLETED") {
      appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { isPaid: true },
        { new: true }
      );
      utilsHelper.sendResponse(
        res,
        200,
        true,
        { appointment },
        null,
        "Request appointment created"
      );
    } else {
      await Appointment.findByIdAndDelete(appointmentId);
      utilsHelper.sendResponse(
        res,
        200,
        true,
        null,
        null,
        "Request appointment fail"
      );
    }
  } catch (error) {
    next(error);
  }
};

appointmentController.acceptedAppointment = async (req, res, next) => {
  try {
    let appointmentId = req.params.id;
    const doctorId = req.userId;
    let appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return next(new Error("401 - Appointment is no longer exist"));
    if (doctorId != appointment.doctor)
      next(new Error("401 - You are not authorized"));

    if (appointment.status != "request")
      next(new Error("401 - This is not a request to be accepted"));
    appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "accepted",
      },
      { new: true }
    );

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
    appointment = await Appointment.findByIdAndUpdate(appointmentId, {
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
    let appointment = await Appointment.findById(appointmentId);

    if (!appointment) return next(new Error("401 - Appointment not found"));
    if (appointment.status != "request" && appointment.status != "accepted")
      return next(new Error("401 - You can not cancel this"));
    let patient = await Patient.findById(userId);
    let doctor = await Doctor.findById(userId);
    const diffDay = moment(appointment.date).diff(moment(date), "days"); //count the different day between the appointment and currenday
    if (!patient && !doctor) return next(new Error("401 - User not found"));
    if (patient) {
      //the patient can cancel
      if (diffDay < 1) {
        //only can cancel before 24hour and get the reservation fee back
        return next(new Error("401 - User can not cancel due to the policy"));
      } else {
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { status: "cancel" },
          { new: true }
        );
        patient = await Patient.findByIdAndUpdate(
          appointment.patient,
          { $inc: { balance: 5 } },
          { new: true }
        ); //get back reservation fee
      }
    } else {
      //doctor can also cancel the appointment
      if (diffDay > 1) {
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { status: "cancel" },
          { new: true }
        );
        patient = await Patient.findByIdAndUpdate(
          appointment.patient,
          { $inc: { balance: 5 } },
          { new: true }
        );
        /* await patient.update({ $inc: { balance: 100000 } });  */ //get back reservation fee
      } else {
        //some punishment should be placed here}
      }
    }
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { appointment },
      null,
      "Appointment canceled"
    );
  } catch (error) {
    next(error);
  }
};

/* appointmentController.payReservationFeeAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const patientId = req.userId;
    let appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(new Error("401 - Appointment not found"));
    if (patientId !== appointment.patient)
      next(new Error("401 - You are not authorized"));
    appointmentId = await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
      balance: balance + 5,
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
}; */

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

appointmentController.getAppointmentsByDate = async (req, res, next) => {
  try {
    let date = req.params.date;
    let doctorId = req.params.id;
    date = moment(date).subtract(1, "days");
    let sevenDaysAppointments = {};
    for (i = 1; i < 8; i++) {
      console.log(i);
      let currentDay = date.add(1, "days").format("YYYY-MM-DD");

      console.log("currentDay", currentDay);
      let appointment = await Appointment.find({
        date: currentDay,
        doctor: doctorId,
      });

      sevenDaysAppointments[`${currentDay}`] = appointment;
    }
    console.log(sevenDaysAppointments);
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { sevenDaysAppointments },
      null,
      "Get seven day appointment"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = appointmentController;

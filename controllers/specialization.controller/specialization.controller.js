const Specialization = require("../../models/Specialization");
const utilsHelper = require("../helpers/utils.helper");

const specializationController = {};

specializationController.addCategory = async (req, res, next) => {
  try {
    let { name } = req.body;
    let specialization = await Specialization.findOne({
      name: name.toLowerCase().trim(),
    });
    if (specialization)
      return next(new Error("401 - Specialization already exists"));
    specialization = await Specialization.create({ name });
    utilsHelper.sendResponse(
      res,
      200,
      true,
      { specialization },
      null,
      "Specialization created"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = specializationController;

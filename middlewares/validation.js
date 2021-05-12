const utilsHelper = require("../helpers/utils.helper");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extreactedError = [];
  errors
    .array()
    .map((error) => extreactedError.push({ [error.param]: error.msg }));
  return utilsHelper.sendResponse(
    res,
    422,
    false,
    null,
    extreactedError,
    "VAlidation Error missing requirements"
  );
};

validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectId: Object id is not a mongodb Id");
  }
  return true;
};

module.exports = validators;

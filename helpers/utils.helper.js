"uses strict";
const { stat } = require("fs");
const cryptoRandomString = require("crypto-random-string");
const crypto = require("crypto");
const Template = require("../models/Template");
utilsHelper = {};
utilsHelper.sendResponse = (res, status, success, data, errors, message) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;
  res.status(status).json(response);
};

utilsHelper.generateRandomHexString = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len)
    .toUpperCase();
};

module.exports = utilsHelper;

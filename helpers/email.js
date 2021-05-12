const Mailgun = require("mailgun-js");
const Template = require("../models/Template");

const mailgun = new Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

/* const sendTestEmail = () => {
  const data = {
    from:
      "Mailgun Sandbox <postmaster@sandboxc3756592e6204abf9e096e6740c1e39d.mailgun.org>",
    to: "tan.vopm@gmail.com",
    subject: "hello",
    text: "Hi <strong>Tan<strong>",
  };
  mailgun.messages().send(data, function (error, body) {
    console.log(body, error);
  });
}; */

const emailInternalHelper = {};

emailInternalHelper.createTemplatesIfNotExist = async () => {
  try {
    let template = await Template.findOne({ template_key: "verify_email" });
    if (!template) {
      let emailTemplate = await Template.create({
        name: "Verify email Template",
        description: "This template is used when user register a new email",
        template_key: "verify_email",
        from: "tan.vo@coderschoo.vn",
        variables: ["name", "code"],
        subject: "Hi %name%, Welcome to social BLog",
        html: `Hi <strong>%name%</strong>, <br/> Thank you for registeration. <br/>
        Please confirm your email address by clicking on the link below. <br/> %code%<br/>
        If you have any difficulty during the sign-up, do get in touch with out support tema: tmed@gmail.com
        <br/> Tmed Team`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
emailInternalHelper.renderEmailTemplate = async (
  template_key,
  variableObj,
  toEmail
) => {
  try {
    //1. template is exist in templateSchem?
    const template = await Template.findOne({ template_key });
    if (!template) return { error: "Invalid template key" };
    //2. make data
    const data = {
      from: template.from,
      to: toEmail,
      subject: template.subject,
      html: template.html,
    };
    //3. dynamic variables to given variables
    for (let i = 0; i < template.variables.length; i++) {
      let key = template.variables[i];
      if (!variableObj[key])
        return { error: "Invalid variable key: missing key" };
      let re = new RegExp(`%${key}%`, "g"); //every word wrap by the %, and find every word - global
      data.subject = data.subject.replace(re, variableObj[key]);
      data.html = data.html.replace(re, variableObj[key]);
    }
    //4. return data
    return data;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

emailInternalHelper.send = (data) => {
  mailgun.messages().send(data, function (error, info) {
    if (error) {
      console.log(error);
    } else console.log(info);
  });
};

module.exports = { emailInternalHelper };

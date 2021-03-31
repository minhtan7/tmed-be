const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookTokenStrategy = require("passport-facebook-token");
const GoogleTokenStrategy = require("passport-google-token").Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      try {
        let patient = await Patient.findOne({ email });
        let doctor = await Doctor.findOne({ email });
        console.log(patient);
        if (!patient && !doctor)
          return done(null, false, { message: "Incorrect username." });
        if (patient) {
          if (!patient.comparePassword(password)) {
            return done(null, false, { message: "Incorrect username." });
          } else {
            let user = patient;
            return done(null, user);
          }
        } else if (doctor) {
          if (!doctor.comparePassword(password)) {
            return done(null, false, { message: "Incorrect username." });
          } else {
            let user = doctor;
            return done(null, user);
          }
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new FacebookTokenStrategy(
    {
      fbGraphVersion: "v3.0",
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
    },
    function (_, _, profile, done) {
      Patient.findOrCreate(
        {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatarUrl: profile._json.picture,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
    function (_, _, profile, done) {
      Patient.findOrCreate(
        {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatarUrl: profile._json.picture,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);
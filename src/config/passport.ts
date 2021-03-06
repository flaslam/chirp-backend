import passport from "passport";
import passportJwt from "passport-jwt";
import passportAnonymous from "passport-anonymous";
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const AnonymousStrategy = passportAnonymous.Strategy;

import User from "../models/user";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY,
};

const strategy = new JwtStrategy(options, (payload, done) => {
  User.findOne({ _id: payload.sub })
    .then((user) => {
      // JWT is already validated
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((err) => done(err, null));
});

module.exports = (passport: passport.PassportStatic) => {
  passport.use(strategy);
  passport.use(new AnonymousStrategy());
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const passport_anonymous_1 = __importDefault(require("passport-anonymous"));
const JwtStrategy = passport_jwt_1.default.Strategy;
const ExtractJwt = passport_jwt_1.default.ExtractJwt;
const AnonymousStrategy = passport_anonymous_1.default.Strategy;
const user_1 = __importDefault(require("../models/user"));
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_KEY,
};
const strategy = new JwtStrategy(options, (payload, done) => {
    user_1.default.findOne({ _id: payload.sub })
        .then((user) => {
        // JWT is already validated
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    })
        .catch((err) => done(err, null));
});
module.exports = (passport) => {
    passport.use(strategy);
    passport.use(new AnonymousStrategy());
};

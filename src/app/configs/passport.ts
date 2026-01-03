import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { envSecrets } from "./env";

passport.use(
  new GoogleStrategy(
    {
      clientID: envSecrets.GOOGLE_CLIENT_ID,
      clientSecret: envSecrets.GOOGLE_CLIENT_SECRET,
      callbackURL: envSecrets.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

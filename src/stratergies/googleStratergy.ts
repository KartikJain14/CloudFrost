import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/userModel";
import { IUser } from "../interfaces";
import dotenv from "dotenv";
dotenv.config();

// Google OAuth 2.0 credentials, to be received from the Google Cloud Console https://console.cloud.google.com/auth/clients
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/callback/google",
    passReqToCallback: true
},
// Required callback function that returns the user profile
async function (req, accessToken, refreshToken, profile: Profile, done) {
    try {
        const id = profile.id;
        const email = profile.emails?.[0]?.value;
        const verifiedEmail = profile.emails?.[0]?.verified;
        const fullName = profile.displayName || "Name";
        const givenName = profile.name?.givenName || "_";
        const familyName = profile.name?.familyName || "_";
        const picture = profile.photos?.[0]?.value;
        const locale = profile._json.locale ?? "en-in";
        const hd = profile._json.hd ?? "gmail.com";

        // Try to find the user in the database if it already exists
        let user = await User.findOne({ email });

        // If user doesn't exist, create a new user and save them in the database
        if (!user) {
            console.log("Creating new user");
            user = await User.create({
                google_id: id,
                email: email,
                verified_email: verifiedEmail,
                name: fullName,
                given_name: givenName,
                family_name: familyName,
                picture: picture,
                locale: locale,
                hd: hd
            });
        }
        
        // Return the user for serialization
        done(null, user);
    } catch (error) {
        console.error(error);
        done(error);
    }
}));

// Serialize the user (convert user to special format to store them as a encrypted cookie client side)
passport.serializeUser((user, done) => {
    done(null, (user as IUser).email);
});

// Deserialize the user (convert user from the returned encrypted cookie to special format back to user object)
passport.deserializeUser(async (email, done) => {
    try {
        const user = await User.findOne({ email });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
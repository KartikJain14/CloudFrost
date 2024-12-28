import { Router } from "express";
import { google, logout, me } from "../controllers/authControllers";
import passport from "../stratergies/googleStratergy";

const router = Router();

// Route leading to google authentication
router.get("/google", passport.authenticate('google', { scope: ["email", "profile"] }));

// Route is set as google callback and serializes the user (gets the user details)
router.get("/callback/google", passport.authenticate('google', { failureRedirect: '/' }), google);

// Route to logout the user from the session
router.get("/logout", logout);

// Route to get the user details (this endpoint isn't exposed or used by the website)
router.get("/me", me);

export default router;
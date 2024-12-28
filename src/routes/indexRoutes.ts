import { Router } from "express";
import { index, signin, contact, dashboard, register } from "../controllers/indexControllers";
const router = Router();

// Route returns the landing page
router.get("/", index);

// Route redirects to google sign in via /auth/google
router.get("/signin", signin);

// Route returns the contact page
router.get("/contact", contact);

// Route returns the dashboard where you can edit nameservers
router.get("/dashboard", dashboard);

// Route returns the register page where a new user may request a subdomain
router.get("/register", register);

export default router;
import { Router } from "express";
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { registerSubdomain, updateSubdomain, available, deleteSubdomain, contact } from "../controllers/apiControllers";
dotenv.config();

const WINDOW = parseInt(process.env.WINDOW || '30', 10);
const LIMIT = parseInt(process.env.LIMIT || '15', 10);

// Need to use a rate limiter to prevent abuse of sensitive endpoints
const rateLimiter = rateLimit({
  windowMs: (WINDOW * 60 * 1000), // every 30 minutes
  max: LIMIT, // these amount of requests are allowed
  message: 'Too many requests, please try again later.',
  keyGenerator: (req) => {
    const ip = req.headers['cf-connecting-ip'] || req.ip || 'default-ip';
    return ip.toString();
  },
});

const router = Router();

router.use(rateLimiter);

// Route is used to check if a subdomain is available
router.post("/available", available);

// Route is used to assign a subdomain to the user
router.post("/register", registerSubdomain);

// Route is used to create / update nameservers for a subdomain
router.post("/update", updateSubdomain);

// Route deletes all the nameservers for the subdomain and deassigns it from the user
router.post("/delete", deleteSubdomain);

// Route sends the contact requests to the admin using webhooks
router.post("/contact", contact);

export default router;
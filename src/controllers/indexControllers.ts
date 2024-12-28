import { getDomain } from "../services/cloudflareService";
import { IUser } from "../interfaces";
import { Request, Response } from "express";
import User from "../models/userModel";

// Render the landing page with the service domain
export const index = (req: Request, res: Response) => {
    res.render("landing", { domain: getDomain() });
};

// Redirect to the Google OAuth2.0 authentication page via /auth/google
export const signin = (req: Request, res: Response) => {
    if(req.isAuthenticated()) {
        res.redirect("/dashboard");
        return;
    }
    res.redirect("/auth/google");
};

// Render the contact page that allows visitor/user to contact the admin
export const contact = (req: Request, res: Response) => {
    const user = req.isAuthenticated() ? (req.user as IUser) : null;
    res.render("contact", { user });
};

// Render the dashboard where the user can manage their subdomain's nameservers
export const dashboard = async (req: Request, res: Response) => {
    // Allow only authenticated users
    if(!req.isAuthenticated()) {
        res.redirect("/signin");
        return;
    }
    const cUser = req.user as IUser;
    const user = await User.findOne({ email: cUser.email });
    if(!user) {
        res.redirect("/signin");
        return;
    }
    // User should have a subdomain to access the dashboard
    if(!user.subdomain) {
        res.redirect("/register");
        return;
    }
    res.render("nameserver", { user , domain: getDomain() });
};

// Render the registration page where the user can register their subdomain
export const register = async (req: Request, res: Response) => {
    if(!req.isAuthenticated()) {
        res.redirect("/signin");
        return;
    }
    const cUser = req.user as IUser;
    const user = await User.findOne({ email: cUser.email });
    if(!user) {
        res.redirect("/signin");
        return;
    }
    // User should not already have a subdomain
    if(user.subdomain) {
        res.redirect("/dashboard");
        return;
    }
    res.render("register", { domain: getDomain(), user });
}
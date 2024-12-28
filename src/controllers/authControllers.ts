import { Request, Response } from "express";
import { IUser } from "../interfaces";

export const google = (req: Request, res: Response) => {
    res.redirect("/dashboard");
};

export const logout = (req: Request, res: Response) => {
    req.logout((err) => {
        if(err) {
            res.status(400).json({ message: 'Could not log out' });
            return;
        }
        res.redirect('/');
    });
};

// Not to be used by website.
export const me = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const user = req.user as IUser;
        res.status(200).json({ name: user.name, email: user.email, subdomain: user.subdomain, nameservers: user.nameservers });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
}
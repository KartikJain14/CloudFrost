import { Request, Response } from "express";
import { IUser } from "../interfaces";
import { checkAvailability, deleteNameServers, editNameServers, isValidSubdomain, contactHandler } from "../utils";
import User from "../models/userModel";

// Controller for checking subdomain availability
export const available = async(req: Request, res: Response) => {
    const { subdomain } = req.body;
    if (await checkAvailability(subdomain) === false) {
        res.status(409).send({ available: false });
        return;
    }
    res.status(200).send({ available: true });
};

// Controller for registering a subdomain
export const registerSubdomain = async (req: Request, res: Response) => {
    if(!req.body.subdomain){
        res.status(400).json({message: "Subdomain is required"});
        return;
    }
    if(!req.user){
        res.status(401).json({message: "Sign In Required"});
        return;
    }
    const user = req.user as IUser;
    // Check if user has already registered a subdomain
    if(user.subdomain){
        res.status(400).json({message: "User has already registered a subdomain"});
        return;
    }
    
    const subdomain = req.body.subdomain.toLowerCase();

    // Check if subdomain is available
    const resp: boolean = await checkAvailability(subdomain);
    if(resp===false){
        console.log("Subdomain is not available");
        res.status(400).json({message: "Subdomain is not available"});
        return;
    }

    // Assign the subdomain to the user
    await User.findOneAndUpdate({email: user.email}, { $set: {subdomain: subdomain}});
    res.status(200).json({message: "Subdomain registered successfully"});
};

// Controller for updating subdomain
export const updateSubdomain = async (req: Request, res: Response) => {

    if (!req.user) {
        res.status(401).json({ message: "Sign In Required" });
        return;
    }
    const user = req.user as IUser;
    // Check if user has a registered subdomain
    if (!user.subdomain) {
        res.status(400).json({ message: "No registered subdomain found." });
        return;
    }
    // Check if nameservers are provided in the request and are in correct format
    var reqNameservers = req.body.nameservers;
    if (!reqNameservers || !Array.isArray(reqNameservers)) {
        res.status(400).json({ message: "Nameservers are required in form of array" });
        return;
    }

    // Validate the nameservers
    for (let val of reqNameservers) {
        if (isValidSubdomain(val)===false) {
            res.status(400).json({ message: "Invalid nameserver" });
            return;
        }
    }

    try {
        // Update the nameservers for the user's subdomain
        const userNameservers = await editNameServers(reqNameservers, user.nameservers, user.subdomain);
        // Update the user's nameservers in the database
        const updatedUser = await User.findOneAndUpdate({ email: user.email }, { $set: { nameservers: userNameservers } }, {new: true});
        if (!updatedUser) {
            res.status(500).json({ message: "Error updating subdomain" });
            return;
        }
        res.status(200).json({ message: "Subdomain updated successfully" });
    } catch (error) {
        console.error("Error updating subdomain: ", error);
        res.status(500).json({ message: "Error updating subdomain" });
    }
};

// Deletes every nameserver made by the user and unsets the subdomain
export const deleteSubdomain = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "Sign In Required" });
        return;
    }
    const user = req.user as IUser;
    if (!user.subdomain) {
        res.status(400).json({ message: "No registered subdomain found." });
        return;
    }

    // Delete all the nameservers for the user
    if (user.nameservers){
        await deleteNameServers(user.nameservers);
    }
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser && existingUser.subdomain === null) {
        res.status(400).json({ message: "Subdomain is already deleted." });
        return;
    }
    // Unset the subdomain for the user
    await User.findOneAndUpdate({ email: user.email }, { $unset: { subdomain: 1, nameservers: 1 } });
    res.status(200).json({ message: "Subdomain deleted successfully" });
}

// Controller for sending contact messages
export const contact = async (req: Request, res: Response) => {
    if (!req.body.name || !req.body.email || !req.body.message) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    const body = req.body;
    // Handle the contact form submission
    const success: boolean = await contactHandler(body);
    if (success === true) {
        res.status(200).json({ message: "Message sent successfully" });
    } else {
        res.status(500).json({ message: "Error sending message" });
    }
}
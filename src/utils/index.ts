import User from "../models/userModel";
import { checkAvailabilityCloudflare, createNSRecord, deleteNSRecord, getDomain, updateNSRecord, contact } from "../services/cloudflareService";

// Function to check if a string is a valid part of a domain name and does not have more sub-subdomain
// Eg. "example" is valid since it can be "example.test.com"
// Eg. "sub.example" is invalid since it is a sub-subdomain i.e. "sub.example.test.com"
// This is to prevent overwriting the subdomain of the user
// Trying to create a subdomain "sub.example" would give another user access to the subdomain "sub.example.test.com" whose logical owner should be "example.test.com"

export function isValidFQDN(fqdn: string): boolean {
    fqdn = fqdn + ".test.com";
    const fqdnRegex = /^(?=.{3,63}$)(?![0-9]+$)(?!.*--)(?!.*-$)(?!^[-])([A-Za-z0-9-]{1,63}\.)+[A-Za-z0-9-]{2,20}$/;
    // Returns false if the fqdn has more than one subdomain
    if(fqdn.split('.').length===getDomain().split('.').length + 1) { return false }
    // Now, checks if its a valid fqdn
    return fqdnRegex.test(fqdn);
}

// Function to check if a string is a valid subdomain (used for nameservers)
export function isValidSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^(?=.{3,63}$)(?![0-9]+$)(?!.*--)(?!.*-$)(?!^[-])([A-Za-z0-9-]{1,63}\.)+[A-Za-z0-9-]{2,20}$/;
    return subdomainRegex.test(subdomain);
}

// Function to check if a string is an avaialble subdomain
export async function checkAvailability(subDomain: string): Promise<boolean> {
    // Check if the subdomain is valid
    if(isValidFQDN(subDomain)===false){
        return false;
    }
    // Check if the subdomain already has existing records on cloudflare
    if(checkAvailabilityCloudflare(subDomain)===false){
        return false;
    }
    // Check if the subdomain is already in use by another user
    const user = await User.findOne({subdomain: subDomain});
    if(user){
        return false;
    }
    return true;
}

// Updates the nameservers for the user's subdomain optimally
export async function editNameServers(reqNameservers: string[], nameservers: { id: string, value: string }[] = [], subdomain: string): Promise<{ value: string, id: string }[]> {

    // Remove duplicates from nameservers by value
    const uniqueNameservers = nameservers.reduce((acc, item) => {
        if (!acc.some(existing => existing.value === item.value)) {
            acc.push(item);
        }
        return acc;
    }, [] as { value: string, id: string }[]);

    // Add nameservers that were in both reqNameservers and nameservers (those that are unchanged)
    const updatedNameservers: { value: string, id: string }[] = uniqueNameservers.filter(item => reqNameservers.includes(item.value));

    // Nameservers in the request but not in user's current list
    const toWorkOn = reqNameservers.filter(val => !uniqueNameservers.some(item => item.value === val));

    // Nameservers in the user's current list but not in the request
    const excess = uniqueNameservers.filter(item => !reqNameservers.includes(item.value));

    // Process the nameservers to add or update
    for (const ns of toWorkOn) {
        if (excess.length > 0) {
            // If there are excess nameservers, update the first one
            const ex = excess.pop();
            if (ex) {
                await updateNSRecord(ex.id, ns, subdomain);
                updatedNameservers.push({ value: ns, id: ex.id }); // Reuse the id of excess ns
            }
        } else {
            // Create a new NS record for the nameserver
            const id = await createNSRecord(subdomain, ns);
            if (id && typeof id === 'string') {
                updatedNameservers.push({ value: ns, id: id });
            }
        }
    }

    // Delete excess nameservers that are no longer in the request
    if (excess.length > 0) {
        await Promise.all(excess.map(ex => deleteNSRecord(ex.id)));
    }

    console.log(updatedNameservers);
    return updatedNameservers;
}

// Deletes all the nameservers for the user
export async function deleteNameServers(nameservers: {id: string, value: string}[]): Promise<boolean> {
    var success = true;
    nameservers.forEach(async (ns) => {
        success = success && await deleteNSRecord(ns.id);
    });
    return success;
}

// Function to pas the contact form data to the service (Did not pass it directly from the controller to the service to keep the controller clean)
export async function contactHandler(body: {name: string, email: string, message: string}): Promise<boolean> {
    return await contact(body);
}
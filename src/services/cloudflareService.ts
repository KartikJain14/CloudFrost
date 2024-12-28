import axios from "axios";
import dotenv from 'dotenv';
import { DnsRecord } from "../interfaces";
dotenv.config();

const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || "";
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || "";
// Prefix domain is the domain that will be added before the base domain i.e. sub  => sub.example.com so users can register XYZ.sub.example.com
const PREFIX_DOMAIN = (process.env.PREFIX_DOMAIN || "").toLowerCase();
// Webhook URL to send the contact form data
const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
var BASE_DOMAIN: string;
var DOMAIN: string;
var DnsRecords: DnsRecord[];

// Initialize the variables
async function initialize() {
    BASE_DOMAIN = await getBaseDomain();
    DOMAIN = PREFIX_DOMAIN.length > 0 ? `${PREFIX_DOMAIN}.${BASE_DOMAIN}` : BASE_DOMAIN;
    DnsRecords = await getNSRecords();
}

// Fetch the NS records every 2 minutes and initialize the variables (called by the server once)
export async function fetchNSRecord(time: number = 120) {
    initialize();
    setTimeout(async () => {
      DnsRecords = await getNSRecords();
    }, time * 1000);
}

// Returns the service domain i.e. the base domain above which the users can register their subdomains
// Example: If the base domain is example.com, the service domain will be sub.example.com
// Refer to prefix to understand it clearly
export function getDomain(): String{
    return DOMAIN;
}

// Returns all the dns records fetched from the cloudflare
export function getDNSRecords(): DnsRecord[]{
    return DnsRecords;
}

// Returns the base domain derived from the zone id
async function getBaseDomain(): Promise<string> {
    try {
        const response = await axios.get(
            `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}`, 
            {
                headers: {
                    "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
                }
            });
        return response.data.result.name.toLowerCase();
    } catch (error) {
        console.log(error);
        return "";
    }
}


// Check if there exists a prexisiting record for the subdomain in the cloudflare
export function checkAvailabilityCloudflare(subDomain: string): boolean {
    DnsRecords.some((record: DnsRecord) => {
        if (record.name === subDomain) {
            return false;
        }
    });
    return true;
}

// Actually gets the DNS records from the cloudflare
export async function getNSRecords(): Promise<DnsRecord[]> {
    try {
        const response = await axios.get(
          `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, 
          {
            headers:{
                "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
            }
          });
        
        // Clean up the response and keep only useful data
        const cleanerDnsRecords: DnsRecord[] = response.data.result.map((record: DnsRecord) => ({
            id: record.id,
            name: record.name,
            type: record.type,
            content: record.content,
            comment: record.comment,
            tags: record.tags,
            created_on: record.created_on,
            modified_on: record.modified_on,
        }));
        DnsRecords = cleanerDnsRecords;
        return cleanerDnsRecords;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// Create a new NS record for the subdomain, returns the record id if successful
export async function createNSRecord(subDomain: string, nameserver: string, comment: string = ""): Promise<string | false> {
    try {
        subDomain = subDomain + "." + PREFIX_DOMAIN;
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
            {
                type: 'NS',
                name: subDomain,
                content: nameserver,
                ttl: 3600,
                comment: comment
            },
            {
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        await getNSRecords();
        if (response.data.success) {
            return response.data.result.id;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error creating NS record:', error);
        return false;
    }
}

// Delete a record using the record id
export async function deleteNSRecord(id: string): Promise<boolean> {
    try {
        const response = await axios.delete(
            `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        await getNSRecords();
        return response.data.success;
    } catch (error) {
        console.error('Error deleting NS record:', error);
        return false;
    }
}

// Update the NS record using the record id, to update the nameserver for the subdomain
export async function updateNSRecord(id: string, nameserver: string, subDomain: string): Promise<boolean> {
    try {
        subDomain = subDomain + "." + PREFIX_DOMAIN;
        const response = await axios.put(
            `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`,
            {
                type: 'NS',
                name: subDomain,
                content: nameserver,
                ttl: 3600
            },
            {
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        await getNSRecords();
        return response.data.success;
    } catch (error) {
        console.error('Error updating NS record:', error);
        return false;
    }
}

// Send the contact form data to the webhook
// The webhook will send a POST request to the url with JSON data.content containing the form information
export async function contact(body: {name: string, email: string, message: string}): Promise<boolean> {
    try {
        const response = await axios.post(
            WEBHOOK_URL,
            {
                content: `Name:\n ${body.name}\nEmail:\n ${body.email}\nMessage:\n ${body.message}`
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        if (response.status === 204) {
            return true;
        }
    } catch (error) {
        console.error('Error getting NS record:', error);
    }
    return false;
}
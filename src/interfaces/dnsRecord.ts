// Interface used to define the structure of the DNS record object recieved from cloudflare's response

export interface DnsRecord {
    id: string;
    name: string;
    type: string;
    content: string;
    comment: string | null;
    tags: string[];
    created_on: string;
    modified_on: string;
}
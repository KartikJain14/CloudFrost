// Interface used to define the structure of the users, used in the user model and for type validation

export interface IUser extends Document {
    google_id: string;
    email: string;
    name: string;
    subdomain?: string;
    nameservers?: { id: string; value: string }[];
    verified_email: boolean;
    given_name: string;
    family_name: string;
    picture?: string;
    locale?: string;
    hd?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
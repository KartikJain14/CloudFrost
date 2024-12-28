import mongoose, { Schema } from 'mongoose';

// Define the nameserver schema to be used in the database (part of the user model)
const nameserverSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    }
});

const Nameserver = mongoose.model('nameserver', nameserverSchema);

export { nameserverSchema, Nameserver };
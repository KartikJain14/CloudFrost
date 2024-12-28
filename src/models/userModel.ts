import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces';
import { nameserverSchema } from './nameserverModel';

// Define the user schema with required fields, to be used in the database and the application
const userSchema: Schema<IUser> = new Schema({
  // Returned by Google OAuth
  google_id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  subdomain: {
    type: String,
    // unique is set to false due to conflicts when deassigning the subdomain by setting it to ""
    // unique: true,
    required: false,
  },
  nameservers: {
    // Array of nameservers imported from the nameserverModel
    type: [nameserverSchema],
    required: false,
    // There should be at most 6 nameservers
    validate: {
      validator: function(value: string[]) {
        return value.length <= 6;
      },
      message: 'Nameservers array length should be less than or equal to 6.',
    },
  },
  // Returned by Google OAuth (unnecessary)
  verified_email: {
    type: Boolean,
    required: true,
  },
  given_name: {
    type: String,
    required: true,
  },
  family_name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
  locale: {
    type: String,
    required: true,
  },
  hd: {
    type: String,
    required: false,
  },
},
{
  // Automatically log creation and latest updation timestamps
  timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const objectid = Schema.objectid

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    blog: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blogs',
      },
    ],
  },
  { timestamps: true }
);

const users = mongoose.model('users', userSchema);

module.exports = users;

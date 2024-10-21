const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    author: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    readCount: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: String,
    },
    tags: {
      type: [String],
    },
    body: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  { timestamps: true }
);

const blogs = mongoose.model('blogs', blogSchema);

module.exports = blogs;

import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  published_year: {
    type: Number,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  image_link: {
    type: String,
    required: true,
  },
  pdf_link: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  // New fields with default values
  avg_star_rating: {
    type: Number,
    default: 0,
  },
  num_of_ratings: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  availableCount:{
    type:Number,
    default:2,
  }
});

// Create the model from the schema
export default mongoose.model("Books", bookSchema);

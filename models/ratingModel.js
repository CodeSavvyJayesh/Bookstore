import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    productId: { type: Number,  required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Rating", ratingSchema);

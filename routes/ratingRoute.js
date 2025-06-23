import express from "express";
import { addRating, getRatingsForProduct } from "../controllers/ratingController.js";

const router = express.Router();

router.post("/add-rating", addRating);
router.get("/get-ratings/:productId", getRatingsForProduct);
export default router;

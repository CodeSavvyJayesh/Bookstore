import Rating from "../models/ratingModel.js";
import Books from "../models/productModel.js";
import users from "../models/userModel.js"

/**
 * Add a rating for a book and update book's avg_star_rating & num_of_ratings.
 */
export const addRating = async (req, res) => {
  const { productId, userEmail, stars } = req.body; // Removed `userName`

  try {
    // Fetch user details
    console.log("userEmail:", userEmail);
    const user = await users.findOne({ email: userEmail });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name; // Get the user name

    // Fetch all books
    const productList = await Books.find();
    if (!productList.length) {
      console.log("Product list is empty.");
      return res.status(404).json({ message: "Product list is empty" });
    }

    // Find the book using the custom id field
    const book = productList.find((book) => book.id.toString() === productId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Create and save the new rating
    const newRating = new Rating({ productId, userName, userEmail, stars });
    await newRating.save();

    // Calculate new average rating using the given formula
    const num_of_ratings = book.num_of_ratings + 1;
    const avg_star_rating = (book.avg_star_rating * book.num_of_ratings + stars) / num_of_ratings;

    // Update book with new rating data
    await Books.findOneAndUpdate({ id: productId }, { avg_star_rating, num_of_ratings });

    res.status(201).json({ message: "Rating added successfully!" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get all ratings for a specific book sorted from newest to oldest.
 */
export const getRatingsForProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const ratings = await Rating.find({ productId }).sort({ createdAt: -1 });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

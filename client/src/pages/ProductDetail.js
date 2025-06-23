import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import "../styles/ProductDetail.css";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(new Set());
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [selectedStars, setSelectedStars] = useState(0);
  const { auth } = useAuth();
  const isAuthenticated = auth?.user != null;

  useEffect(() => {
    fetchBookDetails();
    fetchRatings();
    if (isAuthenticated) fetchWishlist();
  }, [id, isAuthenticated]);

  const fetchBookDetails = () => {
    fetch(`http://localhost:8080/api/v1/products/product/${id}`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch((err) => console.error("Error fetching book details:", err));
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/rating/get-ratings/${id}`);
      const data = await res.json();
      setRatings(data);

      const userRated = data.find((r) => r.userEmail === auth?.user?.email);
      setUserRating(userRated);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/wishlist/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: auth.user.email }),
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(new Set(data.items.map((item) => item.productId)));
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleAddRating = async () => {
    if (!selectedStars) {
      toast.error("Please select a rating.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/rating/add-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          stars: selectedStars,
          userName: auth.user.name,
          userEmail: auth.user.email,
        }),
      });

      if (response.ok) {
        toast.success("Rating added!");
        fetchRatings();
      } else {
        toast.error("Failed to add rating.");
      }
    } catch (error) {
      console.error("Error adding rating:", error);
      toast.error("Failed to add rating.");
    }
  };
  const handleAddToCart = async (productId,quantity) => {
    if (!isAuthenticated) {
      toast.error('Login required to add items to cart');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: auth.user.email, productId, quantity }),
      });

      if (response.ok) {
        toast.success('Item added to cart');
      } else {
        toast.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleToggleWishlist = async (productId) => {
      if (!isAuthenticated) {
        toast.error('Login required to add items to wishlist');
        return;
      }
  
      try {
        const method = wishlist.has(productId) ? 'DELETE' : 'POST';
        const response = await fetch(`http://localhost:8080/api/v1/wishlist/${method === 'DELETE' ? 'remove' : 'add'}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: auth.user.email, productId }),
        });
  
        if (response.ok) {
          if (method === 'DELETE') {
            wishlist.delete(productId);
            toast.success('Removed from wishlist');
          } else {
            wishlist.add(productId);
            toast.success('Added to wishlist');
          }
          setWishlist(new Set(wishlist));
        } else {
          toast.error('Failed to update wishlist');
        }
      } catch (error) {
        console.error('Error updating wishlist:', error);
        toast.error('Failed to update wishlist');
      }
    };

  if (!book) return <div>Loading...</div>;

  return (
    <Layout showHeader={true} showFooter={false}>
      <section className="py-5">
        <div className="container">
          <div className="row gx-5">
            <aside className="col-lg-6">
              <div className="border rounded-4 mb-3 d-flex justify-content-center image-container">
                <img className="rounded-4 fit square-image" src={book.image_link} alt={book.title} />
              </div>
            </aside>

            <main className="col-lg-6">
              <h4 className="title text-dark">{book.title}</h4>
              <h5>by {book.author}</h5>
              <div className="mb-3">
                <span className="h5">&#8377; {book.price}</span>
                <span className="text-muted"> / per copy</span>
              </div>
              <div className="mb-3"><strong>Genre:</strong> {book.genre}</div>
              <div className="mb-3"><strong>Available count:</strong> {book.availableCount}</div>
              <p>{book.description}</p>

                <>
                  <div className="row mb-4">
                    <div className="col-md-4 col-6">
                      <label className="mb-2">Quantity</label>
                      <div className="input-group mb-3">
                        <button className="btn border" onClick={() => setQuantity(Math.max(quantity - 1, 1))}>
                          <FontAwesomeIcon icon="minus" />
                        </button>
                        <input type="text" className="form-control text-center" value={quantity} readOnly />
                        <button className="btn border" onClick={() => setQuantity(quantity + 1)}>
                          <FontAwesomeIcon icon="plus" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {book.isAvailable ? (
  <div className="d-flex">
    <button className="btn btn-primary me-2" onClick={() => handleAddToCart(book.id, quantity)}>
      <FontAwesomeIcon icon="shopping-basket" /> Add to Cart
    </button>
    
   
  </div>
) : (
  <div>
    <p className="text-danger">This book is currently unavailable.</p>
    {!wishlist.has(book.id) ? (
      <button className="btn btn-outline-danger" onClick={() => handleToggleWishlist(book.id)}>
        <FontAwesomeIcon icon={["far", "heart"]} /> Add to Wishlist
      </button>
    ) : (
      <button className="btn btn-danger" onClick={() => handleToggleWishlist(book.id)}>
        <FontAwesomeIcon icon="heart" /> Remove from Wishlist
      </button>
    )}
  </div>
)}


                </>
              
            </main>
          </div>

          <hr />

          <h5>Ratings & Reviews</h5>
          {ratings.length === 0 ? (
            <p>No ratings found.</p>
          ) : (
            <div className="ratings-container">
  {ratings.map((r) => (
    <div key={r.userEmail} className="rating-box">
      <div className="profile-section">
        <div className="profile-circle">{r.userName[0]}</div>
        <span className="user-name">{r.userName}</span>
      </div>
      <p className="star-rating">{r.stars} ★</p>
    </div>
  ))}
</div>
          )}

          {!userRating && isAuthenticated && (
            <div className="rate-section">
            <p>Give your rating:</p>
            <div className="star-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${selectedStars >= star ? "selected" : ""}`}
                  onClick={() => setSelectedStars(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <button className="btn btn-success mt-2" onClick={handleAddRating}>
              Submit
            </button>
          </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BookDetail;

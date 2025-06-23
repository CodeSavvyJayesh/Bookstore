// Import the Express module
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import otpRoutes from "./routes/otpRoutes.js";
import ratingRoutes from "./routes/ratingRoute.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import paymentRoutes from "./routes/paymentRoutes.js"
import Books from "./models/productModel.js"

// Create an Express application
const app = express();

// Database connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the e-commerce platform",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/rating", ratingRoutes);
app.use("/api/vi/payment",paymentRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`);
});

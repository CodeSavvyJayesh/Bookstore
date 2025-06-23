import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Books from '../models/productModel.js';

// Place Order Controller
export const placeOrder = async (req, res) => {
  const { email, shippingAddress, orderId, paymentStatus, paymentMode } = req.body;

  try {
    // Step 1: Get the customer's cart
    const cart = await Cart.findOne({ email });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty!" });
    }

    // Step 2: Fetch all book details in a single query
    const productIds = cart.items.map((item) => item.productId);
    const books = await Books.find({ id: { $in: productIds } });

    // Convert books array to a map for efficient lookup
    const booksMap = new Map();
    books.forEach((book) => booksMap.set(book.id, book));

    const orderItems = [];
    const bulkUpdates = [];

    for (const cartItem of cart.items) {
      const book = booksMap.get(cartItem.productId);

      if (!book) {
        return res.status(400).json({ message: `Book with ID ${cartItem.productId} not found.` });
      }

      if (book.availableCount < cartItem.quantity) {
        return res.status(400).json({ message: `Book "${book.title}" is not available in the requested quantity.` });
      }

      // Reduce available count
      book.availableCount -= cartItem.quantity;
      if (book.availableCount === 0) {
        book.isAvailable = false;
      }

      // Push update operation for bulk execution
      bulkUpdates.push({
        updateOne: {
          filter: { id: cartItem.productId },
          update: { availableCount: book.availableCount, isAvailable: book.isAvailable }
        }
      });

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        paymentMode,
        orderId,
        paymentStatus,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      });
    }

    // Step 3: Update all books in a single bulk operation
    if (bulkUpdates.length > 0) {
      await Books.bulkWrite(bulkUpdates);
    }

    // Step 4: Check if an order already exists for this email
    const existingOrder = await Order.findOne({ email });

    if (existingOrder) {
      existingOrder.items.push(...orderItems);
      await existingOrder.save();
    } else {
      await new Order({ email, items: orderItems }).save();
    }

    // Step 5: Empty the cart after placing the order
    await Cart.updateOne({ email }, { $set: { items: [] } });

    return res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// View Orders Controller
export const getOrders = async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Fetch all orders for the customer
    const orders = await Order.find({ email });

    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: "No orders found for this customer!" });
      
    }

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

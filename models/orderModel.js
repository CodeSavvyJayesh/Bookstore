import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      paymentMode: {
        type: String,
        required: true,
       
      },
      shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      date: {
        type: Date,
        default: Date.now, // Automatically set the current date when the item is added
      },
      paymentStatus:{
        type:Boolean,
        required:false,
      },
      orderId:{
        type:String,
        required:false,
      }
    },
  ],
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

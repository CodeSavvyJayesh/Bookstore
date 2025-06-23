import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "./../context/auth.js";
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/ShippingForm.css';

const ShippingForm = ({ onClose, onSubmit, amount }) => {
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        paymentMethod: '',
    });
    const [loading, setLoading] = useState(false);
    const { auth } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const email = auth?.user?.email;
            const address = `${shippingAddress.fullName}, ${shippingAddress.address}`;

            if (shippingAddress.paymentMethod === 'cashOnDelivery') {
                // Cash on Delivery Order
                await placeOrder(email, address, 'cashOnDelivery', true);
                toast.success("Order placed successfully!");
                navigate('/orders');
            } else {
                // Online Payment: Generate Payment Link
                const response = await axios.post('http://localhost:8080/api/vi/payment/generate-payment-link', {
                    mobile: 8010200339,
                    amount: amount // Use dynamic amount
                });

                if (response.data.success) {
                    // **Step 1: Place order with paymentStatus = false**
                    await placeOrder(email, address, 'upiorcard', false, response.data.order_id);
                    
                    // **Step 2: Redirect to payment page**
                    window.location.href = response.data.payment_link;
                }
            }
        } catch (error) {
            toast.error("Error processing order");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async (email, address, paymentMode, paymentStatus, orderId = null) => {
        try {
            await axios.post('/api/v1/orders/place', {
                email,
                orderId,
                paymentMode,
                paymentStatus,
                shippingAddress: {
                    ...shippingAddress,
                    address
                }
            });
            onSubmit();
            onClose();
        } catch (error) {
            toast.error("Error placing order");
            console.error("Error placing order:", error);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }}>
            <Toaster position="top-right" />
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Enter Shipment Details</h5>
                        <button type="button" className="close" onClick={onClose}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <h6>Enter Shipping Address</h6>
                            <input type="text" name="fullName" className="form-control" placeholder="Full Name" value={shippingAddress.fullName} onChange={handleChange} required />
                            <input type="text" name="address" className="form-control" placeholder="Address" value={shippingAddress.address} onChange={handleChange} required />
                            <input type="text" name="city" className="form-control" placeholder="City" value={shippingAddress.city} onChange={handleChange} required />
                            <input type="text" name="postalCode" className="form-control" placeholder="Postal Code" value={shippingAddress.postalCode} onChange={handleChange} required />
                            <h6>Payment Method</h6>
                            <select name="paymentMethod" className="custom-select" value={shippingAddress.paymentMethod} onChange={handleChange} required>
                                <option value="" disabled>Select Payment Method</option>
                                <option value="cashOnDelivery">Cash on Delivery</option>
                                <option value="other">UPI/Card/Other</option>
                            </select>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? 'Processing...' : `Pay ₹${amount} & Submit`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingForm;

import axios from "axios";
import Order from '../models/orderModel.js';
export const generatePaymentLink = async (req, res) => {
    let { mobile, amount } = req.body;

    if (!mobile || !amount) {
        return res.status(400).json({ error: "Mobile number and amount are required." });
    }

    const mobile1 = mobile;
    mobile = formatPhoneNumber(mobile);
    if (!mobile) {
        return res.status(400).json({ error: "Invalid mobile number format." });
    }

    try {
        // ✅ Generate Unique Order ID
        const orderId = `ORDER_${Date.now()}`;

        // ✅ Step 1: Create Payment Link
        const paymentResponse = await axios.post(
            "https://sandbox.cashfree.com/pg/links",
            {
                link_id: orderId,  // Use Order ID as Link ID
                link_amount: amount,
                link_currency: "INR",
                link_purpose: "Payment for services",
                customer_details: {
                    customer_id: `CUST_${mobile1}`,
                    customer_phone: mobile,
                    customer_name: "Test User",
                    customer_email: "test@example.com",
                },
                link_notify: { send_email: false, send_sms: true }, // Notify via SMS
                link_auto_reminders: true,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-version": "2022-09-01",
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_API_KEY,
                },
            }
        );

        // ✅ Extract Payment Link
        const { link_url } = paymentResponse.data;

        res.json({
            success: true,
            order_id: orderId,
            payment_link: link_url || null,
        });
    } catch (error) {
        console.error(error.response?.data || error);
        res.status(500).json({ error: "Failed to generate payment link." });
    }
};

// ✅ Function to format phone numbers properly
const formatPhoneNumber = (number) => {
    number = number.toString().trim().replace(/\D/g, "");
    if (/^(\+91|91)?[6-9]\d{9}$/.test(number)) {
        return number.length === 10 ? `+91${number}` : `+${number}`;
    }
    if (/^\+\d{10,15}$/.test(number)) return number;
    return null;
};

export const checkPaymentStatus = async (req, res) => {
    const { link_id } = req.query; // Use link_id, NOT order_id

    if (!link_id) {
        return res.status(400).json({ error: "link_id is required." });
    }

    try {
        const response = await axios.get(
            `https://sandbox.cashfree.com/pg/links/${link_id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-version": "2022-09-01",
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_API_KEY,
                },
            }
        );

        res.json({
            success: true,
            link_id: link_id,
            status: response.data.link_status, // Payment status
            payment_method: response.data.payment_method || "N/A",
            amount_paid: response.data.amount_paid || 0,
            transaction_id: response.data.transaction_id || null,
            customer_email: response.data.customer_email || null,
        });
    } catch (error) {
        console.error(error.response?.data || error);
        res.status(500).json({ error: "Failed to fetch payment status." });
    }
};
export const checkAndUpdatePaymentStatus = async (req, res) => {
    const { email } = req.body;
    console.log("i am in controller")
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }
  
    try {
        // Step 1: Fetch the latest order
        const userOrders = await Order.findOne({ email });
  
        if (!userOrders || userOrders.items.length === 0) {
            return res.status(404).json({ error: "No orders found for this customer!" });
        }
  
        // Step 2: Find the latest order item
        const latestOrder = userOrders.items.reduce((latest, order) =>
            !latest || order.date > latest.date ? order : latest, null
        );
  
        if (!latestOrder) {
            return res.status(404).json({ error: "No valid orders found." });
        }
  
        // Step 3: Check payment mode and status
        if (latestOrder.paymentMode !== "upiorcard" || latestOrder.paymentStatus) {
            return res.status(200).json({ message: "No pending payments to check." });
        }
  
        const { orderId } = latestOrder;
        if (!orderId) {
            return res.status(400).json({ error: "Order ID is missing." });
        }
  
        // Step 4: Fetch payment status from Cashfree
        const response = await axios.get(
            `https://sandbox.cashfree.com/pg/links/${orderId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-version": "2022-09-01",
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_API_KEY,
                },
            }
        );
        const paymentStatus = response.data.link_status; // PAID or ACTIVE
  
        // Step 5: Update payment status if paid
        if (paymentStatus === "PAID") {
            await Order.updateOne(
                { email, "items.orderId": orderId },
                { $set: { "items.$[elem].paymentStatus": true } },
                { arrayFilters: [{ "elem.orderId": orderId }] }
            );
  
            return res.status(200).json({ message: "Payment status updated successfully!" });
        }
  
        return res.status(200).json({ message: "Payment is still active or pending." });
  
    } catch (error) {
        console.log("error:",error)
        console.error("Error checking payment status:", error.response?.data || error);
        return res.status(500).json({ error: "Failed to fetch or update payment status." });
    }
  };


import express from "express";
import { generatePaymentLink,checkPaymentStatus, checkAndUpdatePaymentStatus} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/generate-payment-link", generatePaymentLink);
router.get("/check-payment-status", checkPaymentStatus);
router.post("/update-status",checkAndUpdatePaymentStatus)

export default router;

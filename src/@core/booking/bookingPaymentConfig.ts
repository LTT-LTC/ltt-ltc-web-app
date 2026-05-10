/**
 * Temporary: force booking completion success after card + OTP (no real gateway).
 * Set NEXT_PUBLIC_BOOKING_PAYMENT_MOCK_SUCCESS=false when integrating real payment.
 */
export const BOOKING_PAYMENT_MOCK_SUCCESS =
    typeof process.env.NEXT_PUBLIC_BOOKING_PAYMENT_MOCK_SUCCESS !== "undefined"
        ? process.env.NEXT_PUBLIC_BOOKING_PAYMENT_MOCK_SUCCESS === "true"
        : true;

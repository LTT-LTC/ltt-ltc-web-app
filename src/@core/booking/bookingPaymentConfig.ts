/**
 * Dev-only: simulate instant booking success on /processing without VNPAY redirect.
 * Production-like flows use VNPAY (card → OTP → sandbox URL); leave this false.
 *
 * QA checklist when PaymentRequests rows are missing:
 * - FE sends X-Tenant (tenant GUID) on payment-service calls; must match an ABP tenant.
 * - Customer must be logged in (create-payment-url is authorized).
 * - Payment API appsettings: VnPay TmnCode, HashSecret, PaymentUrl, PublicBaseUrl,
 *   FrontendSuccessUrl / FrontendFailureUrl.
 * - Integration: PaymentCustomerIntegrationOptions CustomerServiceBaseUrl +
 *   CustomerServiceInternalApiKey must match customer InternalApi:PaymentServiceApiKey
 *   so IPN/return can mark the booking PAID.
 */
export const BOOKING_PAYMENT_MOCK_SUCCESS =
    typeof process.env.NEXT_PUBLIC_BOOKING_PAYMENT_MOCK_SUCCESS !== "undefined"
        ? process.env.NEXT_PUBLIC_BOOKING_PAYMENT_MOCK_SUCCESS === "true"
        : false;

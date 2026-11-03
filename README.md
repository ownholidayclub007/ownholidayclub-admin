# OHC Admin Panel - Management Dashboard

This is the administrative interface for **Own Holiday Club**. It allows authorized personnel to manage website content, monitor activity, and handle user memberships.

## 🛠 Features
*   **Activity Logs**: Integrated audit trail with field-level change detection.
*   **Hero Slider**: Dynamic management of homepage slides with image upload support.
*   **CMS Management**: Specialized editors for Blogs, Services, and SEO metadata.
*   **Membership Tiers**: Real-time updates to pricing and package features.
*   **User Management**: Secure admin role management and session control.
*   **Manual Memberships**: Admins can record an offline payment and automatically email the invoice, without OTP verification.

## Manual Memberships
Open **Membership Section → Manual Membership** and enter the member's name, email, mobile, permanent address, membership plan, and offline payment details. Date of birth, gender, occupation, marital/family details, correspondence/office addresses, and documents are optional. Selecting **Single** hides and clears spouse, anniversary, child, and spouse-ID fields. Uploaded profile images, ID proof, address proof, and spouse ID (when applicable) are encrypted by the backend; configure `MEMBER_DOCUMENTS_ENCRYPTION_KEY` on the backend before saving files. If available, enter the Razorpay Order ID and Payment ID in their optional fields. The Razorpay Payment ID is shown in payment history and the invoice's payment-ID field; the Order ID is retained separately. If no Payment ID is entered, the system's internal `MANUAL-...` ID is used for payment history. The manual membership flow does not use Razorpay checkout or verify the entered Razorpay ID. The invoice is generated and stored with the payment record, then emailed as a PDF attachment. To retry a failed email, open the member profile and use **Send/Resend** on the captured payment.

## 🏗 Setup
1. `npm install`
2. Configure `.env` with the backend API URL.
3. `npm run dev` to start the development server.

## 🎨 Design System
The panel uses a custom **Red & Slate** luxury theme, utilizing Lucide icons and a responsive grid layout optimized for administrative tasks.

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

## Influencer referral accounts
Admins can open **Analytics Section → Influencer Accounts** to create influencer logins, link existing unassigned referral codes, edit or disable accounts, reset passwords, and delete logins. Existing codes—including their membership totals—are linked in place, not recreated. Deleting an influencer login preserves the referral records and membership counts.

The **Referral Codes** page also shows the linked login username alongside each VP name. New accounts use the referral code as their username. Admins can edit the VP name/code, toggle the code status, create a login for an existing code, reset its password, or delete the code. Each account receives a unique, short password based on its referral code. The password is masked in the table by default and can be revealed with its eye control; the backend must have a stable `INFLUENCER_CREDENTIALS_ENCRYPTION_KEY` configured for this admin-only view. Passwords are hashed for login and encrypted at rest for the admin view.

Influencers use the **Influencer Login** option on the existing login page. Their separate dashboard displays only their own referral codes and membership totals; it does not show member identities or admin features. For the Postman account-creation endpoint, request bodies, and authorization requirements, see the backend README's **Create an influencer from Postman** section.

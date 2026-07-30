import { Routes, Route, Navigate } from "react-router-dom";

/* layouts */
import LoginPage from "../layout/LoginPage";
import AdminLayout from "../layout/AdminLayout";

/* pages */
import Dashboard from "../pages/Dashboard";
import ManageAdmins from "../pages/ManageAdmins";
import ChangePassword from "../pages/ChangePassword";
import ManageLeads from "../pages/ManageLeads";
import ManageMembership from "../pages/ManageMembership";
import ManageMembers from "../pages/ManageMembers";
import MemberProfile from "../pages/MemberProfile";
import ExploreServices from "../pages/ExploreServices";
import HomeSlider from "../pages/HomeSlider";
import Destinations from "../pages/Destinations";
import DestinationDetails from "../pages/DestinationDetails";
import DestinationsList from "../pages/DestinationsList";
import ServiceDetails from "../pages/ServiceDetails";
import ServicesList from "../pages/ServicesList";
import SubServicesManagement from "../pages/Services/SubServicesManagement";
import DestinationEnquiries from "../pages/DestinationEnquiries";
import ContactEnquiries from "../pages/ContactEnquiries";
import Settings from "../pages/Settings";
import FaqManagement from "../pages/FaqManagement";
import WhyChooseUsManagement from "../pages/WhyChooseUsManagement";
import ServiceEnquiries from "../pages/ServiceEnquiries";
import CallbackRequests from "../pages/CallbackRequests";
import LeadPartners from "../pages/LeadPartners";
import HeroImages from "../pages/HeroImages";
import AddBlog from "../pages/AddBlog";
import BlogsList from "../pages/BlogsList";
import AddSeo from "../pages/AddSeo";
import SeoList from "../pages/SeoList";
import SocialMedia from "../pages/SocialMedia";
import ActivityLogs from "../pages/ActivityLogs";
import HolidayBookings from "../pages/HolidayBookings";
import AppGallery from "../pages/AppGallery";
import AppVideoGallery from "../pages/AppVideoGallery";
import AddBudget from "../pages/AddBudget";

/* Protected */
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔓 PUBLIC */}
      <Route path="/login" element={<LoginPage />} />

      {/* 🔐 PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin-users" element={<ManageAdmins />} />
          <Route path="destination-enquiries" element={<DestinationEnquiries />} />
          <Route path="contact-enquiries" element={<ContactEnquiries />} />
          <Route path="settings" element={<Settings />} />
          <Route path="faq-management" element={<FaqManagement />} />
          <Route path="why-choose-us" element={<WhyChooseUsManagement />} />
          <Route path="service-enquiries" element={<ServiceEnquiries />} />
          <Route path="callback-requests" element={<CallbackRequests />} />
          <Route path="lead-partners" element={<LeadPartners />} />
          <Route path="hero-images" element={<HeroImages />} />
          <Route path="hero-images/:id" element={<HeroImages />} />
          <Route path="add-membership" element={<ManageMembership />} />
          <Route path="membership-list" element={<ManageMembership />} />
          <Route path="members-list" element={<ManageMembers />} />
          <Route path="holiday-bookings" element={<HolidayBookings />} />
          <Route path="member-profile/:id" element={<MemberProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="explore-services" element={<ExploreServices />} />
          <Route path="home-slider" element={<HomeSlider />} />
          <Route path="add-destination" element={<Destinations />} />
          <Route path="destination-details" element={<DestinationDetails />} />
          <Route path="destinations-list" element={<DestinationsList />} />
          <Route path="service-details" element={<ServiceDetails />} />
          <Route path="services-list" element={<ServicesList />} />
          <Route path="service-categories" element={<SubServicesManagement />} />
          <Route path="add-blogs" element={<AddBlog />} />
          <Route path="blogs-list" element={<BlogsList />} />
          <Route path="add-meta" element={<AddSeo />} />
          <Route path="meta-list" element={<SeoList />} />
          <Route path="social-media" element={<SocialMedia />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="app-gallery" element={<AppGallery />} />
          <Route path="app-video-gallery" element={<AppVideoGallery />} />
          <Route path="add-budget" element={<AddBudget />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

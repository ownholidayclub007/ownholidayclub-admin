import {
  LayoutDashboard,
  Users,
  MapPin,
  Briefcase,
  BookOpen,
  Images,
  Lock,
  Settings,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  Share2,
  Mail,
  Activity,
  ShieldCheck,
  ShieldPlus,
  HelpCircle,
  FileText,
  List,
  Plane,
  Hotel,
  Globe,
  Star,
  CreditCard,
  Newspaper,
  UserCheck,
  Info,
  Phone,
} from "lucide-react";

export const menuItems = [
  /* ================= ANALYTICS SECTION ================= */
  {
    type: "heading",
    label: "Analytics Section",
  },
  {
    type: "item",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    type: "item",
    label: "Activity Logs",
    icon: Activity,
    path: "/activity-logs",
  },

  /* ================= HOME SECTION ================= */
  {
    type: "heading",
    label: "Home Section",
  },
  {
    type: "item",
    label: "Home Slider",
    icon: Images,
    path: "/home-slider",
  },
  // {
  //   type: "item",
  //   label: "About Us",
  //   icon: Info,
  //   path: "/about-us",
  // },
  {
    type: "item",
    label: "Why Choose Us",
    icon: HelpCircle,
    path: "/why-choose-us",
  },
  // {
  //   type: "item",
  //   label: "Stats Counter",
  //   icon: TrendingUp,
  //   path: "/stats-counter",
  // },
  {
    type: "dropdown",
    label: "Testimonials",
    icon: Star,
    children: [
      { label: "Add Testimonial", path: "/add-testimonials" },
      { label: "Testimonials List", path: "/testimonials-list" },
    ],
  },

  /* ================= BACKGROUND IMAGES SECTION ================= */
  {
    type: "heading",
    label: "BACKGROUND IMAGES SECTION",
  },
  {
    type: "item",
    label: "Background Images",
    icon: Globe,
    path: "/hero-images",
  },

  /* ================= FAQ SECTION ================= */
  {
    type: "heading",
    label: "FAQ Section",
  },
  {
    type: "item",
    label: "Add Faq",
    icon: HelpCircle,
    path: "/faq-management",
  },

  /* ================= DESTINATIONS SECTION ================= */
  {
    type: "heading",
    label: "Destinations Section",
  },
  {
    type: "dropdown",
    label: "Destinations",
    icon: MapPin,
    children: [
      { label: "Add Destination", path: "/add-destination" },
      { label: "Destination Details", path: "/destination-details" },
      { label: "Destinations List", path: "/destinations-list" },
    ],
  },

  /* ================= SERVICES SECTION ================= */
  {
    type: "heading",
    label: "Services Section",
  },
  {
    type: "dropdown",
    label: "Services",
    icon: Briefcase,
    children: [
      { label: "Add Service", path: "/explore-services" },
      { label: "Service Details", path: "/service-details" },
      { label: "Services List", path: "/services-list" },
      { label: "Manage Categories", path: "/service-categories" },
    ],
  },

  /* ================= ENQUIRY SECTION ================= */
  {
    type: "heading",
    label: "Enquiry Section",
  },
  {
    type: "item",
    label: "Lead Partners",
    icon: Users,
    path: "/lead-partners",
  },
  {
    type: "item",
    label: "Destination Enquiry",
    icon: MessageSquare,
    path: "/destination-enquiries",
  },
  {
    type: "item",
    label: "Service Enquiry",
    icon: Briefcase,
    path: "/service-enquiries",
  },
    {
    type: "item",
    label: "Callback Requests",
    icon: Phone,
    path: "/callback-requests",
  },
  
  {
    type: "item",
    label: "Contact Enquiry",
    icon: Mail,
    path: "/contact-enquiries",
  },

  /* ================= BUDGET SECTION ================= */
  {
    type: "heading",
    label: "Budget Section",
  },
  {
    type: "item",
    label: "Add Budget",
    icon: Activity, // You can change this icon if needed
    path: "/add-budget",
  },

  /* ================= HOLIDAY PACKAGES ================= */
  // {
  //   type: "heading",
  //   label: "Holiday Packages",
  // },
  // {
  //   type: "dropdown",
  //   label: "Packages",
  //   icon: Plane,
  //   children: [
  //     { label: "Add Package", path: "/add-package" },
  //     { label: "Packages List", path: "/packages-list" },
  //   ],
  // },
  // {
  //   type: "dropdown",
  //   label: "Hotels & Resorts",
  //   icon: Hotel,
  //   children: [
  //     { label: "Add Hotel", path: "/add-hotel" },
  //     { label: "Hotels List", path: "/hotels-list" },
  //   ],
  // },

  /* ================= MEMBERSHIP SECTION ================= */
  {
    type: "heading",
    label: "Membership Section",
  },
  {
    type: "item",
    label: "Add Memberships",
    icon: CreditCard,
    path: "/membership-list",
  },
  {
    type: "item",
    label: "Members List",
    icon: Users,
    path: "/members-list",
  },
  {
    type: "item",
    label: "Holiday Bookings",
    icon: CalendarCheck,
    path: "/holiday-bookings",
  },

  /* ================= MEDIA SECTION ================= */
  // {
  //   type: "heading",
  //   label: "Media Section",
  // },
  // {
  //   type: "item",
  //   label: "Gallery",
  //   icon: Images,
  //   path: "/gallery",
  // },

  /* ================= BLOGS SECTION ================= */
  {
    type: "heading",
    label: "Blogs Section",
  },
  {
    type: "dropdown",
    label: "Blogs",
    icon: Newspaper,
    children: [
      { label: "Add Blog", path: "/add-blogs" },
      { label: "Blogs List", path: "/blogs-list" },
    ],
  },

  /* ================= APP GALLERY SECTION ================= */
  {
    type: "heading",
    label: "App Gallery Section",
  },
  {
    type: "item",
    label: "Add Images",
    icon: Images,
    path: "/app-gallery",
  },
  {
    type: "item",
    label: "Add Video",
    icon: Images,
    path: "/app-video-gallery",
  },

  /* ================= SEO SECTION ================= */
  {
    type: "heading",
    label: "SEO Section",
  },
  {
    type: "dropdown",
    label: "SEO Manager",
    icon: TrendingUp,
    children: [
      { label: "Add Meta", path: "/add-meta" },
      { label: "Meta List", path: "/meta-list" },
    ],
  },
  {
    type: "item",
    label: "Social Media",
    icon: Share2,
    path: "/social-media",
  },

  /* ================= LOGS SECTION ================= */
  // {
  //   type: "heading",
  //   label: "Logs Section",
  // },
  // {
  //   type: "item",
  //   label: "Email Logs",
  //   icon: Mail,
  //   path: "/email-logs",
  // },

  /* ================= REQUEST SECTION ================= */
  // {
  //   type: "heading",
  //   label: "Request Section",
  // },


  /* ================= ACCOUNT SECTION ================= */
  {
    type: "heading",
    label: "Account Section",
  },
  {
    type: "item",
    label: "Manage Admin Users",
    icon: ShieldCheck,
    path: "/admin-users",
  },
  {
    type: "item",
    label: "Change Password",
    icon: Lock,
    path: "/change-password",
  },
  {
    type: "item",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

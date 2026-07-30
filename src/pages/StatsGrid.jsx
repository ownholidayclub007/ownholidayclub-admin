import React from "react";
import {
  Users,
  TrendingUp,
  MapPin,
  Briefcase,
  PhoneCall,
  MessageSquare,
  Newspaper,
  CreditCard,
} from "lucide-react";

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = React.useState(0);
  
  const numericPart = React.useMemo(() => {
    const stringVal = String(value);
    const matches = stringVal.match(/[\d,.]+/);
    return matches ? matches[0] : "";
  }, [value]);

  const numericValue = React.useMemo(() => {
    return parseFloat(numericPart.replace(/,/g, "")) || 0;
  }, [numericPart]);

  const prefix = React.useMemo(() => {
    const stringVal = String(value);
    const index = stringVal.indexOf(numericPart);
    return index > 0 ? stringVal.substring(0, index) : "";
  }, [value, numericPart]);

  const suffix = React.useMemo(() => {
    const stringVal = String(value);
    const index = stringVal.indexOf(numericPart);
    return index >= 0 ? stringVal.substring(index + numericPart.length) : "";
  }, [value, numericPart]);

  React.useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeValue = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      const currentCount = easeValue * numericValue;
      setCount(currentCount);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue, duration]);

  const displayValue = React.useMemo(() => {
    if (numericValue % 1 === 0) {
      return Math.floor(count).toLocaleString();
    }
    return count.toFixed(1);
  }, [count, numericValue]);

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

const StatsGrid = ({ stats }) => {
  const displayStats = [
    {
      title: "TOTAL MEMBERS",
      value: stats?.totalMembers || 0,
      desc: "Club members",
      icon: Users,
      iconBg: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "TOTAL REVENUE",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      desc: "Total earnings",
      icon: TrendingUp,
      iconBg: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "DESTINATION ENQUIRIES",
      value: stats?.destinationEnquiries || 0,
      desc: "Popular destinations",
      icon: MapPin,
      iconBg: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      title: "SERVICE ENQUIRIES",
      value: stats?.serviceEnquiries || 0,
      desc: "Service leads",
      icon: Briefcase,
      iconBg: "bg-cyan-500",
      bg: "bg-cyan-50",
      text: "text-cyan-600",
    },
    {
      title: "CALLBACK REQUESTS",
      value: stats?.callbackRequests || 0,
      desc: "Pending callbacks",
      icon: PhoneCall,
      iconBg: "bg-rose-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
    {
      title: "CONTACT ENQUIRIES",
      value: stats?.contactEnquiries || 0,
      desc: "Website enquiries",
      icon: MessageSquare,
      iconBg: "bg-indigo-500",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      title: "TOTAL BLOGS",
      value: stats?.totalBlogs || 0,
      desc: "Published blogs",
      icon: Newspaper,
      iconBg: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "MEMBERSHIP PLANS",
      value: stats?.totalMembershipPackages || 0,
      desc: "Active packages",
      icon: CreditCard,
      iconBg: "bg-pink-500",
      bg: "bg-pink-50",
      text: "text-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="group relative bg-gradient-to-br from-slate-50 to-slate-100 p-5 border-2 border-slate-200 transition-all duration-500 shadow-[0_6px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div
                className={`absolute top-0 right-0 w-60 h-60 ${item.iconBg} opacity-15 rounded-full -mr-20 -mt-20 transition-all duration-1000 ease-out group-hover:-mr-10 group-hover:-mt-10`}
              />
              <div
                className={`absolute bottom-0 left-0 w-32 h-32 ${item.iconBg} opacity-15 rounded-full -ml-16 -mb-16 transition-all duration-1000 ease-out group-hover:-ml-8 group-hover:-mb-8`}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 bg-gradient-to-br ${item.iconBg} ${item.iconBg.replace("500", "600")} flex items-center justify-center shadow-md border border-gray-200`}
                  >
                    <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                  </div>

                  <p className="text-[12px] font-bold text-gray-800 uppercase tracking-wide">
                    {item.title}
                  </p>
                </div>

                <div
                  className={`px-2.5 py-1 text-sm font-bold border-2 ${item.bg} ${item.text} ${item.iconBg.replace("bg-", "border-")}`}
                >
                  {index + 1}
                </div>
              </div>

              <div className="mt-1">
                <div className={`!text-2xl font-extrabold ${item.text} mb-0.5 leading-none`}>
                  <AnimatedCounter value={item.value} />
                </div>
                <div className="!text-sm text-gray-700 font-medium tracking-tight">
                  {item.desc}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;

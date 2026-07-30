import { useState, useEffect } from "react";
import {
  Briefcase,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Newspaper,
  CreditCard,
  Users,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import PageHeader from "../components/PageHeader";
import StatsGrid from "./StatsGrid";
import api from "../lib/api";

const COLORS = [
  "#C8102E", // Red
  "#F5A623", // Orange
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#f97316", // Orange-red
  "#84cc16", // Lime
  "#a855f7", // Purple
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("this_month");
  const [customMonth, setCustomMonth] = useState(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/dashboard/stats?filter=${filter}&month=${customMonth}&year=${customYear}&startDate=${startDate}&endDate=${endDate}`);
        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [filter, customMonth, customYear, startDate, endDate]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getCurrentPeriodLabel = () => {
    if (filter === "today") return "Today";
    if (filter === "this_month") return `This Month (${monthNames[new Date().getMonth()]})`;
    if (filter === "last_month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return `Last Month (${monthNames[d.getMonth()]})`;
    }
    if (filter === "this_year") return `This Year (${new Date().getFullYear()})`;
    if (filter === "custom_month") return `${monthNames[customMonth - 1]} ${customYear}`;
    if (filter === "custom_range") {
      if (!startDate && !endDate) return "Custom Range";
      return `Range: ${startDate || "..." } to ${endDate || "..." }`;
    }
    return "";
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Loading Analytics...</p>
        </div>
      </div>
    );
  }
  
  const bookingTrend = data?.analytics?.bookingsTrend?.map(item => ({
    month: monthNames[item._id.month - 1],
    bookings: item.count
  })) || [];

  const enquiryTrend = data?.analytics?.enquiriesTrend?.map(item => ({
    month: monthNames[item._id.month - 1],
    enquiries: item.count
  })) || [];

  const packageDistribution = data?.analytics?.packageDistribution?.map((item, index) => ({
    name: item._id || "Other",
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const revenueData = Object.entries(data?.analytics?.revenueByMonth || {}).map(([key, value]) => {
    const [year, month] = key.split("-");
    return {
      month: monthNames[parseInt(month) - 1],
      revenue: value
    };
  }).sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));

  // Generate last 12 months labels
  const last12Months = [];
  const d = new Date();
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
    last12Months.push(monthNames[monthDate.getMonth()]);
  }

  const combinedTrend = last12Months.map((m) => {
    const b = bookingTrend.find(x => x.month === m)?.bookings || 0;
    const e = enquiryTrend.find(x => x.month === m)?.enquiries || 0;
    const r = revenueData.find(x => x.month === m)?.revenue || 0;
    return { month: m, bookings: b, enquiries: e, revenue: r };
  });

  return (
    <div className="w-full px-1 py-6 transition-colors duration-300">
      <div className="space-y-6">
        <div className="p-4 sm:p-6 shadow-md bg-white border border-gray-100 rounded-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <PageHeader
              title="OWN HOLIDAY CLUB DASHBOARD"
              description="Insights & analytics for your travel & membership business"
            />
            
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Calendar size={14} className="text-[#C8102E]" />
                Viewing: <span className="text-[#C8102E]">{getCurrentPeriodLabel()}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                  <Filter size={14} className="text-slate-400" />
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none text-[13px] font-bold text-slate-700 outline-none cursor-pointer pr-4"
                  >
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_year">This Year</option>
                    <option value="custom_month">Custom Month</option>
                    <option value="custom_range">Custom Date Range</option>
                  </select>
                </div>

                {filter === "custom_range" && (
                  <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-right-2 duration-300">
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white border border-slate-200 text-[12px] font-bold text-slate-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-400">to</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white border border-slate-200 text-[12px] font-bold text-slate-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    />
                  </div>
                )}

                {filter === "custom_month" && (
                  <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-right-2 duration-300">
                    <select 
                      value={customMonth} 
                      onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                      className="bg-white border border-slate-200 text-[13px] font-bold text-slate-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    >
                      {monthNames.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <select 
                      value={customYear} 
                      onChange={(e) => setCustomYear(parseInt(e.target.value))}
                      className="bg-white border border-slate-200 text-[13px] font-bold text-slate-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <StatsGrid stats={data?.stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Growth Trend */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
            <h3 className="font-bold mb-4 text-base text-gray-800 uppercase tracking-wide">
              Booking Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={combinedTrend}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8102E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C8102E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#C8102E"
                  strokeWidth={2.5}
                  fill="url(#bookingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Enquiry Trend */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
            <h3 className="font-bold mb-4 text-base text-gray-800 uppercase tracking-wide">
              Enquiry Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={combinedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Line
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#F5A623"
                  strokeWidth={3}
                  dot={{ fill: "#F5A623", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Package Type Distribution */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
            <h3 className="font-bold mb-4 text-base text-gray-800 uppercase tracking-wide">
              Package Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={packageDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {packageDistribution.map((entry, i) => (
                    <Cell 
                      key={i} 
                      fill={entry.color} 
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  formatter={(value, name) => [`${value} members`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
            <h3 className="font-bold mb-4 text-base text-gray-800 uppercase tracking-wide">
              Monthly Revenue (₹)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={combinedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#C8102E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Enquiries Table */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="font-bold mb-4 text-base text-gray-800 uppercase tracking-wide">
            Recent Callback Requests ({getCurrentPeriodLabel()})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested On</th>
                </tr>
              </thead>
              <tbody>
                {data?.analytics?.recentEnquiries?.map((enq, i) => (
                  <tr key={i} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{enq.name}</td>
                    <td className="px-4 py-3">{enq.email}</td>
                    <td className="px-4 py-3">{enq.phone}</td>
                    <td className="px-4 py-3 uppercase text-[10px] font-bold">{enq.source}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          enq.status === "new"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-medium">
                      {new Date(enq.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

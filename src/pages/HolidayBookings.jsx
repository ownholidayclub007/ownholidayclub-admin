import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  MessageSquare,
  Filter,
  Clock,
  User,
  Mail,
  Smartphone,
  X,
  MapPin,
  Check,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from '../components/CountUp';

const HolidayBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const normalizeStatus = (status) => {
    const s = String(status).toLowerCase();
    if (s === "booking") return "pending";
    if (s === "booked") return "approved";
    return s;
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/members/all-holiday-bookings');
      if (response.data.success) {
        const normalized = (response.data.bookings || []).map(b => ({
          ...b,
          status: normalizeStatus(b.status)
        }));
        setBookings(normalized);
      }
    } catch (error) {
      console.error('Error fetching holiday bookings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch holiday bookings',
        confirmButtonColor: '#C8102E'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (booking, newStatus) => {
    const actionText = newStatus === 'approved' ? 'Approve' : 'Reject';
    const actionColor = newStatus === 'approved' ? '#16a34a' : '#DC2626';

    const { value: adminMessage } = await Swal.fire({
      title: `${actionText} Booking?`,
      text: `Enter a message for the user regarding this ${newStatus} status:`,
      input: 'textarea',
      inputPlaceholder: 'Type your message here...',
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-none' },
      inputValidator: (value) => {
        if (!value && newStatus === 'rejected') {
          return 'You need to write something for rejection!';
        }
      }
    });

    if (adminMessage !== undefined) {
      try {
        await api.put(`/api/members/${booking.userId}/holiday-bookings/${booking._id}/status`, { 
          status: newStatus,
          adminMessage: adminMessage
        });
        
        Swal.fire({
          icon: 'success',
          title: `Booking ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
          text: `The booking has been ${newStatus}.`,
          confirmButtonColor: '#C8102E',
          timer: 1500,
          showConfirmButton: false
        });
        
        if (isViewModalOpen && selectedBooking && selectedBooking._id === booking._id) {
            setIsViewModalOpen(false);
        }
        
        fetchBookings();
      } catch (error) {
        console.error('Status update failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update booking status',
          confirmButtonColor: '#C8102E'
        });
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      booking.userName?.toLowerCase().includes(searchLower) ||
      booking.userEmail?.toLowerCase().includes(searchLower) ||
      booking.userMobile?.toLowerCase().includes(searchLower) ||
      booking.membershipId?.toLowerCase().includes(searchLower) ||
      booking.place?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "60px",
      render: (_, index) => (
        <span className="text-xs font-bold text-gray-400">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: "member",
      label: "MEMBER INFO",
      render: (row) => {
        const otherBookings = bookings.filter(b => b.userId === row.userId && b._id !== row._id);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
              {row.userName}
            </span>
            <span className="text-[10px] text-blue-600 font-bold uppercase">
              ID: {row.membershipId || "N/A"}
            </span>
            <div className="mt-1 flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-500 font-medium">{row.userEmail}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-gray-500 font-medium">{row.userMobile}</span>
                {otherBookings.length > 0 && (
                  <button 
                    onClick={() => setSearchTerm(row.membershipId || row.userEmail || row.userName)}
                    className="text-[9px] font-bold text-red-600 uppercase tracking-wider hover:text-red-800 transition-colors cursor-pointer"
                  >
                    + {otherBookings.length} MORE BOOKING{otherBookings.length > 1 ? 'S' : ''}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "destination",
      label: "DESTINATION",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-tight max-w-[150px] truncate">
            {row.place || "N/A"}
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">
            Slot: #{row.slotNumber}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            {row.adults} Adults, {row.kids} Kids
          </span>
        </div>
      ),
    },
    {
      key: "dates",
      label: "DATES",
      render: (row) => {
        const checkIn = new Date(row.checkIn);
        const checkOut = new Date(row.checkOut);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-bold text-green-600 w-5">IN:</span>
               <span className="text-xs font-bold text-gray-700">{checkIn.toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-bold text-red-600 w-5">OUT:</span>
               <span className="text-xs font-bold text-gray-700">{checkOut.toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "date",
      label: "REQUESTED ON",
      render: (row) => {
        const date = new Date(row.requestedAt);
        return (
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-50 rounded-lg">
                <Clock size={14} className="text-slate-400" />
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700">
                  {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
             </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <span className={`inline-flex items-center justify-center h-6 px-2.5 rounded text-[9px] font-black uppercase tracking-wider ${
          row.status === "pending"
            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
            : row.status === "approved"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
        key: "actions",
        label: "ACTIONS",
        render: (row) => (
            <div className="flex items-center gap-2">
                <button onClick={() => handleViewBooking(row)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded" title="View Details">
                    <Eye size={14} />
                </button>
                {row.status !== 'approved' && (
                    <button onClick={() => handleUpdateStatus(row, 'approved')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 transition-colors rounded" title="Approve">
                        <Check size={14} />
                    </button>
                )}
                {row.status !== 'rejected' && (
                    <button onClick={() => handleUpdateStatus(row, 'rejected')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded" title="Reject">
                        <XCircle size={14} />
                    </button>
                )}
            </div>
        )
    }
  ];

  return (
    <div className="w-full">
      <div className="space-y-6 bg-white p-8 border-2 border-gray-200 mt-6 rounded-none shadow-md">
        <PageHeader
          title="HOLIDAY BOOKINGS"
          description="Manage and track holiday requests from club members"
        />

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#EFF6FF]/50 p-4 border-2 border-blue-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Total Bookings</p>
                <div className="h-0.5 w-8 bg-blue-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-[#1e3a8a]">
               <CountUp end={stats.total} />
             </h3>
          </div>

          <div className="bg-[#FFFBEB]/50 p-4 border-2 border-yellow-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider">Pending</p>
                <div className="h-0.5 w-8 bg-yellow-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-yellow-700">
               <CountUp end={stats.pending} />
             </h3>
          </div>

          <div className="bg-[#F0FDF4]/50 p-4 border-2 border-green-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Approved</p>
                <div className="h-0.5 w-8 bg-green-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-green-700">
               <CountUp end={stats.approved} />
             </h3>
          </div>

          <div className="bg-[#FEF2F2]/50 p-4 border-2 border-red-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Rejected</p>
                <div className="h-0.5 w-8 bg-red-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-red-700">
               <CountUp end={stats.rejected} />
             </h3>
          </div>
        </div>

        {/* Filters and Table Container */}
        <div className="bg-white border-2 border-gray-100 shadow-lg rounded-none overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-100 bg-[#1e3a8a] flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative w-full md:w-80 flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, phone or place..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-10 text-[13px] border-none rounded-none focus:outline-none transition-all bg-white text-gray-900 font-semibold placeholder:text-gray-400 shadow-inner"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
             </div>
             
             <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-white/80" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 text-[11px] font-bold text-gray-800 border-none bg-white focus:ring-0 cursor-pointer uppercase tracking-widest px-4 shadow-inner"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
             </div>
          </div>

          <div className="bg-white overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedBookings}
                wrapperClassName="border-none shadow-none min-w-[900px]"
                rowClassName="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                theadClassName="bg-[#C8102E] text-white !border-none uppercase text-[11px] font-bold tracking-wider"
              />
            )}
          </div>

          <div className="bg-white px-4 py-3 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredBookings.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              label="holiday bookings"
            />
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: "400" }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#C8102E] text-white shrink-0">
                <div className="flex items-center gap-3">
                    <Calendar size={18} />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Holiday Booking Details</h3>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 border border-slate-100">
                            <label className="text-[10px] font-semibold text-gray-450 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Member Info</label>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">{selectedBooking.userName}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={14} className="text-blue-600" />
                                    {selectedBooking.userEmail}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
                                    <Smartphone size={14} className="text-green-600" />
                                    {selectedBooking.userMobile}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                                    <span className="text-[10px] bg-[#C9A84C] text-white px-2 py-0.5 font-bold tracking-widest uppercase rounded">ID: {selectedBooking.membershipId}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 border border-blue-100">
                            <label className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Destination Info</label>
                            <h4 className="text-sm font-bold text-blue-900 uppercase">{selectedBooking.place}</h4>
                            <p className="text-xs text-blue-700 mt-1 font-bold">Holiday Access Slot #{selectedBooking.slotNumber}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Adults</label>
                                <p className="text-sm font-black text-blue-700">{selectedBooking.adults || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-3 border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Kids</label>
                                <p className="text-sm font-black text-blue-700">{selectedBooking.kids || 0}</p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 border border-slate-100">
                                <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Check In</label>
                                <p className="text-xs font-black text-blue-700">
                                    {selectedBooking.checkIn ? (
                                        <>
                                            {new Date(selectedBooking.checkIn).toLocaleDateString('en-GB')}
                                            {', '}
                                            <span className="text-red-600">{new Date(selectedBooking.checkIn).toLocaleTimeString('en-GB')}</span>
                                        </>
                                    ) : "N/A"}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 border border-slate-100">
                                <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Check Out</label>
                                <p className="text-xs font-black text-blue-700">
                                    {selectedBooking.checkOut ? (
                                        <>
                                            {new Date(selectedBooking.checkOut).toLocaleDateString('en-GB')}
                                            {', '}
                                            <span className="text-red-600">{new Date(selectedBooking.checkOut).toLocaleTimeString('en-GB')}</span>
                                        </>
                                    ) : "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 border border-slate-100">
                            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Status</label>
                            <span className={`inline-flex items-center justify-center h-6 px-2.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              selectedBooking.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : selectedBooking.status === "approved"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {selectedBooking.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-semibold text-gray-800 uppercase tracking-widest block mb-2 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <MessageSquare size={12} /> Admin Message / Feedback
                    </label>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-red-600 font-bold leading-relaxed shadow-sm">
                        {selectedBooking.adminMessage ? `"${selectedBooking.adminMessage}"` : "No message provided yet."}
                    </div>
                </div>

                {/* Other Bookings by this User */}
                {(() => {
                  const otherBookings = bookings.filter(b => b.userId === selectedBooking.userId && b._id !== selectedBooking._id);
                  if (otherBookings.length === 0) return null;
                  
                  return (
                    <div className="pt-4 border-t border-gray-100">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Other Bookings by this Member ({otherBookings.length})
                      </label>
                      <div className="space-y-2">
                        {otherBookings.map(ob => (
                          <div key={ob._id} className="bg-slate-50 p-3 rounded-none border border-slate-100 flex items-center justify-between">
                             <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-800">{ob.place} (Slot #{ob.slotNumber})</span>
                               <span className="text-[10px] text-slate-500">
                                 {new Date(ob.checkIn).toLocaleDateString('en-GB')} - {new Date(ob.checkOut).toLocaleDateString('en-GB')}
                               </span>
                             </div>
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                               ob.status === "pending"
                                 ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                 : ob.status === "approved"
                                 ? "bg-green-50 text-green-700 border border-green-200"
                                 : "bg-red-50 text-red-700 border border-red-200"
                             }`}>
                               {ob.status}
                             </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Booking ID: <span className="text-gray-900 font-black tracking-normal lowercase">{selectedBooking._id}</span></span>
                    <span className="text-blue-600 whitespace-nowrap">Requested on: {new Date(selectedBooking.requestedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                   {selectedBooking.status !== 'approved' && (
                       <button onClick={() => handleUpdateStatus(selectedBooking, 'approved')} className="px-6 py-2 bg-green-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-md rounded-md">
                         Approve
                       </button>
                   )}
                   {selectedBooking.status !== 'rejected' && (
                       <button onClick={() => handleUpdateStatus(selectedBooking, 'rejected')} className="px-6 py-2 bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-md rounded-md">
                         Reject
                       </button>
                   )}
                </div>
                <button 
                   onClick={() => setIsViewModalOpen(false)}
                   className="px-8 py-2.5 bg-gray-200 text-gray-700 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-300 transition-all shadow-sm"
                >
                   Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HolidayBookings;

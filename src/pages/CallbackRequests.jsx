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
  Users,
  PhoneCall,
  Download
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import CountUp from '../components/CountUp';

const CallbackRequests = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
  const isSuperAdmin = adminInfo.role === 'SUPER-ADMIN' || adminInfo.role === 'super-admin';

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/holiday-leads');
      if (response.data.success) {
        setLeads(response.data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch callback requests',
        confirmButtonColor: '#C8102E'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (lead) => {
    const result = await Swal.fire({
      title: 'Delete Request?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-none' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/holiday-leads/${lead._id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Request deleted successfully',
          confirmButtonColor: '#C8102E',
          timer: 1500,
          showConfirmButton: false
        });
        fetchLeads();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete request',
          confirmButtonColor: '#C8102E'
        });
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/holiday-leads/${id}`, { status: newStatus });
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Request status changed to ${newStatus}`,
        confirmButtonColor: '#C8102E',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-none border-2 border-gray-200 shadow-xl' }
      });
      fetchLeads();
    } catch (error) {
      console.error('Status update failed');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    pending: leads.filter(l => l.status === 'pending').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    resolved: leads.filter(l => l.status === 'resolved').length
  };

  const exportToExcel = () => {
    const dataToExport = filteredLeads.map((lead, index) => ({
      "S.NO": index + 1,
      "Name": lead.name,
      "Email": lead.email,
      "Phone": lead.phone,
      "Source": lead.source,
      "Travel Type": lead.travelType,
      "Budget": lead.budget,
      "From Location": lead.location,
      "To Location": lead.searchLocation,
      "Status": lead.status,
      "Check In": lead.checkIn ? new Date(lead.checkIn).toLocaleDateString() : 'N/A',
      "Check Out": lead.checkOut ? new Date(lead.checkOut).toLocaleDateString() : 'N/A',
      "Adults": lead.adults,
      "Kids": lead.kids,
      "Received On": new Date(lead.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Callback Requests");
    XLSX.writeFile(workbook, "Callback_Requests.xlsx");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
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
      key: "name",
      label: "FULL NAME",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            {row.name}
          </span>
          <span className="text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1">
            Source: {row.source}
          </span>
        </div>
      ),
    },
    {
      key: "contact",
      label: "CONTACT DETAILS",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 group">
            <Mail size={12} className="text-[#C8102E]/60 group-hover:text-[#C8102E] transition-colors" />
            <span className="text-xs font-medium text-gray-600">{row.email}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <Smartphone size={12} className="text-[#C8102E]/60 group-hover:text-[#C8102E] transition-colors" />
            <span className="text-xs font-bold text-gray-800 tracking-wider">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "LOCATION",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">FROM -</span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">
              {row.location || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">TO -</span>
            <span className="text-xs font-bold text-[#C8102E] uppercase tracking-tight">
              {row.searchLocation || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "budget",
      label: "BUDGET",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">
            {row.budget || "N/A"}
          </span>
          <span className="text-[10px] text-green-600 font-bold uppercase">
            {row.travelType || "Holiday"}
          </span>
        </div>
      ),
    },
    {
      key: "message",
      label: "MESSAGE",
      render: (row) => (
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 italic max-w-[200px] truncate">
            {row.message || "No message provided"}
          </p>
          <button
            onClick={() => handleViewLead(row)}
            className="text-[10px] font-bold text-[#C8102E] uppercase tracking-tight mt-1 hover:underline text-left"
          >
            View Details
          </button>
        </div>
      )
    },
    {
      key: "date",
      label: "REQUESTED ON",
      render: (row) => {
        const date = new Date(row.createdAt);
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
        <select
          value={row.status}
          disabled={!isSuperAdmin}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className={`h-7 px-1.5 w-[88px] rounded-md text-[9px] font-black uppercase tracking-wider border-2 cursor-pointer transition-all ${
            row.status === "new"
              ? "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300"
              : row.status === "contacted"
              ? "bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300"
              : row.status === "pending"
              ? "bg-yellow-50 text-yellow-700 border-yellow-100 hover:border-yellow-300"
              : "bg-green-50 text-green-700 border-green-100 hover:border-green-300"
          }`}
        >
          <option value="new">New</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
      ),
    },
    {
        key: "actions",
        label: "ACTIONS",
        render: (row) => (
            <div className="flex items-center gap-2">
                <button onClick={() => handleViewLead(row)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded">
                    <Eye size={14} />
                </button>
                {isSuperAdmin && (
                  <button onClick={() => handleDeleteLead(row)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded">
                      <Trash2 size={14} />
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
          title="CALLBACK REQUESTS"
          description="Manage and track callback requests from the website modals"
        />

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-[#EFF6FF]/50 p-4 border-2 border-blue-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Total Requests</p>
                <div className="h-0.5 w-8 bg-blue-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-[#1e3a8a]">
               <CountUp end={stats.total} />
             </h3>
          </div>

          <div className="bg-[#F0FDF4]/50 p-4 border-2 border-green-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">New</p>
                <div className="h-0.5 w-8 bg-green-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-green-700">
               <CountUp end={stats.new} />
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

          <div className="bg-[#F5F3FF]/50 p-4 border-2 border-purple-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Contacted</p>
                <div className="h-0.5 w-8 bg-purple-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-purple-700">
               <CountUp end={stats.contacted} />
             </h3>
          </div>

          <div className="bg-[#F0F9FF]/50 p-4 border-2 border-cyan-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Resolved</p>
                <div className="h-0.5 w-8 bg-cyan-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-cyan-700">
               <CountUp end={stats.resolved} />
             </h3>
          </div>
        </div>

        {/* Filters and Table Container */}
        <div className="bg-white border-2 border-gray-100 shadow-lg rounded-none overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-100 bg-[#1e3a8a] flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 text-[13px] border-none rounded-none focus:outline-none transition-all bg-white text-gray-900 font-semibold placeholder:text-gray-400 shadow-inner"
                />
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
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-[#107C41] hover:bg-[#0B5A2F] text-white px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Download size={14} /> Export
                </button>
             </div>
          </div>

          <div className="bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedLeads}
                wrapperClassName="border-none shadow-none"
                rowClassName="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                theadClassName="bg-[#C8102E] text-white !border-none uppercase text-[11px] font-bold tracking-wider"
              />
            )}
          </div>

          <div className="bg-white px-4 py-3 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredLeads.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              label="callback requests"
            />
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedLead && (
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
              className="relative w-full max-w-2xl bg-white shadow-2xl rounded-none overflow-hidden"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: "400" }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#C8102E] text-white">
                <div className="flex items-center gap-3">
                    <PhoneCall size={18} />
                    <h3 className="text-sm font-black uppercase tracking-wider">Callback Request Details</h3>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 border border-slate-100">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Customer Details</label>
                            <h4 className="text-lg font-black text-slate-800 mb-2">{selectedLead.name}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={14} className="text-blue-600" />
                                    {selectedLead.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
                                    <Smartphone size={14} className="text-green-600" />
                                    {selectedLead.phone}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 border border-blue-100">
                            <label className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Source Info</label>
                            <h4 className="text-sm font-bold text-blue-900 uppercase">{selectedLead.source}</h4>
                            {selectedLead.contextName && <p className="text-xs text-blue-700 mt-1">Context: {selectedLead.contextName}</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 border border-gray-100">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Adults</label>
                                <p className="text-xs font-bold text-slate-700">{selectedLead.adults || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-3 border border-gray-100">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Kids</label>
                                <p className="text-xs font-bold text-slate-700">{selectedLead.kids || 0}</p>
                            </div>
                        </div>

                        {/* Location From & To */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 border border-blue-100">
                                <label className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block mb-1">From (Departure)</label>
                                <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">{selectedLead.location || "N/A"}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 border border-emerald-100">
                                <label className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest block mb-1">To (Destination)</label>
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">{selectedLead.searchLocation || "N/A"}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 border border-slate-100">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Budget</label>
                                <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{selectedLead.budget || "N/A"} ({selectedLead.travelType || "Holiday"})</p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 border border-slate-100">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Check In</label>
                                <p className="text-xs font-bold text-slate-800">{selectedLead.checkIn ? new Date(selectedLead.checkIn).toLocaleDateString('en-GB') : "N/A"}</p>
                            </div>
                            <div className="bg-slate-50 p-3 border border-slate-100">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Check Out</label>
                                <p className="text-xs font-bold text-slate-800">{selectedLead.checkOut ? new Date(selectedLead.checkOut).toLocaleDateString('en-GB') : "N/A"}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 border border-slate-100">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Status</label>
                            <select 
                                value={selectedLead.status}
                                disabled={!isSuperAdmin}
                                onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                                className="w-full text-xs font-black uppercase tracking-widest border-none bg-transparent p-0 cursor-pointer focus:ring-0 text-slate-800 font-bold disabled:opacity-70"
                            >
                                <option value="new">New</option>
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <MessageSquare size={12} /> Message/Notes
                    </label>
                    <div className="bg-slate-50 p-6 rounded-none border border-slate-100 italic font-medium text-slate-700 leading-relaxed shadow-inner">
                        "{selectedLead.message || "No specific requests provided."}"
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>ID: {selectedLead._id}</span>
                    <span className="text-blue-600">Received on: {new Date(selectedLead.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-8 py-2.5 bg-[#C8102E] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#a00d24] transition-all shadow-lg hover:shadow-red-500/20"
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

export default CallbackRequests;

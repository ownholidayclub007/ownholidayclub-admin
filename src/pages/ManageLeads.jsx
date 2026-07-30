import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  MessageSquare,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  Mail,
  Smartphone,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import CountUp from '../components/CountUp';

const ManageLeads = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/holiday-leads');
      setLeads(response.data.leads || []);
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
      customClass: {
        popup: 'rounded-none',
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/holiday-leads/${lead._id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Lead deleted successfully',
          confirmButtonColor: '#C8102E',
          timer: 1500,
          showConfirmButton: false
        });
        fetchLeads();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete lead',
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
        text: `Lead status changed to ${newStatus}`,
        confirmButtonColor: '#C8102E',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-none border-2 border-gray-200 shadow-xl'
        }
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
    
    return matchesSearch && matchesStatus;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleViewLead = (lead) => {
    Swal.fire({
      title: `<div class="text-xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2">Lead Details: ${lead.name}</div>`,
      html: `
        <div class="text-left space-y-4 pt-4">
          <div class="bg-blue-50/80 p-5 border-2 border-blue-100/50">
            <p class="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-4">CONTACT INFORMATION</p>
            <div class="grid grid-cols-1 gap-4">
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><i class="fas fa-user text-xs"></i></div>
                  <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase">Full Name</p>
                    <p class="text-sm font-bold text-gray-900">${lead.name}</p>
                  </div>
               </div>
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><i class="fas fa-envelope text-xs"></i></div>
                  <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase">Email Address</p>
                    <p class="text-sm font-bold text-gray-900">${lead.email}</p>
                  </div>
               </div>
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><i class="fas fa-phone text-xs"></i></div>
                  <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase">Phone Number</p>
                    <p class="text-sm font-bold text-gray-900">${lead.phone}</p>
                  </div>
               </div>
            </div>
          </div>

          <div class="bg-gray-50 p-5 border-2 border-gray-200/50">
            <p class="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">INQUIRY DETAILS</p>
             <div class="space-y-4">
                <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase">Source Context</p>
                    <p class="text-xs font-bold text-gray-800">${lead.contextName || 'General Callback'}</p>
                </div>
                <div>
                    <p class="text-[10px] text-gray-500 font-bold uppercase">Message Content</p>
                    <div class="mt-2 p-4 bg-white border-2 border-gray-100 text-[13px] text-gray-800 leading-relaxed font-medium shadow-inner">
                        "${lead.message || 'No message provided.'}"
                    </div>
                </div>
             </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '550px',
      customClass: {
        popup: 'rounded-none shadow-2xl border-4 border-white',
        htmlContainer: 'p-4'
      }
    });
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
          <span className="text-[10px] text-gray-400 font-medium lowercase">
            via {row.source || "website"}
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
      key: "message",
      label: "MESSAGE",
      render: (row) => (
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 italic max-w-[200px] truncate">
            {row.message || "No message provided"}
          </p>
          <button
            onClick={() => handleViewLead(row)}
            className="text-[10px] font-medium text-[#C8102E] uppercase tracking-tight mt-1 hover:underline text-left"
          >
            View Full Message
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
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className={`h-7 px-1.5 w-[88px] rounded-md text-[9px] font-black uppercase tracking-wider border-2 cursor-pointer transition-all ${
            row.status === "new"
              ? "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300"
              : row.status === "contacted"
              ? "bg-orange-50 text-orange-700 border-orange-100 hover:border-orange-300"
              : "bg-green-50 text-green-700 border-green-100 hover:border-green-300"
          }`}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="space-y-6 bg-white p-8 border-2 border-gray-200 mt-6 rounded-none shadow-md">
        <PageHeader
          title="CALLBACK REQUESTS"
          description="Manage and track holiday callback leads from your website"
        />

        {/* Analytics Summary - Design House Style */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-[#EFF6FF]/50 p-4 border-2 border-blue-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Total Leads</p>
                <div className="h-0.5 w-8 bg-blue-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-[#1e3a8a]">
               <CountUp end={leads.length} />
             </h3>
          </div>

          <div className="bg-[#F0FDF4]/50 p-4 border-2 border-green-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">New</p>
                <div className="h-0.5 w-8 bg-green-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-green-700">
               <CountUp end={leads.filter(l => l.status === 'new').length} />
             </h3>
          </div>

          <div className="bg-[#FFFBEB]/50 p-4 border-2 border-yellow-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider">Pending</p>
                <div className="h-0.5 w-8 bg-yellow-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-yellow-700">
               <CountUp end={0} />
             </h3>
          </div>

          <div className="bg-[#F5F3FF]/50 p-4 border-2 border-purple-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Contacted</p>
                <div className="h-0.5 w-8 bg-purple-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-purple-700">
               <CountUp end={leads.filter(l => l.status === 'contacted').length} />
             </h3>
          </div>

          <div className="bg-[#F0F9FF]/50 p-4 border-2 border-cyan-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Resolved</p>
                <div className="h-0.5 w-8 bg-cyan-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-cyan-700">
               <CountUp end={leads.filter(l => l.status === 'resolved').length} />
             </h3>
          </div>
        </div>

        {/* Filters and Table Container */}
        <div className="bg-white border-2 border-gray-100 shadow-lg rounded-none overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-100 bg-[#1e3a8a] flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 text-[13px] border-none rounded-none focus:outline-none transition-all bg-white text-gray-900 font-semibold placeholder:text-gray-400 shadow-inner"
                />
             </div>
             
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-white/80" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 text-[11px] font-bold text-gray-800 border-none bg-white focus:ring-0 cursor-pointer uppercase tracking-widest px-4 shadow-inner"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New Requests</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
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
                onEdit={handleViewLead}
                onDelete={handleDeleteLead}
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

      {/* View Lead Details Modal */}
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
              className="relative w-full max-w-lg bg-white shadow-2xl rounded-none overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#C8102E] text-white">
                <h3 className="text-sm font-black uppercase tracking-wider">Lead Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                        <p className="text-sm font-bold text-gray-900">{selectedLead.name}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                        <div>
                             <select 
                                value={selectedLead.status || 'new'}
                                onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                                className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-gray-50 border-none cursor-pointer focus:ring-0"
                             >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="resolved">Resolved</option>
                             </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-none bg-blue-50 flex items-center justify-center text-blue-600">
                            <Mail size={18} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                            <p className="text-sm font-medium text-gray-700">{selectedLead.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-none bg-green-50 flex items-center justify-center text-green-600">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                            <p className="text-sm font-medium text-gray-700">{selectedLead.phone}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Message Content</label>
                    <div className="bg-slate-50 p-4 rounded-none border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                            "{selectedLead.message || "No message content provided by the user."}"
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Requested via {selectedLead.source || "Website"}</span>
                    <span>{new Date(selectedLead.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-6 py-2 bg-[#C8102E] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#a00d24] transition-colors"
                 >
                    Done
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageLeads;

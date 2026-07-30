import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Smartphone,
  MapPin,
  Building,
  Package,
  X,
  Filter,
  Eye,
  Trash2,
  MessageSquare,
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

const LeadPartners = () => {
  const [partners, setPartners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
  const isSuperAdmin = adminInfo.role === 'SUPER-ADMIN' || adminInfo.role === 'super-admin';

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/property-listings');
      setPartners(response.data.listings || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch lead partners',
        confirmButtonColor: '#C8102E'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePartner = async (partner) => {
    const result = await Swal.fire({
      title: 'Delete Partner Request?',
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
        await api.delete(`/api/property-listings/${partner._id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Partner request deleted successfully',
          confirmButtonColor: '#C8102E',
          timer: 1500,
          showConfirmButton: false
        });
        fetchPartners();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete partner request',
          confirmButtonColor: '#C8102E'
        });
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/property-listings/${id}/status`, { status: newStatus });
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Partner status changed to ${newStatus}`,
        confirmButtonColor: '#C8102E',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-none border-2 border-gray-200 shadow-xl'
        }
      });
      fetchPartners();
      
      if (selectedPartner && selectedPartner._id === id) {
        setSelectedPartner(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Status update failed');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status',
        confirmButtonColor: '#C8102E'
      });
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.targetDestination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    const dataToExport = filteredPartners.map((p, index) => ({
      "S.NO": index + 1,
      "Partner Name": `${p.firstName} ${p.lastName}`,
      "Property Name": p.propertyName,
      "Email": p.email,
      "Phone": p.phone,
      "Target Destination": p.targetDestination,
      "Package": p.leadPackage,
      "Status": p.status,
      "Requested On": new Date(p.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lead Partners");
    XLSX.writeFile(workbook, "Lead_Partners.xlsx");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPartners = filteredPartners.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
      key: "partner",
      label: "PARTNER & PROPERTY",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            {row.propertyName}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.firstName} {row.lastName}
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
            <Mail size={12} className="text-[#C8102E]/60" />
            <span className="text-xs font-medium text-gray-600">{row.email}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <Smartphone size={12} className="text-[#C8102E]/60" />
            <span className="text-xs font-bold text-gray-800 tracking-wider">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "details",
      label: "PARTNERSHIP TARGET",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-amber-500" />
            <span className="text-xs font-bold text-gray-700 uppercase">{row.targetDestination}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={12} className="text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500 capitalize">{(row.leadPackage || 'pending-selection').replace(/-/g, ' ')}</span>
          </div>
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
            row.status === "pending"
              ? "bg-yellow-50 text-yellow-700 border-yellow-100"
              : row.status === "approved"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedPartner(row);
              setIsViewModalOpen(true);
            }}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors tooltip-trigger"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDeletePartner(row)}
              className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors tooltip-trigger"
              title="Delete Request"
            >
              <Trash2 size={16} />
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
          title="LEAD PARTNERS"
          description="Manage B2B property partners requesting leads for their destinations"
        />

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#EFF6FF]/50 p-4 border-2 border-blue-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Total Partners</p>
                <div className="h-0.5 w-8 bg-blue-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-[#1e3a8a]">
               <CountUp end={partners.length} />
             </h3>
          </div>

          <div className="bg-[#FFFBEB]/50 p-4 border-2 border-yellow-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider">Pending Approval</p>
                <div className="h-0.5 w-8 bg-yellow-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-yellow-700">
               <CountUp end={partners.filter(p => p.status === 'pending').length} />
             </h3>
          </div>

          <div className="bg-[#F0FDF4]/50 p-4 border-2 border-green-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Approved Active</p>
                <div className="h-0.5 w-8 bg-green-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-green-700">
               <CountUp end={partners.filter(p => p.status === 'approved').length} />
             </h3>
          </div>
          
          <div className="bg-[#FEF2F2]/50 p-4 border-2 border-red-200 rounded-none flex flex-col justify-between h-24 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Rejected</p>
                <div className="h-0.5 w-8 bg-red-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-red-700">
               <CountUp end={partners.filter(p => p.status === 'rejected').length} />
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
                  placeholder="Search partner, property, email..."
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
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
                data={paginatedPartners}
                wrapperClassName="border-none shadow-none"
                rowClassName="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                theadClassName="bg-[#C8102E] text-white !border-none uppercase text-[11px] font-bold tracking-wider"
              />
            )}
          </div>

          <div className="bg-white px-4 py-3 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPartners.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              label="partners"
            />
          </div>
        </div>
      </div>

      {/* View Lead Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedPartner && (
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
              className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: "400" }}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#C8102E] text-white">
                <div className="flex items-center gap-3">
                    <Building size={18} />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Partner Request Details</h3>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 border border-slate-100">
                            <label className="text-[10px] font-semibold text-gray-450 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Contact Person</label>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">{selectedPartner.firstName} {selectedPartner.lastName}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={14} className="text-blue-600" />
                                    {selectedPartner.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
                                    <Smartphone size={14} className="text-green-600" />
                                    {selectedPartner.phone}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 border border-blue-100">
                            <label className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Target City</label>
                            <h4 className="text-sm font-bold text-blue-900 uppercase">{selectedPartner.targetDestination}</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-3 border border-slate-100">
                            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Property Info</label>
                            <p className="text-sm font-black text-blue-700">{selectedPartner.propertyName}</p>
                            <p className="text-xs text-gray-500 font-bold uppercase mt-1">{selectedPartner.propertyType}</p>
                        </div>
                        
                        <div className="bg-slate-50 p-3 border border-slate-100">
                            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Package Requested</label>
                            <p className="text-xs font-black text-blue-700 capitalize">
                                {(selectedPartner.leadPackage || 'pending-selection').replace(/-/g, ' ')}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-3 border border-slate-100">
                            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Status</label>
                            <span className={`inline-flex items-center justify-center h-6 px-2.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              selectedPartner.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : selectedPartner.status === "approved"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {selectedPartner.status}
                            </span>
                        </div>
                    </div>
                </div>

                {selectedPartner.address && (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-semibold text-gray-800 uppercase tracking-widest block mb-2 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <MapPin size={12} /> Full Address
                    </label>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-gray-700 font-medium leading-relaxed shadow-sm">
                        {selectedPartner.address}
                    </div>
                  </div>
                )}

                {selectedPartner.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-semibold text-gray-800 uppercase tracking-widest block mb-2 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <MessageSquare size={12} /> Additional Notes / Requirements
                    </label>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-gray-600 font-medium leading-relaxed shadow-sm italic border-l-4 border-l-amber-500">
                        "{selectedPartner.description}"
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Request ID: <span className="text-gray-900 font-black tracking-normal lowercase">{selectedPartner._id}</span></span>
                    <span className="text-blue-600 whitespace-nowrap">Submitted on: {new Date(selectedPartner.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                   {isSuperAdmin && selectedPartner.status !== 'approved' && (
                       <button onClick={() => handleStatusChange(selectedPartner._id, 'approved')} className="px-6 py-2 bg-green-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-md rounded-md">
                         Approve
                       </button>
                   )}
                   {isSuperAdmin && selectedPartner.status !== 'rejected' && (
                       <button onClick={() => handleStatusChange(selectedPartner._id, 'rejected')} className="px-6 py-2 bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-md rounded-md">
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

export default LeadPartners;

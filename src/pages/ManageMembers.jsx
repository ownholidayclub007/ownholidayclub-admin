import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  User,
  Mail,
  Smartphone,
  CreditCard,
  ShieldCheck,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from '../components/CountUp';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
  const isSuperAdmin = adminInfo.role === 'SUPER-ADMIN' || adminInfo.role === 'super-admin';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/members');
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch members list',
        confirmButtonColor: '#C8102E'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (member) => {
    const result = await Swal.fire({
      title: 'Delete Member?',
      text: "This action cannot be undone and will remove all member data",
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
        await api.delete(`/api/members/${member._id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Member removed successfully',
          confirmButtonColor: '#C8102E',
          timer: 1500,
          showConfirmButton: false
        });
        fetchMembers();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete member',
          confirmButtonColor: '#C8102E'
        });
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.mobile?.includes(searchTerm) ||
      member.membershipId?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || member.membership?.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(
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
      key: "member",
      label: "MEMBER INFO",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            {row.name}
          </span>
          <span className="text-[10px] text-[#C8102E] font-bold tracking-normal uppercase">
            ID: {row.membershipId || "PENDING"}
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
            <Mail size={12} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-600">{row.email}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <Smartphone size={12} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-800 tracking-wider">{row.mobile}</span>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      label: "MEMBERSHIP PLAN",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-600">
            {row.membership?.name || "N/A"}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {row.membership?.duration || "N/A"}
          </span>
        </div>
      )
    },
    {
      key: "joined",
      label: "JOINED ON",
      render: (row) => {
        const date = new Date(row.createdAt);
        return (
          <div className="flex items-center gap-2">
             <Calendar size={12} className="text-gray-400" />
             <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-600">
                  {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
             </div>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (row) => {
        const payment = row.payments && row.payments.length > 0 ? row.payments[0] : null;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">
              {payment ? `₹${payment.amount / 100}` : "₹0"}
            </span>
          </div>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "PAYMENT STATUS",
      render: (row) => {
        const payment = row.payments && row.payments.length > 0 ? row.payments[0] : null;
        const status = payment?.status?.toLowerCase() || "pending";
        
        let displayStatus = "PAYMENT PENDING";
        let colorClasses = "bg-yellow-50 text-yellow-700 border-yellow-100";

        if (status === "captured") {
            displayStatus = "PAYMENT COMPLETE";
            colorClasses = "bg-green-50 text-green-700 border-green-100";
        } else if (status === "failed" || status === "rejected") {
            displayStatus = "PAYMENT REJECTED";
            colorClasses = "bg-red-50 text-red-700 border-red-100";
        }

        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${colorClasses}`}>
            {displayStatus}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/member-profile/${row._id}`)}
            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded"
            title="View Profile"
          >
            <Eye size={14} />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDeleteMember(row)}
              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded"
              title="Delete Member"
            >
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
          title="MEMBERS MANAGEMENT"
          description="View and manage all registered club members and their plans"
        />

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#EFF6FF]/50 p-5 border-2 border-blue-200 rounded-none flex flex-col justify-between h-28 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Total Members</p>
                <div className="h-0.5 w-8 bg-blue-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-[#1e3a8a]">
               <CountUp end={members.length} />
             </h3>
          </div>

          <div className="bg-[#F0FDF4]/50 p-5 border-2 border-green-200 rounded-none flex flex-col justify-between h-28 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Active Members</p>
                <div className="h-0.5 w-8 bg-green-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-green-700">
               <CountUp end={members.filter(m => m.membership?.status?.toLowerCase() === 'active').length} />
             </h3>
          </div>

          <div className="bg-[#FEF2F2]/50 p-5 border-2 border-red-200 rounded-none flex flex-col justify-between h-28 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Inactive</p>
                <div className="h-0.5 w-8 bg-red-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-red-700">
               <CountUp end={members.filter(m => m.membership?.status?.toLowerCase() === 'inactive').length} />
             </h3>
          </div>

          <div className="bg-[#FFFBEB]/50 p-5 border-2 border-yellow-200 rounded-none flex flex-col justify-between h-28 shadow-sm">
             <div>
                <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider">Payments Pending</p>
                <div className="h-0.5 w-8 bg-yellow-400 mt-1"></div>
             </div>
             <h3 className="text-2xl font-black text-yellow-700">
               <CountUp end={members.filter(m => (m.payments || []).length === 0 || (m.payments && m.payments[0]?.status !== 'captured')).length} />
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
                  placeholder="Search by ID, name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 text-[13px] border-none rounded-none focus:outline-none transition-all bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-tight shadow-inner"
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
                        <option value="active">Active Members</option>
                        <option value="inactive">Inactive Members</option>
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
                data={paginatedMembers}
                wrapperClassName="border-none shadow-none"
                rowClassName="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                theadClassName="bg-[#C8102E] text-white !border-none uppercase text-[11px] font-bold tracking-wider"
              />
            )}
          </div>

          <div className="bg-white px-4 py-3 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredMembers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              label="members"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;

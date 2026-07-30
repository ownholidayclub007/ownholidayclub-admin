import React, { useState, useEffect, useCallback } from 'react';
import { 
    Activity, Search, Calendar, User, 
    Layers, Info, RefreshCw,
    PlusCircle, Edit3, Trash2, LogIn, LogOut
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import Pagination from '../components/Pagination';
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const limit = 10;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/activity-logs`, {
                params: { 
                    page: currentPage, 
                    limit, 
                    search: searchTerm,
                    module: moduleFilter === 'all' ? '' : moduleFilter
                }
            });
            if (response.data.success) {
                setLogs(response.data.data);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load activity logs',
                confirmButtonColor: '#C8102E'
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, moduleFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchLogs(), 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const getActionBadge = (action) => {
        switch (action) {
            case 'Created':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-200 tracking-widest">
                        <PlusCircle size={12} /> {action}
                    </span>
                );
            case 'Updated':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 tracking-widest">
                        <Edit3 size={12} /> {action}
                    </span>
                );
            case 'Deleted':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-200 tracking-widest">
                        <Trash2 size={12} /> {action}
                    </span>
                );
            case 'Logged In':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 tracking-widest">
                        <LogIn size={12} /> {action}
                    </span>
                );
            case 'Logged Out':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 tracking-widest">
                        <LogOut size={12} /> {action}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-black uppercase bg-gray-50 text-gray-700 border border-gray-200 tracking-widest">
                        {action}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            {/* Page Header */}
            <PageHeader 
                title="MANAGE ACTIVITY LOGS"
                description="Detailed audit trail of all administrative actions and system changes"
            />

            <div className="w-full mt-8">
                {/* Search & Refresh Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by user or details..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 pl-10 pr-4 text-sm border-2 border-gray-200 focus:outline-none focus:border-[#C8102E] transition-all bg-white font-medium"
                            />
                        </div>
                        <button 
                            onClick={fetchLogs}
                            className="p-3 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-none border-2 border-gray-200 transition-colors"
                            title="Refresh Logs"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Filter Module:</span>
                        <select 
                            value={moduleFilter} 
                            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
                            className="h-11 px-4 text-xs border-2 border-gray-200 focus:outline-none focus:border-[#C8102E] bg-white text-gray-700 font-black uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">ALL SECTIONS</option>
                            <option value="SEO">SEO META</option>
                            <option value="Blog">BLOGS</option>
                            <option value="Home Slider">HOME SLIDER</option>
                            <option value="FAQ">FAQ</option>
                            <option value="Service">SERVICES</option>
                            <option value="Destination">DESTINATIONS</option>
                            <option value="Membership">MEMBERSHIP</option>
                            <option value="CustomPage">PAGES</option>
                            <option value="Auth">AUTHENTICATION</option>
                            <option value="Roles">ROLES</option>
                            <option value="Settings">SETTINGS</option>
                        </select>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-sm">
                    {/* Dark Table Header Bar */}
                    <div className="bg-[#C8102E] px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-none">
                                <Activity className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-sm uppercase tracking-widest">System Audit Trail</h2>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                                    Showing {logs.length} of {total} operations tracked
                                </p>
                            </div>
                        </div>
                        <div className="text-white text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-none border border-white/20 uppercase tracking-widest">
                            Total Records: {total}
                        </div>
                    </div>

                    {/* Table Implementation */}
                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Restoring audit history...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                            <Info size={64} className="mb-4 opacity-10" />
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">No Activity Logged</h3>
                            <p className="text-gray-400 italic font-bold text-[10px] uppercase tracking-wider mt-1">Verify after performing administrative actions</p>
                        </div>
                    ) : (
                        <div className="bg-white mt-6 px-4 pb-4">
                            <Table 
                                columns={[
                                    {
                                        key: "index",
                                        label: "No.",
                                        width: "60px",
                                        render: (_, i) => (
                                            <span className="font-bold text-[#C8102E] text-xs">
                                                {(currentPage - 1) * limit + i + 1}
                                            </span>
                                        )
                                    },
                                    {
                                        key: "user",
                                        label: "Admin User",
                                        render: (row) => (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center border border-red-100">
                                                    <User className="w-3.5 h-3.5 text-[#C8102E]" />
                                                </div>
                                                <span className="font-bold text-[#C8102E] text-[11px] uppercase underline decoration-red-200 underline-offset-4 tracking-tighter">
                                                    {row.user}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        key: "action",
                                        label: "Action Type",
                                        render: (row) => getActionBadge(row.action)
                                    },
                                    {
                                        key: "module",
                                        label: "Section / Module",
                                        render: (row) => (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-none text-gray-700">
                                                <Layers className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-bold uppercase tracking-widest text-[10px]">
                                                    {row.module}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        key: "details",
                                        label: "Log Details",
                                        render: (row) => (
                                            <div className="text-gray-900 font-semibold text-[11px] leading-relaxed max-w-md uppercase tracking-tight">
                                                {row.details}
                                            </div>
                                        )
                                    },
                                    {
                                        key: "createdAt",
                                        label: "Execution Time",
                                        render: (row) => (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-gray-900 font-bold text-[10px] uppercase tracking-widest">
                                                    <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                                                    {new Date(row.createdAt).toLocaleDateString('en-GB', { 
                                                        day: '2-digit', 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    })}
                                                </div>
                                                <span className="text-[9px] text-gray-400 font-bold ml-6 uppercase tracking-widest">
                                                    {new Date(row.createdAt).toLocaleTimeString('en-GB', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit', 
                                                        hour12: true 
                                                    })}
                                                </span>
                                            </div>
                                        )
                                    }
                                ]}
                                data={logs}
                                wrapperClassName="border-none shadow-none"
                                theadClassName="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest border-b border-slate-800"
                            />
                        </div>
                    )}

                    {/* Standardized Pagination */}
                    <div className="px-6 py-4 border-t-2 border-gray-100 bg-gray-50">
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={total}
                            itemsPerPage={limit}
                            onPageChange={setCurrentPage}
                            label="activity records"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;

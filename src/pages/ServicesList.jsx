import React, { useState, useEffect } from 'react';
import {
    Search,
    Edit,
    Trash2,
    Filter,
    Briefcase,
    MapPin,
    Clock,
    Plane,
    Thermometer,
    Calendar,
    Layout,
    ImageIcon,
    Plus,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import Pagination from "../components/Pagination";
import { useNavigate } from 'react-router-dom';

const ServicesList = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/service-details/admin');
            if (response.data.success) {
                setServices(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            Swal.fire('Error', 'Failed to fetch services', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will delete all details for this service",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/service-details/${id}`);
                Swal.fire('Deleted!', 'Service details have been removed.', 'success');
                fetchServices();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete service', 'error');
            }
        }
    };

    const filteredServices = services.filter(service => {
        return service.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
               service.slug.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "image",
            label: "PREVIEW",
            width: "100px",
            render: (row) => (
                <div className="w-16 h-10 border-2 border-gray-100 overflow-hidden bg-gray-50 shadow-sm relative group">
                    {row.gallery && row.gallery.length > 0 ? (
                        <img 
                            src={row.gallery[0]} 
                            alt={row.serviceTitle} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <ImageIcon size={16} />
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "serviceTitle",
            label: "SERVICE INFO",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{row.serviceTitle}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <ExternalLink size={10} className="text-[#C8102E]" />
                        <span className="text-[10px] text-gray-500 font-bold lowercase truncate max-w-[150px]">/{row.slug}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "description",
            label: "SHORT DESCRIPTION",
            render: (row) => (
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[250px] line-clamp-2 italic">
                    {row.shortDescription || "No summary provided."}
                </p>
            ),
        },
        {
            key: "updatedAt",
            label: "LAST UPDATED",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-700">
                        <Calendar size={10} className="text-blue-500" />
                        <span className="text-[10px] font-bold">
                            {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-[9px] font-medium tracking-tight">
                            {row.updatedAt ? new Date(row.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "actions",
            label: "ACTIONS",
            width: "120px",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/service-details')}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100"
                        title="Edit Details"
                    >
                        <Edit size={14} />
                    </button>
                    <button 
                        onClick={() => handleDelete(row._id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full">
            <div className="space-y-6 bg-white p-8 border-2 border-gray-200 mt-6 rounded-none shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-gray-100 pb-6">
                    <PageHeader
                        title="DETAILED SERVICES LIST"
                        description="View and manage services that have complete descriptive content and details"
                    />
                    <button 
                        onClick={() => navigate('/service-details')}
                        className="px-6 py-3 bg-[#C8102E] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#a00d25] transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Add New
                    </button>
                </div>

                {/* Table Control Bar */}
                <div className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-900 flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 text-[12px] bg-white border-none focus:outline-none font-bold text-gray-800"
                            />
                        </div>
                    </div>

                    <div className="bg-white min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading services...</span>
                            </div>
                        ) : filteredServices.length > 0 ? (
                            <Table
                                columns={columns}
                                data={paginatedServices}
                                wrapperClassName="border-none shadow-none"
                                rowClassName="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                                theadClassName="bg-[#C8102E] text-white uppercase text-[10px] font-black tracking-[0.1em] !border-none"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 gap-3 opacity-50">
                                <Briefcase size={40} className="text-gray-200" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">No detailed services found</p>
                                <p className="text-[10px] text-gray-300 italic font-medium italic">Add details in 'Service Details' to see them here</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white px-6 py-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredServices.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="services"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesList;

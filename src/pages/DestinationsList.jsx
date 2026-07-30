import React, { useState, useEffect } from 'react';
import {
    Search,
    Edit,
    Trash2,
    Filter,
    Globe,
    MapPin,
    Clock,
    Plane,
    Thermometer,
    Calendar,
    Layout,
    ImageIcon,
    Plus,
    ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import Pagination from "../components/Pagination";
import { useNavigate } from 'react-router-dom';

const DestinationsList = () => {
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [regionFilter, setRegionFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/destinations/admin');
            if (response.data.success) {
                // Filter to only show those that have details added
                // User requested: "jis jis add destination ki m details daal dunga unka data aaega bas"
                const detailedOnly = response.data.data.filter(d => 
                    d.shortDescription || d.fullDescription || d.travelStats?.bestTime
                );
                setDestinations(detailedOnly);
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
            Swal.fire('Error', 'Failed to fetch destinations', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will delete all details for this destination",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/destinations/${id}`);
                Swal.fire('Deleted!', 'Destination has been removed.', 'success');
                fetchDestinations();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete destination', 'error');
            }
        }
    };

    const filteredDestinations = destinations.filter(dest => {
        const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             dest.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = regionFilter === "all" || dest.region === regionFilter;
        return matchesSearch && matchesRegion;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDestinations = filteredDestinations.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "image",
            label: "PREVIEW",
            width: "100px",
            render: (row) => (
                <div className="w-16 h-10 border-2 border-gray-100 overflow-hidden bg-gray-50 shadow-sm relative group">
                    <img 
                        src={row.image} 
                        alt={row.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink size={10} className="text-white" />
                    </div>
                </div>
            ),
        },
        {
            key: "name",
            label: "DESTINATION INFO",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{row.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin size={10} className="text-[#C8102E]" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[150px]">{row.location}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "region",
            label: "REGION",
            render: (row) => (
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border ${
                    row.region === 'Domestic' 
                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                    {row.region === 'Domestic' ? 'In India' : 'International'}
                </span>
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
            key: "stats",
            label: "QUICK STATS",
            render: (row) => (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={10} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-gray-600">{row.travelStats?.bestTime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Thermometer size={10} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-600">{row.travelStats?.temp || 'N/A'}</span>
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
                        onClick={() => navigate('/destination-details')}
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
                        title="DETAILED DESTINATIONS LIST"
                        description="View and manage destinations that have complete descriptive content and details"
                    />
                    <button 
                        onClick={() => navigate('/add-destination')}
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
                                placeholder="Search destinations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 text-[12px] bg-white border-none focus:outline-none font-bold text-gray-800"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-white/60" />
                                <select 
                                    value={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.value)}
                                    className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border-none bg-white cursor-pointer outline-none"
                                >
                                    <option value="all">All Regions</option>
                                    <option value="Domestic">In India</option>
                                    <option value="International">International</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading destinations...</span>
                            </div>
                        ) : filteredDestinations.length > 0 ? (
                            <Table
                                columns={columns}
                                data={paginatedDestinations}
                                wrapperClassName="border-none shadow-none"
                                rowClassName="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                                theadClassName="bg-[#C8102E] text-white uppercase text-[10px] font-black tracking-[0.1em] !border-none"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 gap-3 opacity-50">
                                <Globe size={40} className="text-gray-200" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">No detailed destinations found</p>
                                <p className="text-[10px] text-gray-300 italic font-medium italic">Add details in 'Destination Details' to see them here</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white px-6 py-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredDestinations.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="destinations"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationsList;

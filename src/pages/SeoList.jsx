import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, CheckCircle, XCircle, Globe } from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Table from '../components/table/Table';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';

import { pagesList } from '../data/pagesList';

const SeoList = () => {
    const [seoList, setSeoList] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSeoModules();
    }, []);

    const fetchSeoModules = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/seo/all');
            if (response.data.success) {
                setSeoList(response.data.data);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch SEO modules',
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `Delete SEO for page: <strong>${row.page}</strong>?<br><span class="text-red-600">This cannot be undone!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await api.delete(`/api/seo/delete/${row._id}`);

                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'SEO module deleted successfully',
                        confirmButtonColor: '#134698',
                        timer: 2000
                    });
                    fetchSeoModules();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete',
                    confirmButtonColor: '#134698'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (row) => {
        navigate('/add-meta', { state: { seoData: row } });
    };

    const getPageName = (path) => {
        const found = pagesList.find(p => p.path === path);
        return found ? found.name : path;
    };


    const filteredList = seoList.filter(item =>
        item.page?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => (
                <div className="font-bold text-gray-900">{index + 1}</div>
            )
        },
        {
            key: "page",
            label: "PAGE NAME",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e3a8a]">{getPageName(row.page)}</span>
                    <span className="text-[10px] text-gray-400">{row.page}</span>
                </div>
            )
        },
        {
            key: "metaTitle",
            label: "META TITLE",
            render: (row) => (
                <div className="text-gray-600 text-xs max-w-[200px] truncate" title={row.metaTitle}>
                    {row.metaTitle || "-"}
                </div>
            )
        },
        {
            key: "isActive",
            label: "STATUS",
            render: (row) => (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${row.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {row.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {row.isActive ? "Active" : "Inactive"}
                </div>
            )
        },
        {
            key: "updatedAt",
            label: "LAST UPDATED",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-red-600 font-bold uppercase underline">
                        {row.updatedBy || "Admin User"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(row.updatedAt).toLocaleDateString()} {new Date(row.updatedAt).toLocaleTimeString()}
                    </span>
                </div>
            )
        },
        {
            key: "actions",
            label: "ACTIONS",
            width: "120px",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleEdit(row)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                    <button 
                        onClick={() => handleDelete(row)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="SEO META LIST"
                description="Manage all SEO meta tags for your website pages"
            />

            <div className="mt-6">
                <SearchBar 
                    rowsPerPage={rowsPerPage}
                    totalItems={filteredList.length}
                    onRowsPerPageChange={setRowsPerPage}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search by page or title..."
                />

                <div className="bg-white border-2 border-gray-200 shadow-md">
                    <div className="px-6 py-4 bg-[#1e3a8a] flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Meta Tags Management</h2>
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                            Total: {filteredList.length}
                        </span>
                    </div>

                    <div className="bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading meta data...</span>
                            </div>
                        ) : filteredList.length > 0 ? (
                            <Table
                                columns={columns}
                                data={filteredList.slice(0, rowsPerPage)}
                                wrapperClassName="border-none shadow-none"
                                theadClassName="bg-black text-white uppercase text-[10px] font-black tracking-widest"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 gap-3 opacity-50">
                                <Globe size={40} className="text-gray-200" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No SEO entries found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeoList;

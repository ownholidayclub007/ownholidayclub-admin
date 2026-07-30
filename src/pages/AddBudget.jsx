import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import {
    Plus,
    Trash2,
    Edit,
    Layout,
    CheckCircle2,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const AddBudget = () => {
    const [budgets, setBudgets] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [services, setServices] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;
    
    const [form, setForm] = useState({
        type: 'service', // 'service' or 'destination'
        referenceId: '',
        title: '',
        budgets: ['']
    });

    useEffect(() => {
        fetchBudgets();
        fetchDestinations();
        fetchServices();
    }, []);

    const fetchBudgets = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/budgets');
            if (res.data.success) {
                setBudgets(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const res = await api.get('/api/destinations');
            if (res.data.success) {
                setDestinations(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get('/api/explore-services');
            if (res.data.success && res.data.data) {
                // ExploreServices API returns a single document, services array is inside data
                const data = res.data.data;
                if (Array.isArray(data)) {
                    setServices(data[0]?.services || []);
                } else {
                    setServices(data.services || []);
                }
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setForm({
            ...form,
            type: val,
            referenceId: val === 'callback' ? 'callback-request' : '',
            title: val === 'callback' ? 'Callback Request' : '',
            budgets: ['']
        });
    };

    const handleItemChange = (e) => {
        const id = e.target.value;
        let title = '';
        if (form.type === 'service') {
            const svc = services.find(s => s._id === id || s.title === id);
            title = svc ? svc.title : id;
        } else {
            const dest = destinations.find(d => d._id === id || d.name === id);
            title = dest ? dest.name : id;
        }
        setForm({ ...form, referenceId: id, title: title });
    };

    const handleBudgetChange = (index, value) => {
        const newBudgets = [...form.budgets];
        newBudgets[index] = value;
        setForm({ ...form, budgets: newBudgets });
    };

    const addBudgetInput = () => {
        setForm({ ...form, budgets: [...form.budgets, ''] });
    };

    const removeBudgetInput = (index) => {
        const newBudgets = [...form.budgets];
        newBudgets.splice(index, 1);
        setForm({ ...form, budgets: newBudgets });
    };

    const handleSubmit = async () => {
        if (!form.type || !form.referenceId || !form.title) {
            Swal.fire('Error', 'Please select a type and an item', 'warning');
            return;
        }

        const validBudgets = form.budgets.filter(b => b.trim() !== '');
        if (validBudgets.length === 0) {
            Swal.fire('Error', 'Please add at least one budget range', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                type: form.type,
                referenceId: form.referenceId,
                title: form.title,
                budgets: validBudgets
            };

            const response = await api.post('/api/budgets', payload);
            
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Budget configuration saved successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchBudgets();
            }
        } catch (error) {
            Swal.fire('Error', 'Operation failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await api.delete(`/api/budgets/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Budget config has been deleted.', 'success');
                    fetchBudgets();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete budget', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (item) => {
        setIsEditing(item._id);
        setForm({
            type: item.type,
            referenceId: item.referenceId,
            title: item.title,
            budgets: item.budgets.length > 0 ? item.budgets : ['']
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({
            type: 'service',
            referenceId: '',
            title: '',
            budgets: ['']
        });
    };

    // ── Filtered & paginated data ──
    const filtered = budgets.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.budgets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // reset to page 1 on new search
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="BUDGET SECTION"
                description="Manage budget dropdown options for services and destinations"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left Section: Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Budget Config' : 'Add Budget Config'}
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Select Type</label>
                                <select 
                                    value={form.type} 
                                    onChange={handleTypeChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                >
                                    <option value="service">Services</option>
                                    <option value="destination">Destinations</option>
                                    <option value="callback">Callback Requests</option>
                                </select>
                            </div>

                            {form.type !== 'callback' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Select Item</label>
                                <select 
                                    value={form.referenceId} 
                                    onChange={handleItemChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                >
                                    <option value="">Select an option...</option>
                                    {form.type === 'service' && services.map(s => (
                                        <option key={s._id || s.title} value={s.title}>{s.title}</option>
                                    ))}
                                    {form.type === 'destination' && destinations.map(d => (
                                        <option key={d._id || d.name} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            )}

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Budgets</label>
                                {form.budgets.map((budget, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={budget}
                                            onChange={(e) => handleBudgetChange(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                            placeholder="e.g. 1500 - 2000"
                                        />
                                        {form.budgets.length > 1 && (
                                            <button 
                                                onClick={() => removeBudgetInput(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    onClick={addBudgetInput}
                                    className="text-sm font-bold text-[#DE802B] hover:underline"
                                >
                                    + Add another budget range
                                </button>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-[#DE802B] text-white font-bold hover:bg-[#c66d21] transition-colors"
                                >
                                    {isEditing ? 'Update Config' : 'Add Config'}
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        {/* Header row: title + search */}
                        <div className="px-6 py-4 border-b bg-[#C8102E] flex items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-[#DE802B]" /> Configured Budgets
                            </h2>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder="Search type, title, budget..."
                                    className="pl-9 pr-4 py-1.5 text-sm border border-white/30 bg-white/10 text-white placeholder-white/60 rounded outline-none focus:bg-white/20 w-56"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                        <th className="px-4 py-3 border-b">S.No</th>
                                        <th className="px-6 py-3 border-b">Type</th>
                                        <th className="px-6 py-3 border-b">Item Title</th>
                                        <th className="px-6 py-3 border-b">Budgets</th>
                                        <th className="px-6 py-3 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                {searchQuery ? 'No results found for your search.' : 'No budgets configured yet.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item, idx) => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                {/* S.No */}
                                                <td className="px-4 py-4 text-sm font-bold text-gray-400">
                                                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                                </td>
                                                {/* Type — blue for service, emerald for destination */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide
                                                        ${item.type === 'service'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : item.type === 'destination' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                </td>

                                                {/* Title */}
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.title}</td>

                                                {/* Budgets — amber light bg with amber-700 text */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.budgets.map((b, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap"
                                                            >
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t flex items-center justify-between bg-white">
                                <span className="text-sm text-gray-500 font-semibold">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBudget;

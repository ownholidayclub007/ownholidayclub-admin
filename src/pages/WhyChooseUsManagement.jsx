import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL } from "../lib/api";
import {
    HelpCircle,
    Plus,
    Save,
    Trash2,
    Image as ImageIcon,
    Edit,
    Layout,
    CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const WhyChooseUsManagement = () => {
    const [selectedPage, setSelectedPage] = useState('home');
    const [data, setData] = useState({
        subheading: '',
        heading: '',
        highlightedWord: '',
        mainImage: '',
        items: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isEditingItem, setIsEditingItem] = useState(null);
    const [wcuForm, setWcuForm] = useState({
        title: '',
        otherTravelCompanies: '',
        ownHolidayClub: ''
    });

    useEffect(() => {
        if (selectedPage) {
            fetchData();
        }
    }, [selectedPage]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/why-choose-us/${selectedPage}`);
            if (response.data.success) {
                const fetchedData = response.data.data;
                // If it's home and empty, set default titles
                if (selectedPage === 'home' && !fetchedData.heading) {
                    setData({
                        subheading: 'WHY CHOOSE US',
                        heading: '10 REASONS TO',
                        highlightedWord: 'Become a Member.',
                        mainImage: '',
                        items: fetchedData.items || []
                    });
                } else {
                    setData(fetchedData);
                }
            }
        } catch (error) {
            console.error('Error fetching Why Choose Us:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/why-choose-us/headings', {
                page: selectedPage,
                subheading: data.subheading,
                heading: data.heading,
                highlightedWord: data.highlightedWord,
                mainImage: data.mainImage
            });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Section settings updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Data = reader.result;
            
            try {
                setIsLoading(true);
                const response = await api.post('/api/why-choose-us/images', {
                    file: {
                        dataUrl: base64Data,
                        name: file.name,
                        type: file.type
                    }
                });
                
                if (response.data.success) {
                    setData({ ...data, mainImage: response.data.data.url });
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to upload image', 'error');
            } finally {
                setIsLoading(false);
            }
        };
    };

    const handleAddOrUpdateItem = async () => {
        if (!wcuForm.title || !wcuForm.otherTravelCompanies || !wcuForm.ownHolidayClub) {
            Swal.fire('Error', 'All fields (Title, Other Companies, and Own Holiday Club) are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/api/why-choose-us/items', {
                page: selectedPage,
                wcuItem: wcuForm,
                itemId: isEditingItem
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditingItem ? 'Reason point updated' : 'Reason point added',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Operation failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
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
                const response = await api.delete(`/api/why-choose-us/items/${selectedPage}/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Reason point has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete reason point', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (item) => {
        setIsEditingItem(item._id);
        setWcuForm({
            title: item.title,
            otherTravelCompanies: item.otherTravelCompanies,
            ownHolidayClub: item.ownHolidayClub
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingItem(null);
        setWcuForm({
            title: '',
            otherTravelCompanies: '',
            ownHolidayClub: ''
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="WHY CHOOSE US"
                description="Manage section headings and the 10 reasons comparison cards for the home page"
            />

            {/* Page Selection */}
            <div className="mb-8 bg-gray-50 p-4 border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Select Page</label>
                <select 
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="w-full lg:w-1/3 px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none font-bold text-[#C8102E]"
                >
                    <option value="home">Home Page</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Headings and Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Settings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                            <Layout className="w-5 h-5" /> Section Settings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Highlight Word</label>
                                <input
                                    type="text"
                                    value={data.highlightedWord}
                                    onChange={(e) => setData({ ...data, highlightedWord: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                />
                            </div>

                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-2 bg-[#C8102E] text-white font-bold hover:bg-[#a00d24] transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Section Settings
                            </button>
                        </div>
                    </div>

                    {/* Reason Item Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                            {isEditingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingItem ? 'Edit Reason Point' : 'Add Reason Point'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Title (Reason)</label>
                                <input
                                    type="text"
                                    value={wcuForm.title}
                                    onChange={(e) => setWcuForm({ ...wcuForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                    placeholder="e.g., Wide range of destinations"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Other Travel Companies Point</label>
                                <textarea
                                    value={wcuForm.otherTravelCompanies}
                                    onChange={(e) => setWcuForm({ ...wcuForm, otherTravelCompanies: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm"
                                    rows="3"
                                    placeholder="e.g., Limited resort options and availability issues."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Own Holiday Club Point</label>
                                <textarea
                                    value={wcuForm.ownHolidayClub}
                                    onChange={(e) => setWcuForm({ ...wcuForm, ownHolidayClub: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold text-[#C8102E]"
                                    rows="4"
                                    placeholder="e.g., Members get access to a wide range of destinations including beaches, hills..."
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddOrUpdateItem}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-[#DE802B] text-white font-bold hover:bg-[#c66d21] transition-colors"
                                >
                                    {isEditingItem ? 'Update Item' : 'Add Item'}
                                </button>
                                {isEditingItem && (
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

                {/* Right Section: Items Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#C8102E]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#DE802B]" /> Why Choose Us Comparison Items (Max 10)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                        <th className="px-6 py-3 border-b">No.</th>
                                        <th className="px-6 py-3 border-b">Reason Title</th>
                                        <th className="px-6 py-3 border-b">Other Companies</th>
                                        <th className="px-6 py-3 border-b">Own Holiday Club</th>
                                        <th className="px-6 py-3 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {!data.items || data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No comparison items found. Add your first item using the form.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item, idx) => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-[#C8102E]">{idx + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.title}</td>
                                                <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                                                    <div className="line-clamp-2">{item.otherTravelCompanies}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-semibold text-emerald-700 max-w-xs">
                                                    <div className="line-clamp-2">{item.ownHolidayClub}</div>
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
                                                            onClick={() => handleDeleteItem(item._id)}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyChooseUsManagement;

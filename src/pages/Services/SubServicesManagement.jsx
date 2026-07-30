import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../lib/api";
import {
    Plus,
    Type,
    Save,
    Trash2,
    Image as ImageIcon,
    Edit,
    Heart,
    Briefcase,
    Layout,
    Music,
    Compass,
    Smile,
    Gift,
    PartyPopper,
    ShoppingBag,
    Store,
    Utensils,
    Building,
    Megaphone,
    Calendar,
    ArrowRight
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import RichTextEditor from '../../components/RichTextEditor';

const SubServicesManagement = () => {
    const [servicesList, setServicesList] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    
    // This will hold the current full service document from DB
    const [currentService, setCurrentService] = useState(null);

    const [data, setData] = useState({
        heading: '',
        description: '',
        subServices: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isEditingCard, setIsEditingCard] = useState(null);
    const [cardForm, setCardForm] = useState({
        title: '',
        description: '',
        image: '',
        altText: '',
        buttonText: 'PLAN THIS EVENT',
        buttonUrl: '#',
        order: 0
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/explore-services');
            if (response.data.success) {
                // The services are inside response.data.data.services
                setServicesList(response.data.data.services || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (e) => {
        const id = e.target.value;
        setSelectedServiceId(id);
        if (id) {
            const service = servicesList.find(s => s._id === id);
            setCurrentService(service);
            setData({
                heading: service.subServicesConfig?.heading || '',
                description: service.subServicesConfig?.description || '',
                subServices: service.subServices || []
            });
            resetForm();
        } else {
            setCurrentService(null);
            setData({ heading: '', description: '', subServices: [] });
        }
    };

    const handleHeadingSave = async () => {
        if (!selectedServiceId) return;
        setIsLoading(true);
        try {
            const response = await api.put(`/api/explore-services/cards/${selectedServiceId}`, {
                subServicesConfig: {
                    heading: data.heading,
                    description: data.description
                }
            });
            if (response.data.success) {
                const updatedCard = response.data.data;
                setServicesList(prev => prev.map(s => s._id === selectedServiceId ? updatedCard : s));
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Headings updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const inputElement = e.target;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                // We reuse explore-services/images upload endpoint since it works well for general image uploads
                // or we could use the service details one if it exists. Let's use service details one.
                const response = await api.post('/api/service-details/images', {
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: reader.result,
                    }
                });
                if (response.data.success) {
                    const imageUrl = response.data.data.url;
                    setCardForm(prev => ({ ...prev, image: imageUrl }));
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Uploaded!',
                        text: 'Image uploaded to Cloudinary',
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error('Upload error:', error);
                Swal.fire('Error', 'Failed to upload image', 'error');
            } finally {
                setIsLoading(false);
                if (inputElement) inputElement.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddOrUpdateCard = async () => {
        if (!selectedServiceId) {
            Swal.fire('Error', 'Please select a parent service first', 'warning');
            return;
        }

        if (!cardForm.title || !cardForm.description || !cardForm.image) {
            Swal.fire('Error', 'Title, Description, and Image are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let newSubServices = [...data.subServices];
            
            if (isEditingCard) {
                const index = newSubServices.findIndex(c => c._id === isEditingCard || c.title === isEditingCard);
                if (index !== -1) {
                    newSubServices[index] = { ...newSubServices[index], ...cardForm };
                }
            } else {
                newSubServices.push({ ...cardForm, _id: Date.now().toString() }); // temp ID
            }

            // Clean up temp _id before saving to DB, let mongoose generate it
            const payloadServices = newSubServices.map(s => {
                const { _id, ...rest } = s;
                // If it's a temp ID (numeric), strip it
                if (_id && !isNaN(_id)) return rest;
                return s;
            });

            const response = await api.put(`/api/explore-services/cards/${selectedServiceId}`, {
                subServices: payloadServices
            });

            if (response.data.success) {
                const updatedCard = response.data.data;
                setServicesList(prev => prev.map(s => s._id === selectedServiceId ? updatedCard : s));
                setData(prev => ({ ...prev, subServices: updatedCard.subServices }));
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditingCard ? 'Category updated' : 'Category added',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
            }
        } catch (error) {
            Swal.fire('Error', 'Operation failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (idOrTitle) => {
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
                const newSubServices = data.subServices.filter(c => c._id !== idOrTitle && c.title !== idOrTitle);
                
                const response = await api.put(`/api/explore-services/cards/${selectedServiceId}`, {
                    subServices: newSubServices
                });

                if (response.data.success) {
                    const updatedCard = response.data.data;
                    setServicesList(prev => prev.map(s => s._id === selectedServiceId ? updatedCard : s));
                    setData(prev => ({ ...prev, subServices: updatedCard.subServices }));
                    Swal.fire('Deleted!', 'Service category has been deleted.', 'success');
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete category', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (card) => {
        setIsEditingCard(card._id || card.title);
        setCardForm({
            title: card.title,
            description: card.description,
            image: card.image,
            altText: card.altText || '',
            buttonText: card.buttonText || 'PLAN THIS EVENT',
            buttonUrl: card.buttonUrl || '#',
            order: card.order || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({
            title: '',
            description: '',
            image: '',
            altText: '',
            buttonText: 'PLAN THIS EVENT',
            buttonUrl: '#',
            order: 0
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="SERVICE CATEGORIES MANAGEMENT"
                description="Manage sub-categories for individual services (e.g. Hindu Wedding under Weddings)"
            />

            {/* Service Selection Dropdown */}
            <div className="mb-8 p-4 bg-gray-50 border-2 border-gray-200">
                <label className="block text-sm font-bold text-[#C8102E] mb-2 uppercase tracking-tight">Select Parent Service</label>
                <select
                    value={selectedServiceId}
                    onChange={handleServiceSelect}
                    className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] outline-none font-semibold transition-all rounded-none"
                >
                    <option value="">-- Choose a Service --</option>
                    {servicesList.map(s => (
                        <option key={s._id} value={s._id}>{s.title}</option>
                    ))}
                </select>
            </div>

            {selectedServiceId ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Section: Headings and Form */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Headings Management */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none transition-all hover:shadow-md">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                                <Type className="w-5 h-5" /> Category Section Headings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                    <input
                                        type="text"
                                        value={data.heading}
                                        onChange={(e) => setData({ ...data, heading: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm transition-all rounded-none"
                                        placeholder="e.g. Weddings Categories ✨"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm transition-all rounded-none min-h-[100px]"
                                        placeholder="Discover our curated weddings experiences..."
                                    />
                                </div>
                                <button
                                    onClick={handleHeadingSave}
                                    disabled={isLoading}
                                    className="w-full py-2 bg-[#C8102E] text-white font-bold hover:bg-[#a00d25] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    <Save className="w-4 h-4" /> Save Headings
                                </button>
                            </div>
                        </div>

                        {/* Card Form */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none transition-all hover:shadow-md">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                                {isEditingCard ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {isEditingCard ? 'Edit Category Card' : 'Add New Category'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Order</label>
                                    <input
                                        type="number"
                                        value={cardForm.order}
                                        onChange={(e) => setCardForm({ ...cardForm, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Title</label>
                                    <input
                                        type="text"
                                        value={cardForm.title}
                                        onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none"
                                        placeholder="e.g. Hindu Wedding"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Description</label>
                                    <div className="border-2 border-gray-300 focus-within:border-[#C8102E] transition-all">
                                        <RichTextEditor
                                            value={cardForm.description}
                                            onChange={(content) => setCardForm({ ...cardForm, description: content })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image (Cloudinary)</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                                            {cardForm.image ? (
                                                <img src={cardForm.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <ImageIcon className="text-gray-300 w-8 h-8" />
                                            )}
                                            <input
                                                type="file"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <Plus className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={cardForm.image}
                                                onChange={(e) => setCardForm({ ...cardForm, image: e.target.value })}
                                                className="w-full px-2 py-1 border-b-2 border-gray-200 outline-none text-[10px] bg-transparent focus:border-[#C8102E] transition-all"
                                                placeholder="Image URL..."
                                            />
                                            <input
                                                type="text"
                                                value={cardForm.altText}
                                                onChange={(e) => setCardForm({ ...cardForm, altText: e.target.value })}
                                                className="w-full px-2 py-1 border-b-2 border-gray-200 outline-none text-[10px] bg-transparent focus:border-[#C8102E] transition-all"
                                                placeholder="Alt Text (SEO)..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Button Text</label>
                                        <input
                                            type="text"
                                            value={cardForm.buttonText}
                                            onChange={(e) => setCardForm({ ...cardForm, buttonText: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                            placeholder="PLAN THIS EVENT"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Button URL</label>
                                        <input
                                            type="text"
                                            value={cardForm.buttonUrl}
                                            onChange={(e) => setCardForm({ ...cardForm, buttonUrl: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                            placeholder="#"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleAddOrUpdateCard}
                                        disabled={isLoading}
                                        className="flex-1 py-3 bg-[#DE802B] text-white font-bold hover:bg-[#c66d21] transition-all rounded-none uppercase tracking-widest text-xs shadow-sm hover:shadow-md"
                                    >
                                        {isEditingCard ? 'Update Category' : 'Add Category'}
                                    </button>
                                    {isEditingCard && (
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-3 bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all rounded-none uppercase tracking-widest text-xs"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Cards Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-none">
                            <div className="px-6 py-4 border-b bg-[#C8102E] flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-white" /> Categories List
                                </h2>
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                                    Total: {data.subServices.length}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                            <th className="px-6 py-4 border-b">Image</th>
                                            <th className="px-6 py-4 border-b">Title & Desc</th>
                                            <th className="px-6 py-4 border-b text-center">Order</th>
                                            <th className="px-6 py-4 border-b text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.subServices.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Briefcase size={40} className="text-gray-100" />
                                                        No categories found. Add your first one using the form.
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            data.subServices.sort((a, b) => a.order - b.order).map((card) => (
                                                <tr key={card._id || card.title} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="w-24 h-16 bg-gray-50 border-2 border-gray-100 overflow-hidden shadow-sm">
                                                            <img
                                                                src={card.image}
                                                                alt={card.altText}
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 text-sm">{card.title}</div>
                                                        <div 
                                                            className="text-[10px] text-gray-400 mt-0.5 font-medium line-clamp-2 max-w-xs"
                                                            dangerouslySetInnerHTML={{ __html: card.description }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-3 py-1 bg-gray-100 text-[#C8102E] font-black text-xs border-2 border-gray-200">
                                                            {card.order || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => startEdit(card)}
                                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all shadow-sm"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCard(card._id || card.title)}
                                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all shadow-sm"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-lg">Please select a service above to manage its categories.</p>
                </div>
            )}
        </div>
    );
};

export default SubServicesManagement;

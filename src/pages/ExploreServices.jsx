import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
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
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ExploreServices = () => {
    const [data, setData] = useState({
        subheading: 'The OWN Membership Experience',
        heading: 'Explore Our Services.',
        description: 'Elevate your lifestyle with exclusive services designed to create unforgettable family moments and premium holiday experiences.',
        services: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingCard, setIsEditingCard] = useState(null);
    const [cardForm, setCardForm] = useState({
        title: '',
        description: '',
        image: '',
        altText: '',
        icon: 'Heart',
        buttonText: 'Learn More',
        buttonUrl: '#',
        number: '',
        order: 0
    });

    const iconsList = [
        { name: 'Wedding / Ceremony', icon: Heart },
        { name: 'Corporate Event', icon: Briefcase },
        { name: 'Private Party', icon: Music },
        { name: 'Outing', icon: Compass },
        { name: 'Enjoyment', icon: Smile },
        { name: 'Gift / Surprise', icon: Gift },
        { name: 'Event / Celebration', icon: PartyPopper },
        { name: 'ShoppingBag', icon: ShoppingBag },
        { name: 'Store', icon: Store },
        { name: 'Utensils', icon: Utensils },
        { name: 'Building', icon: Building },
        { name: 'Megaphone', icon: Megaphone },
        { name: 'Calendar', icon: Calendar },
        { name: 'ArrowRight', icon: ArrowRight },
        { name: 'Layout', icon: Layout }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/explore-services');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/explore-services/headings', {
                subheading: data.subheading,
                heading: data.heading,
                description: data.description
            });
            if (response.data.success) {
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

        // Immediately set loading and clear input to allow re-selection
        setIsLoading(true);
        const inputElement = e.target;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const response = await api.post('/api/explore-services/images', {
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
        if (!cardForm.title || !cardForm.description || !cardForm.image) {
            Swal.fire('Error', 'Title, Description, and Image are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/explore-services/cards/${isEditingCard}`, cardForm);
            } else {
                response = await api.post('/api/explore-services/cards', cardForm);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditingCard ? 'Card updated' : 'Card added',
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

    const handleDeleteCard = async (id) => {
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
                const response = await api.delete(`/api/explore-services/cards/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Service card has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete card', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (card) => {
        setIsEditingCard(card._id);
        setCardForm({
            title: card.title,
            description: card.description,
            image: card.image,
            altText: card.altText || '',
            icon: card.icon || 'ShoppingBag',
            buttonText: card.buttonText || 'Learn More',
            buttonUrl: card.buttonUrl || '#',
            number: card.number || '',
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
            icon: 'ShoppingBag',
            buttonText: 'Learn More',
            buttonUrl: '#',
            number: '',
            order: 0
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="EXPLORE SERVICES MANAGEMENT"
                description="Manage global headings and individual service cards for the home section"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Headings and Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Headings Management */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                            <Type className="w-5 h-5" /> Global Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm transition-all rounded-none"
                                    placeholder="The OWN Membership Experience"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading (Editor)</label>
                                <RichTextEditor
                                    value={data.heading}
                                    onChange={(val) => setData({ ...data, heading: val })}
                                    placeholder="Explore Our Services."
                                    minHeight="120px"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm transition-all rounded-none min-h-[100px]"
                                    placeholder="Elevate your lifestyle with exclusive services..."
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
                            {isEditingCard ? 'Edit Service Card' : 'Add New Service Card'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">No.</label>
                                    <input
                                        type="text"
                                        value={cardForm.number}
                                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                        placeholder="01"
                                    />
                                </div>
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
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Icon</label>
                                    <select
                                        value={cardForm.icon}
                                        onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                    >
                                        {iconsList.map(item => (
                                            <option key={item.name} value={item.name}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Title</label>
                                <input
                                    type="text"
                                    value={cardForm.title}
                                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none"
                                    placeholder="Weddings"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Short Description</label>
                                <textarea
                                    value={cardForm.description}
                                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                    rows="3"
                                    placeholder="A Masterpiece of Love"
                                />
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
                                        placeholder="Learn More"
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
                                    {isEditingCard ? 'Update Card' : 'Add Card'}
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
                                <Layout className="w-5 h-5 text-white" /> Service Cards List
                            </h2>
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                                Total: {data.services.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                        <th className="px-6 py-4 border-b">No.</th>
                                        <th className="px-6 py-4 border-b">Image</th>
                                        <th className="px-6 py-4 border-b">Title</th>
                                        <th className="px-6 py-4 border-b text-center">Icon</th>
                                        <th className="px-6 py-4 border-b text-center">Order</th>
                                        <th className="px-6 py-4 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.services.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Briefcase size={40} className="text-gray-100" />
                                                    No service cards found. Add your first service using the form.
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        data.services.map((card) => (
                                            <tr key={card._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-black text-[#C8102E] text-sm">{card.number}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-12 bg-gray-50 border-2 border-gray-100 overflow-hidden shadow-sm">
                                                        <img
                                                            src={card.image}
                                                            alt={card.altText}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-sm">{card.title}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5 font-medium line-clamp-1">{card.description}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center border border-red-100">
                                                            {(() => {
                                                                const IconComp = iconsList.find(i => i.name === card.icon)?.icon || ShoppingBag;
                                                                return <IconComp className="w-4 h-4 text-[#C8102E]" />;
                                                            })()}
                                                        </div>
                                                    </div>
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
                                                            onClick={() => handleDeleteCard(card._id)}
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
        </div>
    );
};

export default ExploreServices;

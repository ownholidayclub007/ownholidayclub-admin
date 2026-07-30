import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Plus,
    Save,
    Trash2,
    Image as ImageIcon,
    Edit,
    Layout,
    Link as LinkIcon,
    Eye,
    EyeOff,
    ArrowUp
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const HomeSlider = () => {
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [form, setForm] = useState({
        subtitle: 'Welcome to Luxury',
        title1: 'Stay & Celebration',
        title2: 'on Earth',
        description: 'Experience the pinnacle of luxury with our exclusive members-only holiday packages.',
        image: '',
        altText: '',
        button1Text: '',
        button1Link: '',
        button2Text: '',
        button2Link: '',
        button3Text: '',
        button3Link: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/hero-slides/admin');
            if (response.data.success) {
                setSlides(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching slides:', error);
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
                const response = await api.post('/api/hero-slides/images', {
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: reader.result,
                    }
                });
                if (response.data.success) {
                    const imageUrl = response.data.data.url;
                    setForm(prev => ({ ...prev, image: imageUrl }));
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Uploaded!',
                        text: 'Image uploaded successfully',
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

    const handleAddOrUpdate = async () => {
        if (!form.image) {
            Swal.fire('Error', 'Image is required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/hero-slides/${isEditing}`, form);
            } else {
                response = await api.post('/api/hero-slides', form);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditing ? 'Slide updated' : 'Slide added',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchSlides();
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
                const response = await api.delete(`/api/hero-slides/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Slide has been deleted.', 'success');
                    fetchSlides();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete slide', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleToggleStatus = async (slide, newStatus) => {
        if (slide.isActive === newStatus) return;

        const result = await Swal.fire({
            title: 'Change Status?',
            text: `Are you sure you want to set this slide as ${newStatus ? 'Active' : 'Inactive'}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, change it!'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await api.put(`/api/hero-slides/${slide._id}`, { ...slide, isActive: newStatus });
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Updated',
                        text: `Slide is now ${newStatus ? 'Active' : 'Inactive'}`,
                        timer: 1000,
                        showConfirmButton: false
                    });
                    fetchSlides();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to update status', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (slide) => {
        setIsEditing(slide._id);
        setForm({
            subtitle: slide.subtitle,
            title1: slide.title1,
            title2: slide.title2,
            description: slide.description,
            image: slide.image,
            altText: slide.altText || '',
            button1Text: slide.button1Text || 'Book Holiday',
            button1Link: slide.button1Link || '/',
            button2Text: slide.button2Text || 'Memberships',
            button2Link: slide.button2Link || '/membership',
            button3Text: slide.button3Text || 'Plan Event',
            button3Link: slide.button3Link || '/services',
            order: slide.order || 0,
            isActive: slide.isActive !== undefined ? slide.isActive : true
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({
            subtitle: 'Welcome to Luxury',
            title1: 'Stay & Celebration',
            title2: 'on Earth',
            description: 'Experience the pinnacle of luxury with our exclusive members-only holiday packages.',
            image: '',
            altText: '',
            button1Text: '',
            button1Link: '',
            button2Text: '',
            button2Link: '',
            button3Text: '',
            button3Link: '',
            order: 0,
            isActive: true
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="HOME SLIDER MANAGEMENT"
                description="Manage hero slides, titles, descriptions, and call-to-action buttons for the homepage"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Slide' : 'Add New Slide'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subtitle</label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm transition-all rounded-none"
                                    placeholder="Welcome to Luxury"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Title Line 1 (Editor)</label>
                                <RichTextEditor
                                    value={form.title1}
                                    onChange={(val) => setForm({ ...form, title1: val })}
                                    placeholder="Stay & Celebration"
                                    minHeight="80px"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Title Line 2 (Editor)</label>
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 border border-amber-200">
                                        Yellow RGB: rgb(245, 158, 11) | Hex: #F59E0B
                                    </span>
                                </div>
                                <RichTextEditor
                                    value={form.title2}
                                    onChange={(val) => setForm({ ...form, title2: val })}
                                    placeholder="on Earth"
                                    minHeight="80px"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description (Editor)</label>
                                <RichTextEditor
                                    value={form.description}
                                    onChange={(val) => setForm({ ...form, description: val })}
                                    placeholder="Experience the pinnacle of luxury..."
                                    minHeight="120px"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Background Image</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                                        {form.image ? (
                                            <img src={form.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="text-gray-300 w-8 h-8" />
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            accept="image/*"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none text-white">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={form.image}
                                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                                            className="w-full px-2 py-1 border-b-2 border-gray-200 outline-none text-[10px] bg-transparent focus:border-[#C8102E]"
                                            placeholder="Image URL..."
                                        />
                                        <input
                                            type="text"
                                            value={form.altText}
                                            onChange={(e) => setForm({ ...form, altText: e.target.value })}
                                            className="w-full px-2 py-1 border-b-2 border-gray-200 outline-none text-[10px] bg-transparent focus:border-[#C8102E]"
                                            placeholder="Alt Text (SEO)..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Buttons Configuration</h3>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Button 1 Text</label>
                                        <input
                                            type="text"
                                            value={form.button1Text}
                                            onChange={(e) => setForm({ ...form, button1Text: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 text-xs rounded-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Button 1 Path</label>
                                        <input
                                            type="text"
                                            value={form.button1Link}
                                            onChange={(e) => setForm({ ...form, button1Link: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 text-xs rounded-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Button 2 Text</label>
                                        <input
                                            type="text"
                                            value={form.button2Text}
                                            onChange={(e) => setForm({ ...form, button2Text: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 text-xs rounded-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Button 2 Path</label>
                                        <input
                                            type="text"
                                            value={form.button2Link}
                                            onChange={(e) => setForm({ ...form, button2Link: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 text-xs rounded-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Button 3 Text</label>
                                        <input
                                            type="text"
                                            value={form.button3Text}
                                            onChange={(e) => setForm({ ...form, button3Text: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 text-xs rounded-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Button 3 Path</label>
                                        <input
                                            type="text"
                                            value={form.button3Link}
                                            onChange={(e) => setForm({ ...form, button3Link: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 text-xs rounded-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Order</label>
                                    <input
                                        type="number"
                                        value={form.order}
                                        onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 text-sm rounded-none"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                                        <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            className="w-4 h-4 accent-[#C8102E]"
                                        />
                                        <span className="text-xs font-bold text-gray-700 uppercase">Active Slide</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleAddOrUpdate}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#C8102E] text-white font-bold hover:bg-[#a00d25] transition-all rounded-none uppercase tracking-widest text-xs"
                                >
                                    {isEditing ? 'Update Slide' : 'Add Slide'}
                                </button>
                                {isEditing && (
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

                {/* Table Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-none">
                        <div className="px-6 py-4 border-b bg-[#C8102E] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Layout className="w-5 h-5 text-white" /> Hero Slides List
                            </h2>
                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                                Total: {slides.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                        <th className="px-6 py-4 border-b">Order</th>
                                        <th className="px-6 py-4 border-b">Image</th>
                                        <th className="px-6 py-4 border-b">Content</th>
                                        <th className="px-6 py-4 border-b">Buttons</th>
                                        <th className="px-6 py-4 border-b text-center">Status</th>
                                        <th className="px-6 py-4 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {slides.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">
                                                No slides found. Add your first hero slide using the form.
                                            </td>
                                        </tr>
                                    ) : (
                                        slides.map((slide) => (
                                            <tr key={slide._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-black text-[#C8102E] text-sm text-center">
                                                    {slide.order}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-20 h-12 bg-gray-50 border border-gray-200 overflow-hidden shadow-sm">
                                                        <img
                                                            src={slide.image}
                                                            alt={slide.altText}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">{slide.subtitle}</div>
                                                    <div className="font-bold text-gray-900 text-sm line-clamp-1" dangerouslySetInnerHTML={{ __html: slide.title1 }}></div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic" dangerouslySetInnerHTML={{ __html: slide.description }}></div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
                                                            <LinkIcon size={10} className="text-[#C8102E]" /> {slide.button1Text}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
                                                            <LinkIcon size={10} className="text-[#C8102E]" /> {slide.button2Text}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <select
                                                        value={slide.isActive}
                                                        onChange={(e) => handleToggleStatus(slide, e.target.value === 'true')}
                                                        className={`px-2 py-1 rounded-none text-[10px] font-semibold uppercase border outline-none cursor-pointer transition-all ${
                                                            slide.isActive 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                                : 'bg-red-50 text-red-700 border-red-100'
                                                        }`}
                                                    >
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(slide)}
                                                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all shadow-sm"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(slide._id)}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all shadow-sm"
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

export default HomeSlider;

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
    MapPin,
    Globe,
    Tag,
    Layers,
    Navigation,
    List,
    Layout,
    ArrowUpRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [headings, setHeadings] = useState({
        subheading: 'Make every moment magical',
        heading: 'DISCOVER YOUR Destinations.',
        description: 'A world of your OWN experiences — authenticity and comfort that feels familiar.',
        toggleBg: '#F8FAFC',
        toggleTextColor: '#64748B',
        toggleActiveBg: '#F59E0B',
        toggleActiveTextColor: '#0F172A',
        toggleHoverColor: '#1E293B'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        region: 'Domestic',
        category: 'Mountains',
        tagline: '',
        tag: '',
        count: '',
        location: '',
        image: '',
        altText: '',
        order: 0
    });

    const regions = ['Domestic', 'International'];
    const categories = ['Mountains', 'Beaches', 'Deserts', 'Cities', 'Heritage', 'Wildlife', 'Adventure'];

    useEffect(() => {
        fetchDestinations();
        fetchHeadings();
    }, []);

    const fetchHeadings = async () => {
        try {
            const response = await api.get('/api/destinations/headings/public');
            if (response.data.success) {
                setHeadings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching headings:', error);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/destinations/headings', headings);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Global headings and styles updated',
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

    const fetchDestinations = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/destinations/admin');
            if (response.data.success) {
                setDestinations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
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
                const response = await api.post('/api/destinations/images', {
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: reader.result,
                    }
                });
                if (response.data.success) {
                    setForm(prev => ({ ...prev, image: response.data.data.url }));
                    Swal.fire({
                        icon: 'success',
                        title: 'Uploaded!',
                        text: 'Image uploaded successfully',
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to upload image', 'error');
            } finally {
                setIsLoading(false);
                if (inputElement) inputElement.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.image || !form.region || !form.category) {
            Swal.fire('Error', 'Name, Image, Region and Category are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/destinations/${isEditing}`, form);
            } else {
                response = await api.post('/api/destinations', form);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditing ? 'Destination updated' : 'Destination added',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchDestinations();
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
                const response = await api.delete(`/api/destinations/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Destination has been deleted.', 'success');
                    fetchDestinations();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete destination', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (dest) => {
        setIsEditing(dest._id);
        setForm({
            name: dest.name,
            slug: dest.slug || '',
            region: dest.region,
            category: dest.category,
            tagline: dest.tagline || '',
            tag: dest.tag || '',
            count: dest.count || '',
            location: dest.location || '',
            image: dest.image,
            altText: dest.altText || '',
            order: dest.order || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({
            name: '',
            slug: '',
            region: 'Domestic',
            category: 'Mountains',
            tagline: '',
            tag: '',
            count: '',
            location: '',
            image: '',
            altText: '',
            order: 0
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="DESTINATION MANAGEMENT"
                description="Manage global destinations for the home section and discover pages"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Headings and Form */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Global Headings Management */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                            <Type className="w-5 h-5" /> Global Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subheading</label>
                                <input
                                    type="text"
                                    value={headings.subheading}
                                    onChange={(e) => setHeadings({ ...headings, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-bold transition-all rounded-none"
                                    placeholder="Make every moment magical"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Main Heading (Editor)</label>
                                <RichTextEditor
                                    value={headings.heading}
                                    onChange={(val) => setHeadings({ ...headings, heading: val })}
                                    placeholder="DISCOVER YOUR Destinations."
                                    minHeight="100px"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bottom Description</label>
                                <textarea
                                    value={headings.description}
                                    onChange={(e) => setHeadings({ ...headings, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-bold transition-all rounded-none min-h-[80px]"
                                    placeholder="A world of your OWN experiences..."
                                />
                            </div>

                            <hr className="border-gray-100" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toggle Button Styles</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Base BG</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative group">
                                            <input type="color" value={headings.toggleBg} onChange={(e) => setHeadings({ ...headings, toggleBg: e.target.value })} className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0" />
                                            <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none" style={{ backgroundColor: headings.toggleBg }}></div>
                                        </div>
                                        <input type="text" value={headings.toggleBg} onChange={(e) => setHeadings({ ...headings, toggleBg: e.target.value })} className="flex-1 text-[10px] border-b border-gray-200 outline-none font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Base Text</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative group">
                                            <input type="color" value={headings.toggleTextColor} onChange={(e) => setHeadings({ ...headings, toggleTextColor: e.target.value })} className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0" />
                                            <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none" style={{ backgroundColor: headings.toggleTextColor }}></div>
                                        </div>
                                        <input type="text" value={headings.toggleTextColor} onChange={(e) => setHeadings({ ...headings, toggleTextColor: e.target.value })} className="flex-1 text-[10px] border-b border-gray-200 outline-none font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Active BG</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative group">
                                            <input type="color" value={headings.toggleActiveBg} onChange={(e) => setHeadings({ ...headings, toggleActiveBg: e.target.value })} className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0" />
                                            <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none" style={{ backgroundColor: headings.toggleActiveBg }}></div>
                                        </div>
                                        <input type="text" value={headings.toggleActiveBg} onChange={(e) => setHeadings({ ...headings, toggleActiveBg: e.target.value })} className="flex-1 text-[10px] border-b border-gray-200 outline-none font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Active Text</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative group">
                                            <input type="color" value={headings.toggleActiveTextColor} onChange={(e) => setHeadings({ ...headings, toggleActiveTextColor: e.target.value })} className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0" />
                                            <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none" style={{ backgroundColor: headings.toggleActiveTextColor }}></div>
                                        </div>
                                        <input type="text" value={headings.toggleActiveTextColor} onChange={(e) => setHeadings({ ...headings, toggleActiveTextColor: e.target.value })} className="flex-1 text-[10px] border-b border-gray-200 outline-none font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview Area */}
                            <div className="mt-4 p-4 bg-gray-50 border border-gray-100 flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase text-gray-400 mb-3 tracking-widest">Live Toggle Preview</span>
                                <div 
                                    className="relative inline-flex items-center p-1 rounded-full border border-gray-200 overflow-hidden"
                                    style={{ backgroundColor: headings.toggleBg }}
                                >
                                    <div 
                                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-sm"
                                        style={{ backgroundColor: headings.toggleActiveBg, left: '4px' }}
                                    />
                                    <div className="relative z-10 px-4 py-2 text-[8px] font-black uppercase tracking-tighter" style={{ color: headings.toggleActiveTextColor }}>
                                        Domestic
                                    </div>
                                    <div className="relative z-10 px-4 py-2 text-[8px] font-black uppercase tracking-tighter" style={{ color: headings.toggleTextColor }}>
                                        International
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-3 bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] shadow-lg"
                            >
                                <Save className="w-4 h-4" /> Update Global Settings
                            </button>
                        </div>
                    </div>

                    {/* Add/Edit Form Card */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Destination' : 'Add New Destination'}
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Region</label>
                                    <select
                                        value={form.region}
                                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-gray-50 transition-all"
                                    >
                                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-gray-50 transition-all"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Destination Name (Title)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm font-bold rounded-none transition-all"
                                        placeholder="Manali"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Slug / URL (Optional)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm font-bold rounded-none transition-all"
                                        placeholder="manali-trips"
                                    />
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1 italic">Leave blank to auto-generate</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Location / Subtitle</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm rounded-none transition-all"
                                        placeholder="Himachal Pradesh, India"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tag (Floating)</label>
                                    <input
                                        type="text"
                                        value={form.tag}
                                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                        placeholder="Himalayan Retreat"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Count Text</label>
                                    <input
                                        type="text"
                                        value={form.count}
                                        onChange={(e) => setForm({ ...form, count: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm rounded-none font-medium"
                                        placeholder="14 Heritage Resorts"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tagline</label>
                                <textarea
                                    value={form.tagline}
                                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                    rows="2"
                                    placeholder="Adventure Wrapped in Snow"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Order</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-sm rounded-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Image (Cloudinary)</label>
                                <div className="flex items-start gap-4">
                                    <div className="relative w-32 h-24 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                                        {form.image ? (
                                            <img src={form.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
                                            value={form.image}
                                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                                            className="w-full px-2 py-1 border-b-2 border-gray-200 outline-none text-[10px] bg-transparent focus:border-[#C8102E] transition-all"
                                            placeholder="Image URL..."
                                        />
                                        <input
                                            type="text"
                                            value={form.altText}
                                            onChange={(e) => setForm({ ...form, altText: e.target.value })}
                                            className="w-full px-2 py-1 border-b-2 border-gray-200 outline-none text-[10px] bg-transparent focus:border-[#C8102E] transition-all"
                                            placeholder="Alt Text (SEO)..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#C8102E] text-white font-bold hover:bg-[#a00d25] transition-all rounded-none uppercase tracking-widest text-xs shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> {isEditing ? 'Update Destination' : 'Add Destination'}
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

                {/* Right Section: Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-none">
                        <div className="px-6 py-4 border-b bg-[#021A54] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <List className="w-5 h-5 text-white" /> Destinations List
                            </h2>
                            <div className="flex gap-4">
                                <span className="bg-white/10 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                    Total: {destinations.length}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b">
                                        <th className="px-6 py-4 border-b">Region / Cat</th>
                                        <th className="px-6 py-4 border-b">Image</th>
                                        <th className="px-6 py-4 border-b">Title & Location</th>
                                        <th className="px-6 py-4 border-b">Tag & Count</th>
                                        <th className="px-6 py-4 border-b text-center">Order</th>
                                        <th className="px-6 py-4 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {destinations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">
                                                <div className="flex flex-col items-center gap-3">
                                                    <MapPin size={40} className="text-gray-100" />
                                                    No destinations found.
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        destinations.map((dest) => (
                                            <tr key={dest._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span 
                                                        className={`block text-[10px] font-semibold uppercase tracking-widest mb-1 ${dest.region === 'Domestic' ? 'text-green-600' : 'text-blue-600'}`}
                                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                                    >
                                                        {dest.region}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5">
                                                        {dest.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-12 bg-gray-50 border-2 border-gray-100 overflow-hidden shadow-sm">
                                                        <img
                                                            src={dest.image}
                                                            alt={dest.altText}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-sm">{dest.name}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5 font-medium flex items-center gap-1">
                                                        <Navigation size={10} /> {dest.location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] font-bold text-amber-600">{dest.tag}</div>
                                                    <div className="text-[10px] text-gray-500 font-medium">{dest.count}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-gray-100 text-slate-900 font-black text-xs border-2 border-gray-200">
                                                        {dest.order || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(dest)}
                                                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(dest._id)}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100"
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

export default Destinations;

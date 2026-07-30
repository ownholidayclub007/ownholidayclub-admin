import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Save,
    Type,
    Image as ImageIcon,
    Plus,
    Trash2,
    Briefcase,
    Layout,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    Search,
    Globe,
    Plane,
    Calendar,
    Thermometer,
    Link as LinkIcon
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ServiceDetails = () => {
    const [allServiceCards, setAllServiceCards] = useState([]);
    const [selectedServiceTitle, setSelectedServiceTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentDetailId, setCurrentDetailId] = useState(null);
    
    const [details, setDetails] = useState({
        serviceTitle: '',
        slug: '',
        shortDescription: '',
        fullDescription: '',
        quickStats: {
            bestTime: '',
            temp: '',
            flight: '',
            timezone: ''
        },
        gallery: [],
        highlights: []
    });

    useEffect(() => {
        fetchServiceCards();
    }, []);

    const fetchServiceCards = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/explore-services');
            if (response.data.success) {
                setAllServiceCards(response.data.data.services || []);
            }
        } catch (error) {
            console.error('Error fetching service cards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelection = async (title) => {
        setSelectedServiceTitle(title);
        if (!title) {
            resetForm();
            return;
        }

        setIsLoading(true);
        try {
            // Check if details already exist for this service title
            const response = await api.get('/api/service-details/admin');
            if (response.data.success) {
                const existing = response.data.data.find(s => s.serviceTitle === title);
                if (existing) {
                    setCurrentDetailId(existing._id);
                    setDetails({
                        serviceTitle: existing.serviceTitle,
                        slug: existing.slug || '',
                        shortDescription: existing.shortDescription || '',
                        fullDescription: existing.fullDescription || '',
                        quickStats: {
                            bestTime: existing.quickStats?.bestTime || '',
                            temp: existing.quickStats?.temp || '',
                            flight: existing.quickStats?.flight || '',
                            timezone: existing.quickStats?.timezone || ''
                        },
                        gallery: existing.gallery || [],
                        highlights: existing.highlights || []
                    });
                } else {
                    setCurrentDetailId(null);
                    setDetails({
                        serviceTitle: title,
                        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, ''),
                        shortDescription: '',
                        fullDescription: '',
                        quickStats: { bestTime: '', temp: '', flight: '', timezone: '' },
                        gallery: [],
                        highlights: []
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedServiceTitle) {
            Swal.fire('Warning', 'Please select a service first', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (currentDetailId) {
                response = await api.put(`/api/service-details/${currentDetailId}`, details);
            } else {
                response = await api.post('/api/service-details', details);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Service details saved successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                if (!currentDetailId) {
                    setCurrentDetailId(response.data.data._id);
                }
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentDetailId(null);
        setDetails({
            serviceTitle: '',
            slug: '',
            shortDescription: '',
            fullDescription: '',
            quickStats: { bestTime: '', temp: '', flight: '', timezone: '' },
            gallery: [],
            highlights: []
        });
    };

    // --- Dynamic Arrays Handlers ---
    const addGalleryItem = () => setDetails({ ...details, gallery: [...details.gallery, ''] });
    const updateGalleryItem = (index, val) => {
        const newGallery = [...details.gallery];
        newGallery[index] = val;
        setDetails({ ...details, gallery: newGallery });
    };
    const removeGalleryItem = (index) => setDetails({ ...details, gallery: details.gallery.filter((_, i) => i !== index) });

    const addHighlight = () => setDetails({ ...details, highlights: [...details.highlights, ''] });
    const updateHighlight = (index, val) => {
        const newHighlights = [...details.highlights];
        newHighlights[index] = val;
        setDetails({ ...details, highlights: newHighlights });
    };
    const removeHighlight = (index) => setDetails({ ...details, highlights: details.highlights.filter((_, i) => i !== index) });

    const handleImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const response = await api.post('/api/service-details/images', {
                    file: { name: file.name, type: file.type, dataUrl: reader.result }
                });
                if (response.data.success) {
                    updateGalleryItem(index, response.data.data.url);
                    Swal.fire({ icon: 'success', title: 'Uploaded!', timer: 800, showConfirmButton: false });
                }
            } catch (err) {
                Swal.fire('Error', 'Image upload failed', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen pb-20">
            <PageHeader 
                title="SERVICE DETAILS MANAGEMENT" 
                description="Manage rich content, descriptions, and highlights for specific services"
            />

            {/* Selection Panel */}
            <div className="bg-white border-2 border-gray-200 p-6 mb-8 shadow-sm rounded-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#C8102E] uppercase tracking-wider">
                            <Briefcase className="w-4 h-4" /> 1. Select Service
                        </h2>
                        <div className="relative">
                            <select
                                value={selectedServiceTitle}
                                onChange={(e) => handleServiceSelection(e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-[11px] font-semibold uppercase tracking-wider bg-white transition-all cursor-pointer appearance-none"
                            >
                                <option value="">-- CHOOSE SERVICE --</option>
                                {allServiceCards.map(s => (
                                    <option key={s._id} value={s.title}>{s.title}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#DE802B] uppercase tracking-wider">
                            <LinkIcon className="w-4 h-4" /> 2. URL Slug
                        </h2>
                        <input
                            type="text"
                            value={details.slug}
                            onChange={(e) => setDetails({ ...details, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="w-full p-3 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-[11px] font-semibold tracking-wider bg-white transition-all"
                            placeholder="service-slug-name"
                        />
                    </div>
                </div>
            </div>

            {selectedServiceTitle ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN (1/3) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#C8102E] uppercase tracking-widest">
                                <Type className="w-4 h-4" /> Short Description
                            </h2>
                            <textarea
                                value={details.shortDescription}
                                onChange={(e) => setDetails({ ...details, shortDescription: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-sm rounded-none min-h-[120px] bg-gray-50/30 transition-all font-medium"
                                placeholder="Short summary for the service detail page..."
                            />
                        </div>

                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#DE802B] uppercase tracking-widest">
                                <Plane className="w-4 h-4" /> Service Quick Stats
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Availability</label>
                                        <input
                                            type="text"
                                            value={details.quickStats.bestTime}
                                            onChange={(e) => setDetails({ ...details, quickStats: { ...details.quickStats, bestTime: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="Year round"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Avg Cost</label>
                                        <input
                                            type="text"
                                            value={details.quickStats.temp}
                                            onChange={(e) => setDetails({ ...details, quickStats: { ...details.quickStats, temp: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="Variable"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Response Time</label>
                                        <input
                                            type="text"
                                            value={details.quickStats.flight}
                                            onChange={(e) => setDetails({ ...details, quickStats: { ...details.quickStats, flight: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="24-48 Hours"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Service Areas</label>
                                        <input
                                            type="text"
                                            value={details.quickStats.timezone}
                                            onChange={(e) => setDetails({ ...details, quickStats: { ...details.quickStats, timezone: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="Pan India"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-bold flex items-center gap-2 text-[#C8102E] uppercase tracking-widest">
                                    <Sparkles className="w-4 h-4" /> Service Highlights
                                </h2>
                                <button onClick={addHighlight} className="p-1 bg-[#C8102E] text-white rounded-none hover:bg-[#a00d25]">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {details.highlights.map((h, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={h}
                                            onChange={(e) => updateHighlight(i, e.target.value)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-50 focus:border-[#C8102E] outline-none text-xs font-medium rounded-none bg-gray-50/50"
                                            placeholder={`Highlight #${i+1}`}
                                        />
                                        <button onClick={() => removeHighlight(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#C8102E] uppercase tracking-widest">
                                <Layout className="w-4 h-4" /> Full Description (Editor)
                            </h2>
                            <RichTextEditor
                                value={details.fullDescription}
                                onChange={(val) => setDetails({ ...details, fullDescription: val })}
                                placeholder="Describe the service in detail..."
                                minHeight="300px"
                            />
                        </div>

                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-bold flex items-center gap-2 text-[#DE802B] uppercase tracking-widest">
                                    <ImageIcon className="w-4 h-4" /> Image Gallery
                                </h2>
                                <button onClick={addGalleryItem} className="px-4 py-2 bg-[#DE802B] text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#c66d21] shadow-sm transition-all">
                                    + Add Image
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {details.gallery.map((url, i) => (
                                    <div key={i} className="relative aspect-video bg-gray-50 border-2 border-gray-100 group overflow-hidden">
                                        {url ? (
                                            <>
                                                <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => removeGalleryItem(i)} className="p-2 bg-red-500 text-white hover:bg-red-600 shadow-xl scale-90 group-hover:scale-100 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer relative">
                                                <Plus className="text-gray-200 w-8 h-8" />
                                                <input type="file" onChange={(e) => handleImageUpload(i, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-200 bg-gray-50/30">
                    <Briefcase className="w-12 h-12 text-gray-200 mb-4" />
                    <h3 className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm italic">SELECT SERVICE TO START</h3>
                </div>
            )}

            {/* Sticky Actions Bar */}
            {selectedServiceTitle && (
                <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t-2 border-gray-100 p-4 z-40 flex justify-end gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-12 py-4 bg-[#C8102E] text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-[#a00d25] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        Save Details
                    </button>
                </div>
            )}
        </div>
    );
};

export default ServiceDetails;

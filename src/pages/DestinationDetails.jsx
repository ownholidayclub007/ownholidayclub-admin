import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Save,
    Type,
    Image as ImageIcon,
    Plus,
    Trash2,
    Globe,
    MapPin,
    Clock,
    Plane,
    Thermometer,
    Calendar,
    Star,
    Layout,
    List,
    Sparkles,
    Building2,
    CheckCircle2,
    ChevronRight,
    Search
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const DestinationDetails = () => {
    const [allDestinations, setAllDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('Domestic');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [details, setDetails] = useState({
        shortDescription: '',
        fullDescription: '',
        travelStats: {
            bestTime: '',
            temp: '',
            flight: '',
            timezone: ''
        },
        gallery: [],
        highlights: [],
        properties: []
    });

    useEffect(() => {
        fetchAllDestinations();
    }, []);

    useEffect(() => {
        const filtered = allDestinations.filter(d => d.region === selectedRegion);
        setFilteredDestinations(filtered);
        // Reset if region changes and selected dest is not in new list
        if (!filtered.find(d => d._id === selectedDestId)) {
            setSelectedDestId('');
            resetForm();
        }
    }, [selectedRegion, allDestinations]);

    const fetchAllDestinations = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/destinations/admin');
            if (response.data.success) {
                setAllDestinations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDestSelection = (id) => {
        setSelectedDestId(id);
        const dest = allDestinations.find(d => d._id === id);
        if (dest) {
            setDetails({
                shortDescription: dest.shortDescription || '',
                fullDescription: dest.fullDescription || '',
                travelStats: {
                    bestTime: dest.travelStats?.bestTime || '',
                    temp: dest.travelStats?.temp || '',
                    flight: dest.travelStats?.flight || '',
                    timezone: dest.travelStats?.timezone || ''
                },
                gallery: dest.gallery || [],
                highlights: dest.highlights || [],
                properties: dest.properties || []
            });
        }
    };

    const handleSave = async () => {
        if (!selectedDestId) {
            Swal.fire('Warning', 'Please select a destination first', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            // Sanitize ID just in case it has suffixes like :1
            const cleanId = selectedDestId.split(':')[0];
            const response = await api.put(`/api/destinations/${cleanId}`, details);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Destination details updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchAllDestinations(); 
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setDetails({
            shortDescription: '',
            fullDescription: '',
            travelStats: { bestTime: '', temp: '', flight: '', timezone: '' },
            gallery: [],
            highlights: [],
            properties: []
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

    const addProperty = () => setDetails({ ...details, properties: [...details.properties, { name: '', type: '', rating: '5.0', image: '' }] });
    const updateProperty = (index, field, val) => {
        const newProps = [...details.properties];
        newProps[index][field] = val;
        setDetails({ ...details, properties: newProps });
    };
    const removeProperty = (index) => setDetails({ ...details, properties: details.properties.filter((_, i) => i !== index) });

    const handleImageUpload = (index, field, e, isProperty = false) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const response = await api.post('/api/destinations/images', {
                    file: { name: file.name, type: file.type, dataUrl: reader.result }
                });
                if (response.data.success) {
                    if (isProperty) {
                        updateProperty(index, 'image', response.data.data.url);
                    } else {
                        updateGalleryItem(index, response.data.data.url);
                    }
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
                title="DESTINATION DETAILS MANAGEMENT" 
                description="Manage rich content, descriptions, and property listings for specific destinations"
            />

            {/* Selection Panel - Integrated Style */}
            <div className="bg-white border-2 border-gray-200 p-6 mb-8 shadow-sm rounded-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#C8102E] uppercase tracking-wider">
                            <Globe className="w-4 h-4" /> 1. Select Region
                        </h2>
                        <div className="flex gap-0 border-2 border-gray-200">
                            {['Domestic', 'International'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setSelectedRegion(r)}
                                    className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${selectedRegion === r ? 'bg-[#C8102E] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {r === 'Domestic' ? 'In India' : 'International'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#DE802B] uppercase tracking-wider">
                            <MapPin className="w-4 h-4" /> 2. Select Destination
                        </h2>
                        <div className="relative">
                            <select
                                value={selectedDestId}
                                onChange={(e) => handleDestSelection(e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 focus:border-[#C8102E] outline-none text-[11px] font-black uppercase tracking-wider bg-white transition-all cursor-pointer appearance-none"
                            >
                                <option value="">-- CHOOSE DESTINATION --</option>
                                {filteredDestinations.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedDestId ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN (1/3): Descriptions & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Section: Short Description */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#C8102E] uppercase tracking-widest">
                                <Type className="w-4 h-4" /> Short Description
                            </h2>
                            <textarea
                                value={details.shortDescription}
                                onChange={(e) => setDetails({ ...details, shortDescription: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-sm rounded-none min-h-[120px] bg-gray-50/30 transition-all font-medium"
                                placeholder="Summary for cards..."
                            />
                        </div>

                        {/* Section: Travel Stats */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#DE802B] uppercase tracking-widest">
                                <Plane className="w-4 h-4" /> Travel Quick Stats
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Best Time</label>
                                        <input
                                            type="text"
                                            value={details.travelStats.bestTime}
                                            onChange={(e) => setDetails({ ...details, travelStats: { ...details.travelStats, bestTime: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="Oct to Mar"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Avg Temp</label>
                                        <input
                                            type="text"
                                            value={details.travelStats.temp}
                                            onChange={(e) => setDetails({ ...details, travelStats: { ...details.travelStats, temp: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="22°C - 32°C"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Flight Access</label>
                                        <input
                                            type="text"
                                            value={details.travelStats.flight}
                                            onChange={(e) => setDetails({ ...details, travelStats: { ...details.travelStats, flight: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="Direct access"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Timezone</label>
                                        <input
                                            type="text"
                                            value={details.travelStats.timezone}
                                            onChange={(e) => setDetails({ ...details, travelStats: { ...details.travelStats, timezone: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-gray-100 focus:border-[#C8102E] outline-none text-xs font-bold rounded-none"
                                            placeholder="GMT +5:30"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Highlights */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-bold flex items-center gap-2 text-[#C8102E] uppercase tracking-widest">
                                    <Sparkles className="w-4 h-4" /> Highlights
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
                                            placeholder={`Point #${i+1}`}
                                        />
                                        <button onClick={() => removeHighlight(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {details.highlights.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-2">No highlights added.</p>}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (2/3): Full Description, Gallery & Properties */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Section: Full Description */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#C8102E] uppercase tracking-widest">
                                <Layout className="w-4 h-4" /> Full Description (Editor)
                            </h2>
                            <RichTextEditor
                                value={details.fullDescription}
                                onChange={(val) => setDetails({ ...details, fullDescription: val })}
                                placeholder="Tell the full story of this destination..."
                                minHeight="250px"
                            />
                        </div>

                        {/* Section: Gallery */}
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
                                                <input type="file" onChange={(e) => handleImageUpload(i, 'gallery', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section: Properties */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-bold flex items-center gap-2 text-[#021A54] uppercase tracking-widest">
                                    <Building2 className="w-4 h-4" /> Linked Properties
                                </h2>
                                <button onClick={addProperty} className="px-4 py-2 bg-[#021A54] text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#011440] shadow-sm transition-all">
                                    + Add Property
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {details.properties.map((p, i) => (
                                    <div key={i} className="p-4 border-2 border-gray-50 bg-gray-50/30 flex gap-4 relative group">
                                        <button onClick={() => removeProperty(i)} className="absolute -top-2 -right-2 p-1.5 bg-white text-gray-300 hover:text-red-500 border-2 border-gray-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="w-20 h-20 bg-white border-2 border-gray-100 relative overflow-hidden flex-shrink-0">
                                            {p.image ? (
                                                <img src={p.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <Plus className="m-auto text-gray-100 w-8 h-8" />
                                            )}
                                            <input type="file" onChange={(e) => handleImageUpload(i, 'image', e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={p.name}
                                                onChange={(e) => updateProperty(i, 'name', e.target.value)}
                                                className="w-full px-2 py-1 border-b border-gray-200 focus:border-[#C8102E] outline-none text-[11px] font-bold bg-transparent transition-all"
                                                placeholder="Resort Name"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={p.type}
                                                    onChange={(e) => updateProperty(i, 'type', e.target.value)}
                                                    className="w-full px-2 py-1 border-b border-gray-100 focus:border-[#C8102E] outline-none text-[9px] font-medium bg-transparent transition-all"
                                                    placeholder="Type"
                                                />
                                                <div className="flex items-center gap-1 border-b border-gray-100 px-1">
                                                    <Star size={8} className="text-amber-500" />
                                                    <input
                                                        type="text"
                                                        value={p.rating}
                                                        onChange={(e) => updateProperty(i, 'rating', e.target.value)}
                                                        className="w-full py-1 outline-none text-[9px] font-bold bg-transparent"
                                                        placeholder="4.8"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-200 bg-gray-50/30">
                    <MapPin className="w-12 h-12 text-gray-200 mb-4" />
                    <h3 className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm italic">SELECT DESTINATION TO START</h3>
                </div>
            )}

            {/* Sticky Actions Bar */}
            {selectedDestId && (
                <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t-2 border-gray-100 p-4 z-40 flex justify-end gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-12 py-4 bg-[#C8102E] text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-[#a00d25] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default DestinationDetails;

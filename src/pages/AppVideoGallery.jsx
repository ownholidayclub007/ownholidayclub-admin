import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Edit, Layout, Video, CheckCircle2, FileVideo, Play, Eye, Camera } from 'lucide-react';
import { FaYoutube, FaInstagram } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from "../lib/api";
import PageHeader from '../components/PageHeader';

const EMPTY_FORM = {
    title: '',
    image: '',
    videoUrl: '',
    views: '',
    uploaderName: '',
    order: '',
    videoType: 'youtube'
};

const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1]?.split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/embed/")) videoId = url.split("embed/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/shorts/")) videoId = url.split("shorts/")[1]?.split("?")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

const getInstagramThumbnail = (url) => {
    if (!url) return null;
    let shortcode = "";
    if (url.includes("instagram.com/reel/")) {
        shortcode = url.split("instagram.com/reel/")[1]?.split("/")[0]?.split("?")[0];
    } else if (url.includes("instagram.com/p/")) {
        shortcode = url.split("instagram.com/p/")[1]?.split("/")[0]?.split("?")[0];
    } else if (url.includes("instagr.am/p/")) {
        shortcode = url.split("instagr.am/p/")[1]?.split("/")[0]?.split("?")[0];
    }
    return shortcode ? `https://www.instagram.com/p/${shortcode}/media/?size=l` : null;
};

const getInstagramEmbedUrl = (url) => {
    if (!url) return "";
    let cleanUrl = url.split("?")[0];
    if (!cleanUrl.endsWith("/")) {
        cleanUrl += "/";
    }
    return `${cleanUrl}embed/`;
};

const VideoTable = ({ title, videos, onView, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(videos.length / itemsPerPage) || 1;

    const currentVideos = videos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [videos.length]);

    return (
        <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b bg-[#C8102E]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#DE802B]" /> {title}
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                            <th className="px-4 py-2 border-b">Order</th>
                            <th className="px-4 py-2 border-b">Video URL</th>
                            <th className="px-4 py-2 border-b">Views</th>
                            <th className="px-4 py-2 border-b">Uploader</th>
                            <th className="px-4 py-2 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentVideos.length > 0 ? currentVideos.map((vid) => (
                            <tr key={vid._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 font-bold text-[#C8102E]">{vid.order}</td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center text-[#DE802B] relative group/preview">
                                            {vid.image ? (
                                                <img src={vid.image} className="w-full h-full object-cover" alt="Custom Thumbnail" />
                                            ) : vid.videoUrl && (vid.videoUrl.includes('youtube.com') || vid.videoUrl.includes('youtu.be')) ? (
                                                <img
                                                    src={getYouTubeThumbnail(vid.videoUrl)}
                                                    className="w-full h-full object-cover"
                                                    alt="Thumbnail"
                                                    onError={(e) => { e.target.src = "https://placehold.co/64x40?text=NA"; }}
                                                />
                                            ) : vid.videoUrl && (vid.videoUrl.includes('instagram.com') || vid.videoUrl.includes('instagr.am')) ? (
                                                <div className="w-full h-full pointer-events-none overflow-hidden relative flex items-center justify-center bg-black">
                                                    <img
                                                        src={getInstagramThumbnail(vid.videoUrl)}
                                                        className="w-full h-full object-cover absolute z-10"
                                                        alt="Insta"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    <iframe
                                                        src={getInstagramEmbedUrl(vid.videoUrl)}
                                                        className="w-[125%] h-[200%] border-0 opacity-80 absolute z-0"
                                                        scrolling="no"
                                                    />
                                                </div>
                                            ) : vid.videoUrl ? (
                                                <video src={`${vid.videoUrl}#t=0.5`} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                            ) : (
                                                <Play className="w-5 h-5 fill-current" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                                <Play className="w-4 h-4 text-white fill-current" />
                                            </div>
                                        </div>
                                        <div>
                                            {vid.title && <h3 className="font-bold text-slate-800 uppercase tracking-tight line-clamp-1 text-xs">{vid.title}</h3>}
                                            <div className="text-[10px] font-medium text-gray-500 break-all max-w-[200px] line-clamp-1">
                                                {vid.videoUrl}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 font-medium text-gray-600">{vid.views || <span className="text-gray-400 italic font-normal">—</span>}</td>
                                <td className="px-4 py-2 font-medium text-gray-600">{vid.uploaderName || <span className="text-gray-400 italic font-normal">—</span>}</td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => onView(vid)} className="p-1.5 text-green-600 hover:bg-green-50 transition-colors rounded" title="View">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onEdit(vid)} className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors rounded" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(vid._id)} className="p-1.5 text-red-600 hover:bg-red-50 transition-colors rounded" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No videos found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
                    <span className="text-sm font-semibold text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold disabled:opacity-50 hover:bg-gray-100 transition-colors text-gray-700"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-3 py-1 bg-[#C8102E] text-white border border-[#C8102E] rounded text-xs font-bold disabled:opacity-50 hover:bg-[#a00d24] transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AppVideoGallery = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [videos, setVideos] = useState([]);
    const [isEditing, setIsEditing] = useState(null);

    const [videoType, setVideoType] = useState('youtube');
    const [videoFile, setVideoFile] = useState(null);
    const videoInputRef = useRef(null);

    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const coverImageInputRef = useRef(null);

    const [headings, setHeadings] = useState({
        heading: "Trending Shorts",
        subHeading: "Powered by Shorts",
        iconWord: "Shorts"
    });

    const [form, setForm] = useState({ ...EMPTY_FORM });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [headingsRes, videosRes] = await Promise.all([
                api.get('/api/app-video-gallery/headings'),
                api.get('/api/app-video-gallery/videos')
            ]);
            if (headingsRes.data.success) setHeadings(headingsRes.data.data);
            if (videosRes.data.success) setVideos(videosRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingChange = (e) => {
        const { name, value } = e.target;
        setHeadings(prev => ({ ...prev, [name]: value }));
    };

    const saveHeadings = async () => {
        try {
            setIsLoading(true);
            const res = await api.put('/api/app-video-gallery/headings', headings);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Saved!', text: 'Headings updated successfully', timer: 2000, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update headings' });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setVideoType('youtube');
        setVideoFile(null);
        setCoverImageFile(null);
        setCoverImagePreview('');
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVideoFile(file);
    };

    const uploadVideo = async () => {
        if (!videoFile) return form.videoUrl;

        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(videoFile);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const res = await api.post('/api/app-video-gallery/upload', { file: { dataUrl: base64 } });
        if (res.data.success) return res.data.data.url;
        throw new Error('Video upload failed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (videoType === 'youtube' && !form.videoUrl) {
            Swal.fire('Warning', 'Please enter a YouTube link', 'warning');
            return;
        }
        if (videoType === 'instagram' && !form.videoUrl) {
            Swal.fire('Warning', 'Please enter an Instagram link', 'warning');
            return;
        }
        if (videoType === 'upload' && !videoFile && !form.videoUrl) {
            Swal.fire('Warning', 'Please upload a video file', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let finalVideoUrl = form.videoUrl;
            if (videoType === 'upload' && videoFile) {
                finalVideoUrl = await uploadVideo();
            }

            let finalImageUrl = form.image;
            if (coverImageFile) {
                const base64Img = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(coverImageFile);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
                const imgRes = await api.post('/api/app-video-gallery/upload', { file: { dataUrl: base64Img } });
                if (imgRes.data.success) {
                    finalImageUrl = imgRes.data.data.url;
                }
            }

            const payload = {
                title: form.title,
                image: finalImageUrl,
                videoUrl: finalVideoUrl,
                views: form.views,
                uploaderName: form.uploaderName,
                order: form.order === "" ? null : Number(form.order)
            };

            let response;
            if (isEditing) {
                response = await api.put(`/api/app-video-gallery/videos/${isEditing}`, payload);
            } else {
                response = await api.post('/api/app-video-gallery/videos', payload);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Video Updated!' : 'Video Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchData();
            }
        } catch (error) {
            console.error('Error saving video:', error);
            Swal.fire('Error', 'Failed to save video', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Video?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C8102E',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/app-video-gallery/videos/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (vid) => {
        setIsEditing(vid._id);
        const isYoutube = vid.videoUrl && (vid.videoUrl.includes('youtube.com') || vid.videoUrl.includes('youtu.be'));
        const isInstagram = vid.videoUrl && (vid.videoUrl.includes('instagram.com') || vid.videoUrl.includes('instagr.am'));
        setVideoType(isYoutube ? 'youtube' : isInstagram ? 'instagram' : 'upload');
        setForm({
            title: vid.title || '',
            image: vid.image || '',
            videoUrl: vid.videoUrl || '',
            views: vid.views || '',
            uploaderName: vid.uploaderName || '',
            order: vid.order !== undefined ? vid.order : ''
        });
        setVideoFile(null);
        setCoverImageFile(null);
        setCoverImagePreview(vid.image ? vid.image : '');
        window.scrollTo({ top: document.getElementById('video-form').offsetTop - 100, behavior: 'smooth' });
    };

    const handleView = (vid) => {
        let htmlContent = '';
        if (vid.videoUrl && (vid.videoUrl.includes('youtube.com') || vid.videoUrl.includes('youtu.be'))) {
            let videoId = "";
            if (vid.videoUrl.includes("youtube.com/watch?v=")) videoId = vid.videoUrl.split("v=")[1]?.split("&")[0];
            else if (vid.videoUrl.includes("youtu.be/")) videoId = vid.videoUrl.split("youtu.be/")[1]?.split("?")[0];
            else if (vid.videoUrl.includes("youtube.com/embed/")) videoId = vid.videoUrl.split("embed/")[1]?.split("?")[0];
            else if (vid.videoUrl.includes("youtube.com/shorts/")) videoId = vid.videoUrl.split("shorts/")[1]?.split("?")[0];
            htmlContent = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else if (vid.videoUrl && (vid.videoUrl.includes('instagram.com') || vid.videoUrl.includes('instagr.am'))) {
            htmlContent = `<div style="background:#fff;border-radius:8px;overflow:hidden;"><iframe width="100%" height="450" src="${getInstagramEmbedUrl(vid.videoUrl)}" frameborder="0" scrolling="no" allowtransparency="true"></iframe></div>`;
        } else {
            htmlContent = `<video width="100%" height="400" controls autoplay><source src="${vid.videoUrl}" type="video/mp4"></video>`;
        }

        Swal.fire({
            html: htmlContent,
            showCloseButton: true,
            showConfirmButton: false,
            width: '400px',
            padding: '0',
            background: 'transparent',
            customClass: {
                popup: 'rounded-lg overflow-hidden shadow-2xl bg-black',
                closeButton: 'text-white hover:text-red-500 transition-colors focus:outline-none'
            }
        });
    };

    const subHeadingWords = headings.subHeading ? headings.subHeading.split(' ') : [];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen rounded-lg">
            <PageHeader
                title="APP VIDEO GALLERY MANAGEMENT"
                description="Manage the &quot;Trending Shorts&quot; style video section for the mobile app"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Forms */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Headings Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                            <Layout className="w-5 h-5" /> Section Settings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Heading</label>
                                <input
                                    type="text"
                                    name="heading"
                                    value={headings.heading}
                                    onChange={handleHeadingChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-bold text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Sub-Heading</label>
                                <input
                                    type="text"
                                    name="subHeading"
                                    value={headings.subHeading}
                                    onChange={handleHeadingChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-bold text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Select word for YouTube icon placement</label>
                                <select
                                    name="iconWord"
                                    value={headings.iconWord}
                                    onChange={handleHeadingChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-bold text-[#C8102E]"
                                >
                                    <option value="">-- None --</option>
                                    {subHeadingWords.map((word, idx) => (
                                        <option key={idx} value={word}>{word}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <button
                                onClick={saveHeadings}
                                disabled={isLoading}
                                className="w-full py-2 bg-[#C8102E] text-white font-bold hover:bg-[#a00d24] transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Section Settings
                            </button>
                        </div>
                    </div>

                    {/* Add Video Form */}
                    <div id="video-form" className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Video Entry' : 'Add New Video Entry'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Video Source Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Video Source Type</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('youtube')}
                                        style={videoType === 'youtube' ? { backgroundColor: '#C8102E', borderColor: '#C8102E', color: 'white' } : {}}
                                        className={`flex-1 py-2 px-3 rounded border-2 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${videoType === 'youtube' ? 'shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <FaYoutube size={14} /> YouTube
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('instagram')}
                                        style={videoType === 'instagram' ? { backgroundImage: 'linear-gradient(to right, #f9ce3f, #e1306c, #833ab4)', borderColor: '#e1306c', color: 'white' } : {}}
                                        className={`flex-1 py-2 px-3 rounded border-2 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${videoType === 'instagram' ? 'shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <FaInstagram size={14} /> Instagram
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('upload')}
                                        style={videoType === 'upload' ? { backgroundColor: '#DE802B', borderColor: '#DE802B', color: 'white' } : {}}
                                        className={`flex-1 py-2 px-3 rounded border-2 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${videoType === 'upload' ? 'shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <FileVideo size={14} /> Upload Video
                                    </button>
                                </div>
                            </div>

                            {/* Video Input */}
                            {videoType === 'youtube' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube URL</label>
                                    <div className="relative flex items-center">
                                        <FaYoutube className="absolute left-3 text-red-500" size={16} />
                                        <input
                                            type="text"
                                            value={form.videoUrl}
                                            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2 pl-10 border-2 border-gray-200 focus:border-[#C8102E] outline-none shadow-sm text-sm font-medium"
                                            placeholder="e.g. https://www.youtube.com/shorts/..."
                                        />
                                    </div>
                                </div>
                            ) : videoType === 'instagram' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
                                    <div className="relative flex items-center">
                                        <FaInstagram className="absolute left-3 text-pink-500" size={16} />
                                        <input
                                            type="text"
                                            value={form.videoUrl}
                                            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2 pl-10 border-2 border-gray-200 focus:border-[#C8102E] outline-none shadow-sm text-sm font-medium"
                                            placeholder="e.g. https://www.instagram.com/reel/..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Video File</label>
                                    <div className="relative">
                                        {videoFile ? (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded">
                                                <FileVideo className="text-[#C8102E]" size={24} />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold truncate">{videoFile.name}</p>
                                                    <p className="text-[10px] text-gray-400">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                </div>
                                                <button type="button" onClick={() => setVideoFile(null)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : form.videoUrl && !form.videoUrl.startsWith('http') ? (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-[#C8102E]/20 rounded group">
                                                <Play className="text-[#C8102E]" size={24} />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold truncate">Current: {form.videoUrl.split('/').pop()}</p>
                                                    <p className="text-[10px] text-[#C8102E] font-bold uppercase tracking-widest">Uploaded File</p>
                                                </div>
                                                <label className="p-2 text-[#C8102E] hover:bg-[#C8102E]/10 rounded cursor-pointer">
                                                    <Edit size={14} />
                                                    <input ref={videoInputRef} type="file" className="hidden" onChange={handleVideoChange} accept="video/*" />
                                                </label>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#C8102E] hover:bg-gray-50 transition-all group">
                                                <Video className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#C8102E]" />
                                                <span className="text-xs text-gray-400 group-hover:text-[#C8102E]">Click to upload local video</span>
                                                <input ref={videoInputRef} type="file" className="hidden" onChange={handleVideoChange} accept="video/*" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Title (Optional)</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none shadow-sm text-sm"
                                    placeholder="e.g. Exploring the Mountains"
                                />
                            </div>

                            {/* Video Cover Image (Thumbnail) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Custom Thumbnail / Cover Image (Optional)
                                </label>
                                {coverImagePreview ? (
                                    <div className="relative h-28 border-2 border-gray-200 overflow-hidden mb-2">
                                        <img src={coverImagePreview} className="w-full h-full object-cover" alt="Cover Preview" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCoverImageFile(null);
                                                setCoverImagePreview('');
                                                setForm({ ...form, image: '' });
                                                if (coverImageInputRef.current) coverImageInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#C8102E] hover:bg-gray-50 transition-all group mb-2">
                                        <Camera className="w-6 h-6 text-gray-400 mb-1 group-hover:text-[#C8102E]" />
                                        <span className="text-xs text-gray-400 group-hover:text-[#C8102E]">Click to upload custom thumbnail</span>
                                        <input
                                            ref={coverImageInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setCoverImageFile(file);
                                                setCoverImagePreview(URL.createObjectURL(file));
                                            }}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Views Text (Optional)</label>
                                <input
                                    type="text"
                                    value={form.views}
                                    onChange={(e) => setForm({ ...form, views: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none shadow-sm text-sm"
                                    placeholder="e.g. 722K"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uploader Name (Optional)</label>
                                <input
                                    type="text"
                                    value={form.uploaderName}
                                    onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none shadow-sm text-sm"
                                    placeholder="e.g. Apoorva Rao"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order Number</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                                    placeholder="Auto-assigned if empty"
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#C8102E] outline-none shadow-sm text-sm"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#DE802B] text-white font-bold hover:bg-[#c66d21] transition-colors flex items-center justify-center gap-2 shadow-md"
                                >
                                    {isEditing ? <><Edit className="w-5 h-5" /> Update Video</> : <><Save className="w-5 h-5" /> Add Video</>}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Table List */}
                <div className="lg:col-span-2">
                    <VideoTable 
                        title="Video Gallery List" 
                        videos={videos} 
                        onView={handleView}
                        onEdit={startEdit} 
                        onDelete={handleDelete} 
                    />
                </div>
            </div>
        </div>
    );
};

export default AppVideoGallery;

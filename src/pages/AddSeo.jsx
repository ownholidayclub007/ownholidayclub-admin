import { useState, useEffect, useRef } from 'react';
import { Save, Globe, Pencil, Upload, Image as ImageIcon, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { useLocation, useNavigate } from 'react-router-dom';
import { pagesList } from '../data/pagesList';
import PageHeader from '../components/PageHeader';


const AddSeo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        page: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
        openGraphTags: "",
        schemaMarkup: "",
        canonicalTag: "",
        ogImage: null,
        ogImagePreview: null,
        isActive: true
    });

    // Editor Refs
    const ogEditorRef = useRef(null);
    const schemaEditorRef = useRef(null);
    const canonicalEditorRef = useRef(null);

    useEffect(() => {
        if (location.state && location.state.seoData) {
            const data = location.state.seoData;
            setFormData({
                page: data.page || "",
                metaTitle: data.metaTitle || "",
                metaKeywords: data.metaKeywords || "",
                metaDescription: data.metaDescription || "",
                openGraphTags: data.openGraphTags || "",
                schemaMarkup: data.schemaMarkup || "",
                canonicalTag: data.canonicalTag || "",
                ogImage: null,
                ogImagePreview: data.ogImage, // Use Cloudinary URL directly
                isActive: data.isActive
            });
            setEditId(data._id);
            setIsEditMode(true);
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'metaTitle' && value.length > 70) return;
        if (name === 'metaDescription' && value.length > 160) return;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    ogImage: reader.result,
                    ogImagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            ogImage: null,
            ogImagePreview: null
        }));
    };

    // ================= TEXT EDITOR COMMANDS =================
    const execCommand = (command, value = null, ref = null) => {
        document.execCommand(command, false, value);
        if (ref && ref.current) {
            ref.current.focus();
        }
    };

    const handleEditorInput = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const handleSubmit = async () => {
        if (!formData.page) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Page',
                text: 'Please select a page',
                confirmButtonColor: '#134698'
            });
            return;
        }

        try {
            setIsLoading(true);

            const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
            
            const payload = {
                page: formData.page,
                metaTitle: formData.metaTitle,
                metaKeywords: formData.metaKeywords,
                metaDescription: formData.metaDescription,
                openGraphTags: formData.openGraphTags,
                schemaMarkup: formData.schemaMarkup,
                canonicalTag: formData.canonicalTag,
                isActive: formData.isActive,
                updatedBy: adminInfo.username || "Admin User",
                ogImage: formData.ogImage // This will be base64 if newly uploaded
            };

            let response;
            if (isEditMode && editId) {
                response = await api.put(`/api/seo/update/${editId}`, payload);
            } else {
                response = await api.post('/api/seo/create', payload);
            }

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated!' : 'Success!',
                    text: `SEO data ${isEditMode ? 'updated' : 'added'} successfully`,
                    confirmButtonColor: '#134698',
                    timer: 2000
                });

                if (isEditMode) {
                    navigate('/meta-list');
                } else {
                    setFormData({
                        page: "",
                        metaTitle: "",
                        metaKeywords: "",
                        metaDescription: "",
                        openGraphTags: "",
                        schemaMarkup: "",
                        canonicalTag: "",
                        ogImage: null,
                        ogImagePreview: null,
                        isActive: true
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} SEO data`,
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const EditorToolbar = ({ targetRef }) => (
        <div className="border-b-2 border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
            <button
                type="button"
                onClick={() => execCommand("bold", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold shadow-sm rounded text-xs"
                title="Bold"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => execCommand("italic", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 italic shadow-sm rounded text-xs"
                title="Italic"
            >
                I
            </button>
            <button
                type="button"
                onClick={() => execCommand("underline", null, targetRef)}
                className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 underline shadow-sm rounded text-xs"
                title="Underline"
            >
                U
            </button>
        </div>
    );

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title={isEditMode ? 'EDIT SEO META' : 'ADD SEO META'}
                    description={isEditMode ? 'Update SEO meta tags' : 'Add SEO meta tags for website pages'}
                />

                <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50">
                            <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            SEO Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Page <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="page"
                                value={formData.page}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                                disabled={isEditMode}
                            >
                                <option value="">-- Select a Page --</option>
                                {pagesList.map((page, index) => (
                                    <option key={index} value={page.path}>
                                        {page.name} ({page.path})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-700">
                                    Meta Title
                                </label>
                                <span className={`text-[10px] font-bold ${formData.metaTitle.length > 55 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {formData.metaTitle.length}/70
                                </span>
                            </div>
                            <input
                                type="text"
                                name="metaTitle"
                                value={formData.metaTitle}
                                onChange={handleInputChange}
                                placeholder="Enter meta title"
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Meta Keywords
                            </label>
                            <input
                                type="text"
                                name="metaKeywords"
                                value={formData.metaKeywords}
                                onChange={handleInputChange}
                                placeholder="Enter meta keywords (comma separated)"
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-700">
                                    Meta Description
                                </label>
                                <span className={`text-[10px] font-bold ${formData.metaDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {formData.metaDescription.length}/160
                                </span>
                            </div>
                            <textarea
                                name="metaDescription"
                                value={formData.metaDescription}
                                onChange={handleInputChange}
                                placeholder="Enter meta description"
                                rows={3}
                                maxLength={160}
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        {/* Open Graph Tags Editor */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">
                                Open Graph Tags (HTML/Text) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="openGraphTags"
                                value={formData.openGraphTags}
                                onChange={(e) => handleEditorInput('openGraphTags', e.target.value)}
                                placeholder="Paste OG tags here..."
                                rows={6}
                                className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                            />
                        </div>

                        {/* Schema Markup Editor */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">
                                Schema Markup (JSON-LD) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="schemaMarkup"
                                value={formData.schemaMarkup}
                                onChange={(e) => handleEditorInput('schemaMarkup', e.target.value)}
                                placeholder="Paste JSON-LD schema here..."
                                rows={10}
                                className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                            />
                        </div>

                        {/* Canonical Tag Editor */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">
                                Canonical Tag <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="canonicalTag"
                                value={formData.canonicalTag}
                                onChange={handleInputChange}
                                placeholder="Enter canonical URL (e.g. https://ownholidayclub.com/page)"
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                OG Image
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center relative hover:bg-gray-50 transition-colors min-h-[100px] flex items-center justify-center">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                />
                                {formData.ogImagePreview ? (
                                    <div className="relative w-full">
                                        <img src={formData.ogImagePreview} alt="OG Preview" className="h-24 w-full object-cover rounded shadow-sm" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-20 hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <Upload className="w-6 h-6 text-gray-300 mx-auto" />
                                        <span className="text-[10px] text-gray-400 block mt-1 uppercase font-bold tracking-tighter">Upload OG Image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="isActive"
                                value={formData.isActive}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                            >
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 py-3 bg-[#6b21a8] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#581c87] flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
                                </>
                            ) : (
                                <>
                                    {isEditMode ? <Pencil className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    <span>{isEditMode ? 'Update SEO Data' : 'Save SEO Data'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSeo;

import { useState, useEffect } from 'react';
import { ImageIcon, Save, Trash2, Edit, Plus, CheckCircle, CheckCircle2, Layout } from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import PageHeader from '../components/PageHeader';

const ImageTable = ({ title, images, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(images.length / itemsPerPage);

    const currentImages = images.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [images.length]);

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
                            <th className="px-4 py-2 border-b">Image</th>
                            <th className="px-4 py-2 border-b">Text</th>
                            <th className="px-4 py-2 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentImages.length > 0 ? currentImages.map((img) => (
                            <tr key={img._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 font-bold text-[#C8102E]">{img.order}</td>
                                <td className="px-4 py-2">
                                    <div className="w-20 h-12 bg-gray-200 overflow-hidden rounded border border-gray-200">
                                        <img src={img.image?.url} alt="Gallery" className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-4 py-2 font-bold text-gray-900">{img.text || <span className="text-gray-400 italic font-normal">No text</span>}</td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => onEdit(img)} className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(img._id)} className="p-1.5 text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No images found.</td>
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
const AppGallery = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Headings State
    const [headings, setHeadings] = useState({
        featuredTitle: "",
        fullGalleryTitle: "",
        fullGallerySubtitle: ""
    });

    // Images State
    const [featuredImages, setFeaturedImages] = useState([]);
    const [fullGalleryImages, setFullGalleryImages] = useState([]);

    // Form State for Images
    const [imageForm, setImageForm] = useState({
        id: null,
        type: "featured", // 'featured' or 'full'
        image: null,
        text: "",
        order: ""
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isEditingImage, setIsEditingImage] = useState(false);

    // UI State
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        fetchGalleryData();
    }, []);

    // Auto-fill order number when section or images change
    useEffect(() => {
        if (selectedSection && !isEditingImage) {
            const targetImages = selectedSection === "featured" ? featuredImages : fullGalleryImages;
            const nextOrder = targetImages.length > 0 
                ? Math.max(...targetImages.map(img => img.order || 0)) + 1 
                : 1;
            
            setImageForm(prev => ({
                ...prev,
                type: selectedSection,
                order: nextOrder
            }));
        }
    }, [selectedSection, featuredImages, fullGalleryImages, isEditingImage]);

    const fetchGalleryData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/app-gallery');
            if (res.data.success) {
                setHeadings(res.data.data.settings);
                setFeaturedImages(res.data.data.featuredImages);
                setFullGalleryImages(res.data.data.fullGalleryImages);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch gallery data' });
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
            const res = await api.put('/api/app-gallery/headings', headings);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Saved!', text: 'Headings updated successfully', timer: 2000, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update headings' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageInputChange = (e) => {
        const { name, value } = e.target;
        setImageForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageForm(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetImageForm = () => {
        const targetImages = selectedSection === "featured" ? featuredImages : fullGalleryImages;
        const nextOrder = targetImages.length > 0 
            ? Math.max(...targetImages.map(img => img.order || 0)) + 1 
            : 1;

        setImageForm({
            id: null,
            type: selectedSection || "featured",
            image: null,
            text: "",
            order: nextOrder
        });
        setImagePreview(null);
        setIsEditingImage(false);
    };

    const saveImage = async (e) => {
        e.preventDefault();
        
        if (!isEditingImage && !imageForm.image) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select an image' });
            return;
        }

        try {
            setIsLoading(true);
            let imageBase64 = null;
            
            if (imageForm.image instanceof File) {
                imageBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(imageForm.image);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            }

            const payload = {
                type: imageForm.type,
                text: imageForm.text,
                order: imageForm.order === "" ? null : Number(imageForm.order)
            };

            if (imageBase64) {
                payload.image = imageBase64;
            }

            let res;
            if (isEditingImage) {
                res = await api.put(`/api/app-gallery/images/${imageForm.id}`, payload);
            } else {
                res = await api.post('/api/app-gallery/images', payload);
            }

            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Success', text: 'Image saved successfully', timer: 2000, showConfirmButton: false });
                resetImageForm();
                fetchGalleryData();
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to save image' });
        } finally {
            setIsLoading(false);
        }
    };

    const editImage = (img) => {
        setIsEditingImage(true);
        setImageForm({
            id: img._id,
            type: img.type,
            image: null,
            text: img.text || "",
            order: img.order !== undefined ? img.order : ""
        });
        setImagePreview(img.image?.url || null);
        window.scrollTo({ top: document.getElementById('image-form').offsetTop - 100, behavior: 'smooth' });
    };

    const deleteImage = async (id) => {
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
            try {
                setIsLoading(true);
                const res = await api.delete(`/api/app-gallery/images/${id}`);
                if (res.data.success) {
                    Swal.fire('Deleted!', 'Image has been deleted.', 'success');
                    fetchGalleryData();
                }
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete image.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };



    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen rounded-lg">
            <PageHeader
                title="APP GALLERY MANAGEMENT"
                description="Manage Featured Experiences and Full Gallery images for the mobile app"
            />

            {/* Select Section Dropdown */}
            <div className="mb-8 bg-gray-50 p-4 border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Select Section to Manage</label>
                <select
                    value={selectedSection}
                    onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setIsEditingImage(false);
                    }}
                    className="w-full lg:w-1/3 px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none font-bold text-[#C8102E]"
                >
                    <option value="">-- Choose Section --</option>
                    <option value="featured">Featured Experiences</option>
                    <option value="full">Full Gallery</option>
                </select>
            </div>

            {selectedSection && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Section: Headings and Form */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Headings Section */}
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                                <Layout className="w-5 h-5" /> Section Settings
                            </h2>
                            <div className="space-y-4">
                                {selectedSection === 'featured' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Featured Experiences Title</label>
                                        <input
                                            type="text"
                                            name="featuredTitle"
                                            value={headings.featuredTitle}
                                            onChange={handleHeadingChange}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                        />
                                    </div>
                                )}
                                
                                {selectedSection === 'full' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Full Gallery Title</label>
                                            <input
                                                type="text"
                                                name="fullGalleryTitle"
                                                value={headings.fullGalleryTitle}
                                                onChange={handleHeadingChange}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Full Gallery Subtitle</label>
                                            <input
                                                type="text"
                                                name="fullGallerySubtitle"
                                                value={headings.fullGallerySubtitle}
                                                onChange={handleHeadingChange}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={saveHeadings}
                                    disabled={isLoading}
                                    className="w-full py-2 bg-[#C8102E] text-white font-bold hover:bg-[#a00d24] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Section Settings
                                </button>
                            </div>
                        </div>

                        {/* Add Image Form */}
                        <div id="image-form" className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                                {isEditingImage ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {isEditingImage ? 'Edit Image' : 'Add New Image'}
                            </h2>
                            <form onSubmit={saveImage} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Optional Text</label>
                                    <input
                                        type="text"
                                        name="text"
                                        value={imageForm.text}
                                        onChange={handleImageInputChange}
                                        placeholder="e.g. WEDDINGS"
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Order Number</label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={imageForm.order}
                                        onChange={handleImageInputChange}
                                        placeholder="Auto-assigned if empty"
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Upload Image {!isEditingImage && '*'}</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-sm font-semibold"
                                    />
                                    {imagePreview && (
                                        <div className="mt-2 w-full h-32 border border-gray-200 rounded overflow-hidden">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-2 bg-[#DE802B] text-white font-bold hover:bg-[#c66d21] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> {isEditingImage ? 'Update Image' : 'Add Image'}
                                    </button>
                                    {isEditingImage && (
                                        <button
                                            type="button"
                                            onClick={resetImageForm}
                                            className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Section: Tables */}
                    <div className="lg:col-span-2">
                        {selectedSection === "featured" && (
                            <ImageTable title="Featured Experiences Images" images={featuredImages} onEdit={editImage} onDelete={deleteImage} />
                        )}
                        {selectedSection === "full" && (
                            <ImageTable title="Full Gallery Images" images={fullGalleryImages} onEdit={editImage} onDelete={deleteImage} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppGallery;

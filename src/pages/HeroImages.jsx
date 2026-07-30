import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Trash2, Edit, ImageIcon, Layout, Type, Heading, AlignLeft, CheckCircle, XCircle, Save, ChevronLeft, Image as LucideImage } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { API_URL } from "../lib/api";
import Table from '../components/table/Table';
import Pagination from "../components/Pagination";
import PageHeader from '../components/PageHeader';
import { validateImageSize } from '../lib/validateImageSize';

const HeroImages = () => {
    const navigate = useNavigate();
    const { id: urlId } = useParams();

    // States
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [imagePreview, setImagePreview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        pageName: "",
        backgroundImage: null,
        imageAltText: "",
        title: "",
        highlightedText: "",
        shortDescription: "",
        status: "Active"
    });

    const pageOptions = [
        "About", "Destinations", "Services", "Membership", "List Your Property", "Contact Us"
    ];

    useEffect(() => {
        fetchHeroImages();
        if (urlId) {
            handleEditById(urlId);
        }
    }, [urlId]);

    const fetchHeroImages = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/hero-images');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditById = async (id) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/hero-images/${id}`);
            if (response.data.success) {
                const item = response.data.data;
                populateForm(item);
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch details' });
        } finally {
            setIsLoading(false);
        }
    };

    const populateForm = (item) => {
        setEditMode(true);
        setEditId(item._id);
        setFormData({
            pageName: item.pageName,
            backgroundImage: null,
            imageAltText: item.imageAltText || "",
            title: item.title || "",
            highlightedText: item.highlightedText || "",
            shortDescription: item.shortDescription || "",
            status: item.status || "Active"
        });
        setImagePreview(item.backgroundImage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setFormData({
            pageName: "",
            backgroundImage: null,
            imageAltText: "",
            title: "",
            highlightedText: "",
            shortDescription: "",
            status: "Active"
        });
        setImagePreview(null);
        setEditMode(false);
        setEditId(null);
        if (urlId) navigate('/hero-images');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // If validateImageSize is not available or errors, we just use it, template relies on it
            try {
                if (validateImageSize && !validateImageSize(file, 10240)) {
                    e.target.value = "";
                    return;
                }
            } catch (err) { }

            setFormData(prev => ({ ...prev, backgroundImage: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pageName) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select a page' });
            return;
        }

        if (!editMode && !formData.backgroundImage) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please upload an image' });
            return;
        }

        try {
            setIsLoading(true);
            let backgroundImageBase64 = formData.backgroundImage;
            if (formData.backgroundImage instanceof File) {
                backgroundImageBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(formData.backgroundImage);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            }

            const payload = {
                pageName: formData.pageName,
                imageAltText: formData.imageAltText,
                title: formData.title,
                highlightedText: formData.highlightedText,
                shortDescription: formData.shortDescription,
                status: formData.status,
                backgroundImage: backgroundImageBase64
            };

            let response;
            const currentId = editId || urlId;
            if (editMode && currentId) {
                response = await api.put(`/api/hero-images/update/${currentId}`, payload);
            } else {
                response = await api.post('/api/hero-images/create', payload);
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Success!', text: editMode ? 'Updated successfully' : 'Created successfully', timer: 2000, showConfirmButton: false });
                handleReset();
                fetchHeroImages();
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete background for "${item.pageName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await api.delete(`/api/hero-images/delete/${item._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Record has been removed.', 'success');
                    fetchHeroImages();
                }
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete record.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredData = data.filter(item =>
        item.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "index",
            label: "S.NO",
            width: "80px",
            render: (_, index) => <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
        },
        {
            key: "backgroundImage",
            label: "IMAGE",
            render: (row) => (
                <div className="w-20 h-10 border-2 border-gray-200 overflow-hidden bg-gray-50">
                    <img
                        src={row.backgroundImage}
                        alt={row.pageName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        {
            key: "pageName",
            label: "PAGE NAME",
            render: (row) => <div className="font-bold text-[#C8102E] uppercase text-xs tracking-wider">{row.pageName}</div>
        },
        {
            key: "title",
            label: "TITLE",
            render: (row) => <div className="text-gray-900 font-medium text-sm truncate max-w-[200px]">{row.title || '---'}</div>
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {row.status === "Active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {row.status}
                </div>
            )
        },
        {
            key: "updatedAt",
            label: "LAST UPDATED",
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <div className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        {row.updatedBy || 'Admin'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold tracking-tight">
                        {new Date(row.updatedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen rounded-lg">
            <div className="w-full">
                <PageHeader
                    title="HERO IMAGES MANAGEMENT"
                    description="Add and manage hero background images for all pages"
                />

                {/* Form Section */}
                <div className="bg-white border-2 border-gray-200 p-6 mb-10 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 text-[#C8102E] rounded-md">
                            <LucideImage className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {editMode ? 'Edit Hero Image' : 'Add New Hero Image'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Row 1 */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Select Page *</label>
                                <select
                                    name="pageName"
                                    value={formData.pageName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-[#C8102E] focus:border-[#C8102E] text-sm shadow-sm"
                                >
                                    <option value="">-- Choose --</option>
                                    {pageOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                                    <Type size={14} className="text-[#C8102E]" /> HERO TITLE (H1)
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter title (H1)"
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-[#C8102E] focus:border-[#C8102E] text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                                    <Heading size={14} className="text-[#C8102E]" /> Highlighted Text
                                </label>
                                <input
                                    type="text"
                                    name="highlightedText"
                                    value={formData.highlightedText}
                                    onChange={handleInputChange}
                                    placeholder="Highlight text"
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-[#C8102E] focus:border-[#C8102E] text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-[#C8102E] focus:border-[#C8102E] text-sm shadow-sm"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-1 md:col-span-full" style={{ gridColumn: "1 / -1" }}>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlignLeft size={14} className="text-[#C8102E]" /> Short Description
                                </label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Enter brief description..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-[#C8102E] focus:border-[#C8102E] text-sm shadow-lg resize-none"
                                ></textarea>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Background Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 text-sm shadow-sm"
                                />
                                {imagePreview && (
                                    <div className="mt-3 relative w-40 aspect-video border-2 border-gray-200">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="mt-4 bg-red-50/50 p-4 rounded-lg border border-red-100">
                                    <p className="text-[#C8102E] text-[10px] font-bold uppercase mb-1.5">Image Requirements</p>
                                    <ul className="text-[10px] text-gray-600 space-y-1 uppercase tracking-wider">
                                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Resolution: 1330 x 500</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Format: JPG, PNG, WEBP ONLY</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> MAX SIZE: 10MB</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Image Alt Text (SEO)</label>
                                <input
                                    type="text"
                                    name="imageAltText"
                                    value={formData.imageAltText}
                                    onChange={handleInputChange}
                                    placeholder="SEO descriptive text"
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-[#C8102E] focus:border-[#C8102E] text-sm shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 bg-gray-500 text-white font-bold transition-all shadow-md hover:bg-gray-600 uppercase tracking-wider text-xs rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-[#C8102E] text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 rounded"
                            >
                                {isLoading ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> PROCESSING...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> {editMode ? 'Update Background' : 'Save Background'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    {/* Replaced blue header with red #C8102E */}
                    <div className="px-6 py-4 border-b bg-[#C8102E]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Background Images List</h2>
                                <p className="text-sm text-red-100">Showing {filteredData.length} total images</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by page or title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors text-black rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white">
                        {isLoading && data.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredData.length > 0 ? (
                            <>
                                <Table
                                    columns={columns}
                                    data={paginatedData}
                                    onEdit={populateForm}
                                    onDelete={handleDelete}
                                />
                                <div className="mt-4 px-4 pb-4 bg-white">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalItems={filteredData.length}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setCurrentPage}
                                        label="images"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Background Images Found</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroImages;

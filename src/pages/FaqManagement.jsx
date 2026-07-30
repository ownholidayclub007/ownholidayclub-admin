import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL } from "../lib/api";
import {
    HelpCircle,
    Plus,
    Type,
    Save,
    Trash2,
    Image as ImageIcon,
    Edit,
    Check,
    MessageCircle,
    FileText,
    ArrowRight,
    Eye,
    Layout
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const FaqManagement = () => {
    const [selectedPage, setSelectedPage] = useState('membership');
    const [data, setData] = useState({
        subheading: '',
        heading: '',
        highlightedWord: '',
        mainImage: '',
        faqs: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isEditingFaq, setIsEditingFaq] = useState(null);
    const [faqForm, setFaqForm] = useState({
        question: '',
        answer: '',
        image: '',
        altText: ''
    });

    useEffect(() => {
        if (selectedPage) {
            fetchData();
        }
    }, [selectedPage]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/faq/${selectedPage}`);
            if (response.data.success) {
                const fetchedData = response.data.data;
                // If it's membership and it's empty, set defaults
                if (selectedPage === 'membership' && !fetchedData.heading) {
                    setData({
                        subheading: 'Clarity & Transparency',
                        heading: 'Membership FAQ',
                        highlightedWord: 'FAQ',
                        mainImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80',
                        faqs: fetchedData.faqs || []
                    });
                } else if (selectedPage === 'home' && !fetchedData.heading) {
                    setData({
                        subheading: 'Support Center',
                        heading: 'Everything You Need to',
                        highlightedWord: 'Know',
                        mainImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                        faqs: fetchedData.faqs || []
                    });
                } else {
                    setData(fetchedData);
                }
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/faq/headings', {
                page: selectedPage,
                subheading: data.subheading,
                heading: data.heading,
                highlightedWord: data.highlightedWord,
                mainImage: data.mainImage
            });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Section settings updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e, type = 'item') => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Data = reader.result;
            
            try {
                setIsLoading(true);
                const response = await api.post('/api/faq/images', {
                    file: {
                        dataUrl: base64Data,
                        name: file.name,
                        type: file.type
                    }
                });
                
                if (response.data.success) {
                    if (type === 'main') {
                        setData({ ...data, mainImage: response.data.data.url });
                    } else {
                        setFaqForm({ ...faqForm, image: response.data.data.url });
                    }
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to upload image', 'error');
            } finally {
                setIsLoading(false);
            }
        };
    };

    const handleAddOrUpdateFaq = async () => {
        if (!faqForm.question || !faqForm.answer) {
            Swal.fire('Error', 'Question and Answer are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/api/faq/items', {
                page: selectedPage,
                faqItem: faqForm,
                faqId: isEditingFaq
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditingFaq ? 'FAQ updated' : 'FAQ added',
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

    const handleDeleteFaq = async (id) => {
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
                const response = await api.delete(`/api/faq/items/${selectedPage}/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'FAQ has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete FAQ', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (faq) => {
        setIsEditingFaq(faq._id);
        setFaqForm({
            question: faq.question,
            answer: faq.answer,
            image: faq.image || '',
            altText: faq.altText || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingFaq(null);
        setFaqForm({
            question: '',
            answer: '',
            image: '',
            altText: ''
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="FAQ MANAGEMENT"
                description="Manage page-specific FAQ headings and individual question cards"
            />

            {/* Page Selection */}
            <div className="mb-8 bg-gray-50 p-4 border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Select Page</label>
                <select 
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="w-full lg:w-1/3 px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none font-bold text-[#C8102E]"
                >
                    <option value="membership">Membership Page</option>
                    <option value="home">Home Page</option>
                    {/* Add more pages here as needed */}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Headings and Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Settings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#C8102E]">
                            <Layout className="w-5 h-5" /> Section Settings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Highlight Word</label>
                                <input
                                    type="text"
                                    value={data.highlightedWord}
                                    onChange={(e) => setData({ ...data, highlightedWord: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none"
                                />
                            </div>

                            {/* Main Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Main Image (Initial View)</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                        {data.mainImage ? (
                                            <img src={data.mainImage.startsWith('http') ? data.mainImage : `${API_URL}${data.mainImage}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-400 w-8 h-8" />
                                        )}
                                        <input
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, 'main')}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={data.mainImage}
                                            onChange={(e) => setData({ ...data, mainImage: e.target.value })}
                                            className="w-full px-2 py-1 border-b border-gray-300 outline-none text-[10px]"
                                            placeholder="Image URL..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-2 bg-[#C8102E] text-white font-bold hover:bg-[#a00d24] transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Section Settings
                            </button>
                        </div>
                    </div>

                    {/* FAQ Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#DE802B]">
                            {isEditingFaq ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingFaq ? 'Edit FAQ Item' : 'Add New FAQ'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Question</label>
                                <input
                                    type="text"
                                    value={faqForm.question}
                                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold"
                                    placeholder="Enter question text..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Answer</label>
                                <textarea
                                    value={faqForm.answer}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm"
                                    rows="4"
                                    placeholder="Enter clear and concise answer..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Image (Shown on Open)</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                        {faqForm.image ? (
                                            <img src={faqForm.image.startsWith('http') ? faqForm.image : `${API_URL}${faqForm.image}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-400 w-8 h-8" />
                                        )}
                                        <input
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, 'item')}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={faqForm.image}
                                            onChange={(e) => setFaqForm({ ...faqForm, image: e.target.value })}
                                            className="w-full px-2 py-1 border-b border-gray-300 outline-none text-[10px]"
                                            placeholder="Image URL..."
                                        />
                                        <input
                                            type="text"
                                            value={faqForm.altText}
                                            onChange={(e) => setFaqForm({ ...faqForm, altText: e.target.value })}
                                            className="w-full px-2 py-1 border-b border-gray-300 outline-none text-[10px]"
                                            placeholder="Alt Text (SEO)..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddOrUpdateFaq}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-[#DE802B] text-white font-bold hover:bg-[#c66d21] transition-colors"
                                >
                                    {isEditingFaq ? 'Update FAQ' : 'Add FAQ'}
                                </button>
                                {isEditingFaq && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: FAQ Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#C8102E]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-[#DE802B]" /> {selectedPage.toUpperCase()} FAQ Items
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                        <th className="px-6 py-3 border-b">No.</th>
                                        <th className="px-6 py-3 border-b">Preview</th>
                                        <th className="px-6 py-3 border-b">Question</th>
                                        <th className="px-6 py-3 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {!data.faqs || data.faqs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                No FAQs found for this page. Add your first item using the form.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.faqs.map((faq, idx) => (
                                            <tr key={faq._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-[#C8102E]">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-10 bg-gray-100 border border-gray-200 overflow-hidden rounded">
                                                        {faq.image ? (
                                                            <img
                                                                src={faq.image.startsWith('http') ? faq.image : `${API_URL}${faq.image}`}
                                                                alt={faq.altText}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                                <ImageIcon size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 max-w-sm">
                                                    <div className="truncate">{faq.question}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(faq)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFaq(faq._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
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

export default FaqManagement;

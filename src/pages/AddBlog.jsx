import { useState, useEffect, useRef } from "react";
import { List, FileText, Globe, Code, Link as LinkIcon, Image as ImageIcon, Save, Trash2, Edit, Plus, Upload, Eye as EyeIcon, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api, { API_URL } from "../lib/api";
import PageHeader from "../components/PageHeader";
import RichTextEditor from "../components/RichTextEditor";


const AddBlog = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [blogData, setBlogData] = useState({
    title: "",
    h1Title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    author: "admin",
    tags: [],
    status: "draft",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    imageAlt: "",
    ogTitle: "",
    ogDescription: "",
    canonicalTag: "",
    schemaMarkup: "",
    openGraphTags: "",
    metaKeywords: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ================= INPUT HANDLER =================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBlogData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from title
    if (name === "title" && !editId) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setBlogData((prev) => ({ ...prev, slug }));
    }
  };

  // ================= IMAGE HANDLER =================
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOgImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!blogData.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a blog title",
        confirmButtonColor: "#C8102E",
      });
      return;
    }

    if (!blogData.excerpt.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a blog excerpt",
        confirmButtonColor: "#C8102E",
      });
      return;
    }

    if (!blogData.content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter blog content",
        confirmButtonColor: "#C8102E",
      });
      return;
    }

    if (!blogData.category.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please select a category",
        confirmButtonColor: "#C8102E",
      });
      return;
    }

    if (!imagePreview && !editId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please upload a blog image",
        confirmButtonColor: "#C8102E",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Handle Image Uploads to Cloudinary first if they are files
      let finalImageUrl = blogData.image;
      let finalOgImageUrl = blogData.ogImage;

      if (imageFile) {
        const reader = new FileReader();
        const uploadPromise = new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const res = await api.post('/api/blogs/images', {
                file: {
                  name: imageFile.name,
                  type: imageFile.type,
                  size: imageFile.size,
                  dataUrl: reader.result
                },
                type: 'main'
              });
              resolve(res.data.data.url);
            } catch (err) { reject(err); }
          };
          reader.readAsDataURL(imageFile);
        });
        finalImageUrl = await uploadPromise;
      }

      if (ogImageFile) {
        const reader = new FileReader();
        const uploadPromise = new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const res = await api.post('/api/blogs/images', {
                file: {
                  name: ogImageFile.name,
                  type: ogImageFile.type,
                  size: ogImageFile.size,
                  dataUrl: reader.result
                },
                type: 'og'
              });
              resolve(res.data.data.url);
            } catch (err) { reject(err); }
          };
          reader.readAsDataURL(ogImageFile);
        });
        finalOgImageUrl = await uploadPromise;
      }

      const submissionData = {
        ...blogData,
        image: finalImageUrl,
        ogImage: finalOgImageUrl
      };

      const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
      submissionData.updatedBy = adminInfo.username || "Admin User";

      let response;
      if (editId) {
        response = await api.put(`/api/blogs/${editId}`, submissionData);
      } else {
        response = await api.post("/api/blogs", submissionData);
      }

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: editId ? "Blog updated successfully" : "Blog created successfully",
          confirmButtonColor: "#C8102E",
          timer: 2000,
        });

        navigate("/blogs-list");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to save blog",
        confirmButtonColor: "#C8102E",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= EDIT MODE =================
  useEffect(() => {
    const editBlog = JSON.parse(localStorage.getItem("editBlog"));

    if (editBlog) {
      setBlogData({
        title: editBlog.title || "",
        h1Title: editBlog.h1Title || "",
        slug: editBlog.slug || "",
        excerpt: editBlog.excerpt || "",
        content: editBlog.content || "",
        category: editBlog.category || "",
        author: editBlog.author || "admin",
        tags: editBlog.tags || [],
        status: editBlog.status || "draft",
        featured: editBlog.featured || false,
        metaTitle: editBlog.metaTitle || "",
        metaDescription: editBlog.metaDescription || "",
        imageAlt: editBlog.imageAlt || "",
        ogTitle: editBlog.ogTitle || "",
        ogDescription: editBlog.ogDescription || "",
        canonicalTag: editBlog.canonicalTag || "",
        schemaMarkup: editBlog.schemaMarkup || "",
        openGraphTags: editBlog.openGraphTags || "",
        metaKeywords: editBlog.metaKeywords || "",
        image: editBlog.image || "",
        ogImage: editBlog.ogImage || "",
      });

      setEditId(editBlog._id);
      setImagePreview(editBlog.image || null);
      setOgImagePreview(editBlog.ogImage || null);

      localStorage.removeItem("editBlog");
    }
  }, []);

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <PageHeader
            title={editId ? "UPDATE BLOG POST" : "CREATE NEW BLOG"}
            description="Manage your blog story and SEO details"
            buttonText="Back to List"
            buttonIcon={List}
            buttonPath="/blogs-list"
          />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
          {/* LEFT COLUMN: CONFIG & SEO (1/4) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status & Featured Card */}
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 rounded-none border border-red-100">
                  <Save className="w-5 h-5 text-[#C8102E]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Publication Status</label>
                  <select
                    name="status"
                    value={blogData.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border-2 focus:outline-none transition-all rounded-none font-bold text-xs uppercase tracking-widest ${blogData.status === "published"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700 focus:border-emerald-500"
                      : "bg-red-50 border-red-100 text-red-700 focus:border-red-500"
                      }`}
                  >
                    <option value="published">● Published (Live)</option>
                    <option value="draft">○ Draft (Hidden)</option>
                    <option value="archived">○ Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-none border border-gray-100">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={blogData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-gray-700 uppercase tracking-tight cursor-pointer">
                    Mark as Featured
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Metadata Card */}
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-none border border-blue-100">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">SEO Metadata</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Meta Title</label>
                    <span className="text-[10px] font-bold text-gray-400">{blogData.metaTitle.length}/65</span>
                  </div>
                  <input
                    type="text"
                    name="metaTitle"
                    value={blogData.metaTitle}
                    onChange={handleInputChange}
                    maxLength="65"
                    placeholder="Enter meta title"
                    className="w-full px-4 py-2.5 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none bg-white text-sm font-semibold transition-all"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Meta Description</label>
                    <span className={`text-[10px] font-bold ${blogData.metaDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>
                      {blogData.metaDescription.length}/155
                    </span>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={blogData.metaDescription}
                    onChange={handleInputChange}
                    maxLength="155"
                    className="w-full px-4 py-2.5 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none bg-white text-sm font-semibold transition-all resize-none h-24"
                    placeholder="Brief summary for search results..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Canonical Tag</label>
                  <input
                    type="text"
                    name="canonicalTag"
                    value={blogData.canonicalTag}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com/blog-post"
                    className="w-full px-4 py-2.5 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none bg-white text-sm font-semibold transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Social Sharing (OG) Card */}
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none text-left transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-none border border-emerald-100">
                  <Upload className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Social Sharing</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">OG Title</label>
                  <input
                    type="text"
                    name="ogTitle"
                    value={blogData.ogTitle}
                    onChange={handleInputChange}
                    placeholder="Enter OG title"
                    className="w-full px-4 py-2.5 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none bg-white text-sm font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">OG Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-none p-4 text-center hover:bg-gray-50 transition-colors relative">
                    <input
                      type="file"
                      onChange={handleOgImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                    />
                    {ogImagePreview ? (
                      <div className="relative">
                        <img src={ogImagePreview} alt="OG Preview" className="h-24 w-full object-cover rounded-none" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <EyeIcon className="text-white w-6 h-6" />
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Upload OG Image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Additional OG Tags</label>
                  <RichTextEditor
                    value={blogData.openGraphTags}
                    onChange={(val) => setBlogData(prev => ({ ...prev, openGraphTags: val }))}
                    placeholder="Paste OG meta tags here..."
                    minHeight="100px"
                    isCodeEditor={true}
                  />
                </div>
              </div>
            </div>

            {/* Schema Markup Card */}
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-none border border-amber-100">
                  <Code className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Schema Markup</h2>
              </div>
              <RichTextEditor
                value={blogData.schemaMarkup}
                onChange={(val) => setBlogData(prev => ({ ...prev, schemaMarkup: val }))}
                placeholder='{"@context": "https://schema.org", ...}'
                minHeight="120px"
                isCodeEditor={true}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: MAIN CONTENT (3/4) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border-2 border-gray-200 shadow-sm rounded-none overflow-hidden text-left">
              <div className="px-8 py-5 border-b-2 border-gray-100 bg-gray-50/50 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#C8102E]/5 rounded-none border border-[#C8102E]/10">
                    <FileText className="w-5 h-5 text-[#C8102E]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Blog Primary Content</h2>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C8102E] animate-pulse uppercase tracking-widest">
                    <div className="w-3 h-3 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                )}
              </div>

              <div className="p-8 space-y-8">
                {/* Horizontal Title & Slug */}
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Blog Main Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={blogData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog title..."
                      className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none font-bold text-gray-800 transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hero Title (H1 for SEO)</label>
                    <input
                      type="text"
                      name="h1Title"
                      value={blogData.h1Title}
                      onChange={handleInputChange}
                      placeholder="Enter hero title (H1 for SEO)..."
                      className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none font-bold text-gray-800 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 text-left md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Permalink / URL Slug *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe size={14} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="slug"
                        value={blogData.slug}
                        onChange={handleInputChange}
                        placeholder="auto-generated-slug"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none bg-gray-50 text-sm font-mono text-blue-600 font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Horizontal Summary */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Short Summary *</label>
                  <textarea
                    name="excerpt"
                    value={blogData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Provide a brief summary for list views..."
                    rows="2"
                    maxLength="500"
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none text-sm font-semibold resize-none transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Author & Category */}
                <div className="grid md:grid-cols-2 gap-8 items-start text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Author Name</label>
                    <input
                      type="text"
                      name="author"
                      value={blogData.author}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none text-sm font-bold bg-white"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Blog Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={blogData.category}
                      onChange={handleInputChange}
                      placeholder="e.g. Retail Design"
                      className="w-full px-4 py-2.5 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none text-sm font-bold bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Meta Keywords Section */}
                <div className="space-y-3 text-left">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Meta Keywords (SEO)</label>
                  <textarea
                    name="metaKeywords"
                    value={blogData.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="Enter keywords separated by commas..."
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none text-sm font-semibold resize-none transition-all shadow-sm"
                  />
                </div>

                {/* Blog Image & Alt Text Horizontal */}
                <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50/50 rounded-none border-2 border-gray-100">
                  <div className="w-full md:w-1/3">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Feature Image *</label>
                    <div className="aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 bg-white rounded-none relative group overflow-hidden shadow-sm">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Blog main preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center p-4">
                          <Upload className="w-10 h-10 text-gray-300 mb-2" />
                          <span className="text-[10px] text-[#C8102E] font-black uppercase tracking-widest">Upload Main Image</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-4 text-left">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Image Alt Text (SEO)</label>
                        <input
                        type="text"
                        name="imageAlt"
                        value={blogData.imageAlt}
                        onChange={handleInputChange}
                        placeholder="Describe the image..."
                        className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#C8102E] outline-none rounded-none text-sm font-bold bg-white transition-all shadow-sm"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold italic text-left flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 shrink-0"></span>
                      Helps visually impaired users and improves search ranking across all search engines.
                    </p>
                  </div>
                </div>

                {/* Detailed Description Editor */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between text-left">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Detailed Blog Description *</label>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-none uppercase border border-emerald-100 tracking-tighter">Luxury Editor Active</span>
                  </div>

                  <div className="rounded-none overflow-hidden text-left border-2 border-gray-100">
                    <RichTextEditor
                      value={blogData.content}
                      onChange={(val) => setBlogData(prev => ({ ...prev, content: val }))}
                      placeholder="Start writing your masterpiece here..."
                      minHeight="500px"
                    />
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-10 flex justify-end text-left border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group px-16 py-4 bg-[#C8102E] text-white font-black rounded-none shadow-xl hover:bg-[#a00d25] transition-all uppercase tracking-[0.2em] text-[11px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    )}
                    <span>{editId ? "Update Blog Post" : "Publish Blog Story"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AddBlog;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/table/Table";
import { Plus, Eye, X, Edit, Trash2, Layout, FileText, User, Tag, Globe } from "lucide-react";
import SearchBar from "../components/SearchBar.jsx";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import api, { API_URL } from "../lib/api";
import PageHeader from "../components/PageHeader";


const BlogsList = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // LOAD BLOGS FROM API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/blogs/admin/all");

      if (response.data.success) {
        setBlogs(response.data.data);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch blogs",
        confirmButtonColor: "#C8102E",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Do you want to delete <strong>${row.title}</strong>?<br><span class="text-red-600 font-bold">This action cannot be undone!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C8102E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-none",
        confirmButton: "px-6 py-3 font-bold uppercase tracking-widest text-xs",
        cancelButton: "px-6 py-3 font-bold uppercase tracking-widest text-xs",
      },
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/api/blogs/${row._id}`);

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Blog post has been removed.",
            confirmButtonColor: "#C8102E",
            timer: 2000,
          });
          fetchBlogs();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete blog",
          confirmButtonColor: "#C8102E",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // EDIT
  const handleEdit = (row) => {
    localStorage.setItem("editBlog", JSON.stringify(row));
    navigate("/add-blogs");
  };

  // VIEW
  const handleView = (row) => {
    setSelectedBlog(row);
    setViewModalOpen(true);
  };

  // FILTER
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchValue.toLowerCase()) ||
      (blog.excerpt || "").toLowerCase().includes(searchValue.toLowerCase()) ||
      (blog.category || "").toLowerCase().includes(searchValue.toLowerCase())
  );

  // PAGINATION LOGIC
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + rowsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, rowsPerPage]);

  // TABLE COLUMNS
  const columns = [
    {
      key: "image",
      label: "PREVIEW",
      width: "100px",
      render: (row) =>
        row.image ? (
          <div className="w-16 h-10 border-2 border-gray-100 overflow-hidden bg-gray-50 shadow-sm group">
            <img
              src={row.image}
              alt="blog"
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="w-16 h-10 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
            <Layout size={14} />
          </div>
        ),
    },
    {
      key: "title",
      label: "BLOG INFORMATION",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 uppercase tracking-tight line-clamp-1">{row.title}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-blue-600 font-mono font-bold truncate max-w-[200px]">/{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (row) => (
        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-none text-[10px] font-black uppercase tracking-widest">
          {row.category}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      width: "120px",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border ${
            row.status === "published"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "LAST UPDATED",
      render: (row) => (
          <div className="flex flex-col text-gray-600 leading-tight">
              <span className="font-bold text-[#C8102E] text-[10px] uppercase underline mb-0.5">
                {row.updatedBy || "Admin User"}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">
                {new Date(row.updatedAt || row.createdAt).toLocaleDateString()}
              </span>
          </div>
      )
    },
    {
        key: "actions",
        label: "ACTIONS",
        width: "140px",
        render: (row) => (
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => handleView(row)}
                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-all shadow-sm"
                    title="View Preview"
                >
                    <Eye size={14} />
                </button>
                <button
                    onClick={() => handleEdit(row)}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all shadow-sm"
                    title="Edit Post"
                >
                    <Edit size={14} />
                </button>
                <button
                    onClick={() => handleDelete(row)}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all shadow-sm"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        )
    }
  ];

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      {/* HEADER */}
      <PageHeader
        title="BLOG POSTS MANAGEMENT"
        description="Write stories, manage categories, and optimize SEO for your blog section"
        buttonText="Add New Post"
        buttonIcon={Plus}
        buttonPath="/add-blogs"
      />

      {/* SEARCH BAR */}
      <div className="mt-8">
        <SearchBar
            rowsPerPage={rowsPerPage}
            totalItems={filteredBlogs.length}
            onRowsPerPageChange={setRowsPerPage}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search by title, slug, or category..."
        />
      </div>

      {/* TABLE */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing with server...</span>
        </div>
      ) : (
        <div className="mt-6 border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#C8102E] flex justify-between items-center">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                    <FileText className="w-4 h-4 text-white" /> Blogs List
                </h2>
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                    Total: {blogs.length}
                </span>
            </div>
          <div className="mt-6">
            <Table
                columns={columns}
                data={paginatedBlogs}
                wrapperClassName="border-none shadow-none"
                theadClassName="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest border-b border-slate-800"
            />
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBlogs.length}
          itemsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          label="blogs"
        />
      </div>

      {/* VIEW MODAL (Luxury Style) */}
      {viewModalOpen && selectedBlog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-none max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-4 border-gray-100 relative">
            {/* MODAL HEADER */}
            <div className="bg-[#C8102E] text-white px-8 py-5 flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-xl font-black uppercase tracking-tight">Live Blog Preview</h2>
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Syncing Draft Content</span>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-white hover:rotate-90 transition-all duration-300"
              >
                <X size={28} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-10 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left: Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                      {/* IMAGE */}
                      {selectedBlog.image && (
                        <div className="relative group overflow-hidden border-4 border-gray-50 shadow-xl">
                          <img
                            src={selectedBlog.image}
                            alt={selectedBlog.title}
                            className="w-full h-80 object-cover"
                          />
                          <div className="absolute top-4 left-4">
                              <span className="px-4 py-2 bg-white/90 backdrop-blur text-[#C8102E] text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {selectedBlog.category}
                              </span>
                          </div>
                        </div>
                      )}

                      {/* TITLE */}
                      <h1 className="text-4xl font-black text-gray-900 leading-[0.9] tracking-tighter uppercase">
                        {selectedBlog.title}
                      </h1>

                      {/* META INFO BAR */}
                      <div className="flex flex-wrap items-center gap-6 py-4 border-y-2 border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                           <User size={12} className="text-[#C8102E]" /> {selectedBlog.author}
                        </div>
                        <div className="flex items-center gap-2">
                           <Layout size={12} className="text-[#C8102E]" /> {new Date(selectedBlog.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                           <Tag size={12} className="text-[#C8102E]" /> {selectedBlog.status}
                        </div>
                      </div>

                      {/* SUMMARY */}
                      <div className="p-6 bg-gray-50 border-l-4 border-[#C8102E]">
                        <p className="text-sm text-gray-600 font-bold italic leading-relaxed">
                          {selectedBlog.excerpt}
                        </p>
                      </div>

                      {/* MAIN CONTENT CONTENT */}
                      <div 
                        className="prose prose-slate max-w-none text-gray-700 leading-relaxed font-medium blog-content-preview"
                        dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                      />
                  </div>

                  {/* Right: SEO & Settings Sidebar */}
                  <div className="space-y-6">
                      <div className="bg-gray-50 p-6 border border-gray-100">
                          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                            <Globe size={14} className="text-[#C8102E]" /> SEO Parameters
                          </h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Meta Title</label>
                                  <p className="text-[11px] font-semibold text-gray-700">{selectedBlog.metaTitle || 'N/A'}</p>
                              </div>
                              <div>
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Meta Description</label>
                                  <p className="text-[11px] font-semibold text-gray-700 line-clamp-4">{selectedBlog.metaDescription || 'N/A'}</p>
                              </div>
                              <div>
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Slug / Permalink</label>
                                  <code className="text-[9px] font-bold text-blue-600 truncate block">/{selectedBlog.slug}</code>
                              </div>
                          </div>
                      </div>

                      <div className="bg-gray-50 p-6 border border-gray-100">
                          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                            <Plus size={14} className="text-[#C8102E]" /> Social Meta (OG)
                          </h3>
                          <div className="space-y-4">
                              {selectedBlog.ogImage && (
                                  <img src={selectedBlog.ogImage} className="w-full h-24 object-cover border border-gray-200" alt="OG" />
                              )}
                              <div>
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">OG Title</label>
                                  <p className="text-[11px] font-semibold text-gray-700">{selectedBlog.ogTitle || selectedBlog.title}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="bg-gray-50 px-8 py-5 border-t-2 border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 font-black uppercase tracking-widest text-[10px] hover:bg-gray-300 transition-all"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEdit(selectedBlog);
                }}
                className="px-8 py-3 bg-[#C8102E] text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#a00d25] transition-all shadow-lg"
              >
                Edit Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsList;

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import api from "../lib/api";

const itemsPerPage = 10;

const ReferralCodes = () => {
  const [codes, setCodes] = useState([]);
  const [count, setCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCodes = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/referral-codes", {
        params: { page, limit: itemsPerPage },
      });

      if (response.data.success) {
        setCodes(response.data.data || []);
        setCurrentPage(Number(response.data.currentPage || page));
        setTotalItems(Number(response.data.totalItems || 0));
      }
    } catch (error) {
      console.error("Failed to load referral codes:", error);
      Swal.fire("Error", "Unable to load referral codes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      Swal.fire({
        icon: "success",
        title: "Copied",
        text: "Referral code copied to clipboard.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Copy code failed:", error);
      Swal.fire("Error", "Unable to copy the referral code.", "error");
    }
  };

  useEffect(() => {
    fetchCodes(1);
  }, []);

  const handleGenerate = async () => {
    const safeCount = Number(count) > 0 ? Number(count) : 10;

    setIsLoading(true);
    try {
      const response = await api.post("/api/referral-codes/generate", { count: safeCount });

      if (response.data.success) {
        setCount(10);
        await fetchCodes(1);
        Swal.fire({
          icon: "success",
          title: "Referral codes generated",
          text: `${response.data.count} referral code(s) created successfully.`,
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Generate referral codes failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Referral codes could not be generated.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: "Delete referral code?",
      text: `Are you sure you want to delete ${code}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C8102E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete(`/api/referral-codes/${id}`);

      if (response.data.success) {
        const targetPage = codes.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        await fetchCodes(targetPage);

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Referral code removed successfully.",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Delete referral code failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Referral code could not be deleted.",
        "error"
      );
    }
  };

  return (
    <div className="w-full pb-20">
      <div className="space-y-6 bg-white p-8 border-2 border-gray-200 mt-6 rounded-none shadow-md">
        <PageHeader
          title="REFERRAL CODES"
          description="Generate unique referral codes for membership purchases and track how many members used each code."
        />

        <div className="bg-[#f7f7f7] border-2 border-gray-200 p-5 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
              Number of referral codes to generate
            </label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full border-2 border-gray-300 px-4 py-3 text-sm focus:border-[#C8102E] outline-none rounded-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-[#C8102E] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
            Generate Codes
          </button>
        </div>

        <div className="overflow-x-auto border-2 border-gray-200">
          <table className="min-w-full text-left">
            <thead className="bg-[#111827] text-white">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Code</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Memberships</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Created</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center text-sm text-gray-500">
                    No referral codes generated yet.
                  </td>
                </tr>
              ) : (
                codes.map((item) => (
                  <tr key={item._id} className="border-b border-gray-200 even:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-[#C8102E]">{item.code}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{item.membershipCount || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.code)}
                          className="inline-flex items-center justify-center border-2 border-gray-300 bg-white p-2 text-gray-700 hover:border-[#C8102E] hover:text-[#C8102E]"
                          title="Copy referral code"
                          aria-label={`Copy referral code ${item.code}`}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id, item.code)}
                          className="inline-flex items-center justify-center border-2 border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                          title="Delete referral code"
                          aria-label={`Delete referral code ${item.code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => fetchCodes(page)}
          label="codes"
        />
      </div>
    </div>
  );
};

export default ReferralCodes;

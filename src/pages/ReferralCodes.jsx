import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Share2,
  Trash2,
  UserPlus,
} from "lucide-react";
import * as XLSX from "xlsx";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import api from "../lib/api";

const itemsPerPage = 10;

const ReferralCodes = () => {
  const [codes, setCodes] = useState([]);
  const [vpName, setVpName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparingSheet, setIsPreparingSheet] = useState(false);

  const fetchAllCodes = async () => {
    const firstPageResponse = await api.get("/api/referral-codes", {
      params: { page: 1, limit: 50 },
    });

    if (!firstPageResponse.data.success) {
      throw new Error("Unable to load referral codes for export.");
    }

    const firstPageCodes = firstPageResponse.data.data || [];
    const totalPages = Number(firstPageResponse.data.totalPages || 1);
    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
        api.get("/api/referral-codes", {
          params: { page: index + 2, limit: 50 },
        })
      )
    );

    return [
      ...firstPageCodes,
      ...remainingPages.flatMap((response) => {
        if (!response.data.success) {
          throw new Error("Unable to load all referral codes for export.");
        }
        return response.data.data || [];
      }),
    ];
  };

  const getExportRows = (items) => [
    ["S.NO", "Referral Code", "Full Name", "Password", "Memberships", "Status", "Created"],
    ...items.map((item, index) => [
      index + 1,
      item.code || "",
      item.referrerName || "-",
      item.influencerAccountId?.password || "-",
      item.membershipCount || 0,
      item.isActive === false ? "Inactive" : "Active",
      item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "-",
    ]),
  ];

  const addWorksheet = (workbook, name, rows) => {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 28 },
      { wch: 24 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  };

  const handleDownloadExcel = async () => {
    setIsPreparingSheet(true);
    try {
      const allCodes = await fetchAllCodes();
      if (allCodes.length === 0) {
        Swal.fire("No data", "There are no referral codes to download.", "info");
        return;
      }

      const workbook = XLSX.utils.book_new();
      addWorksheet(workbook, "All Referral Codes", getExportRows(allCodes));
      XLSX.writeFile(workbook, "Referral_Codes.xlsx");
    } catch (error) {
      console.error("Download referral codes failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || error.message || "Unable to download referral codes.",
        "error"
      );
    } finally {
      setIsPreparingSheet(false);
    }
  };

  const requestCodes = async (page = 1) => {
    const response = await api.get("/api/referral-codes", {
      params: { page, limit: itemsPerPage },
    });
    if (!response.data.success) {
      throw new Error("Unable to load referral codes.");
    }
    return response.data;
  };

  const fetchCodes = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await requestCodes(page);
      setCodes(data.data || []);
      setCurrentPage(Number(data.currentPage || page));
      setTotalItems(Number(data.totalItems || 0));
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

  const handleShareCode = async (code) => {
    try {
      if (navigator.share) {
        await navigator.share({ text: code });
        return;
      }

      window.open(
        `https://wa.me/?text=${encodeURIComponent(code)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Share referral code failed:", error);
      Swal.fire("Error", "Unable to share the referral code.", "error");
    }
  };

  useEffect(() => {
    let active = true;
    requestCodes(1)
      .then((data) => {
        if (active) {
          setCodes(data.data || []);
          setCurrentPage(Number(data.currentPage || 1));
          setTotalItems(Number(data.totalItems || 0));
        }
      })
      .catch((error) => {
        console.error("Failed to load referral codes:", error);
        if (active) Swal.fire("Error", "Unable to load referral codes.", "error");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleGenerateVpCode = async (event) => {
    event.preventDefault();
    const referrerName = vpName.trim();
    const code = customCode.trim().toUpperCase();

    if (!referrerName || !/^[A-Z]+(?:0[1-9]|[1-9]\d)$/.test(code)) {
      Swal.fire(
        "Check name and referral code",
        "Enter the full name and a unique code ending with exactly 2 digits (e.g. DS01).",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/api/influencers/accounts", {
        name: referrerName,
        code,
      });

      setVpName("");
      setCustomCode("");
      const newPassword = response.data.data.password;
      const newCodeId = response.data.data.referralCodes?.[0]?._id;
      await fetchCodes(1);
      if (newCodeId) {
        setVisiblePasswords((current) => ({ ...current, [newCodeId]: true }));
      }
      await Swal.fire({
        icon: "success",
        title: "Referral code and login created",
        text: `Password: ${newPassword}. You can view it in the admin referral-code table.`,
        confirmButtonColor: "#C8102E",
      });
    } catch (error) {
      console.error("Generate VP referral code failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "VP referral code could not be generated.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLogin = async (item) => {
    const confirmation = await Swal.fire({
      title: `Create login for ${item.code}`,
      text: "A unique password will be generated automatically.",
      showCancelButton: true,
      confirmButtonText: "Create login",
      confirmButtonColor: "#C8102E",
    });
    if (!confirmation.isConfirmed) return;

    try {
      const response = await api.post("/api/influencers/accounts", {
        name: item.referrerName,
        referralCodeIds: [item._id],
      });
      await fetchCodes(currentPage);
      setVisiblePasswords((current) => ({ ...current, [item._id]: true }));
      await Swal.fire({
        icon: "success",
        title: "Influencer login created",
        text: `Password: ${response.data.data.password}. It is also available in the admin table.`,
        confirmButtonColor: "#C8102E",
      });
    } catch (error) {
      console.error("Create influencer login failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Influencer login could not be created.",
        "error"
      );
    }
  };

  const handleResetLoginPassword = async (item) => {
    const confirmation = await Swal.fire({
      title: `Reset password for ${item.code}`,
      text: "Generate a new unique password based on this referral code?",
      showCancelButton: true,
      confirmButtonText: "Reset password",
      confirmButtonColor: "#C8102E",
    });
    if (!confirmation.isConfirmed) return;

    try {
      const response = await api.patch(
        `/api/influencers/accounts/${item.influencerAccountId._id}/password`,
        {},
      );
      await fetchCodes(currentPage);
      setVisiblePasswords((current) => ({ ...current, [item._id]: true }));
      await Swal.fire({
        icon: "success",
        title: "Password reset",
        text: `New password: ${response.data.password}. It is also available in the admin table.`,
        confirmButtonColor: "#C8102E",
      });
    } catch (error) {
      console.error("Reset influencer password failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Influencer password could not be reset.",
        "error"
      );
    }
  };

  const handleEdit = async (item) => {
    const codeResult = await Swal.fire({
      title: "Edit referral code",
      input: "text",
      inputValue: item.code,
      inputAttributes: { maxlength: "30", autocapitalize: "characters" },
      showCancelButton: true,
      confirmButtonText: "Next",
      confirmButtonColor: "#C8102E",
      inputValidator: (value) =>
        !/^[A-Za-z0-9-]{3,30}$/.test(value.trim())
          ? "Use 3–30 letters, numbers, or hyphens."
          : undefined,
    });
    if (!codeResult.isConfirmed) return;

    const nameResult = await Swal.fire({
      title: "Edit full name",
      input: "text",
      inputValue: item.referrerName || "",
      inputAttributes: { maxlength: "100" },
      showCancelButton: true,
      confirmButtonText: "Save changes",
      confirmButtonColor: "#C8102E",
      inputValidator: (value) =>
        !value.trim() ? "Full name is required." : undefined,
    });
    if (!nameResult.isConfirmed) return;

    try {
      await api.put(`/api/referral-codes/${item._id}`, {
        code: codeResult.value.trim().toUpperCase(),
        referrerName: nameResult.value.trim(),
      });
      await fetchCodes(currentPage);
      Swal.fire("Saved", "Referral code and full name updated.", "success");
    } catch (error) {
      console.error("Update referral code failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Referral code could not be updated.",
        "error"
      );
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await api.put(`/api/referral-codes/${item._id}`, {
        code: item.code,
        referrerName: item.referrerName,
        isActive: item.isActive === false,
      });
      await fetchCodes(currentPage);
    } catch (error) {
      console.error("Update referral code status failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Referral code status could not be updated.",
        "error"
      );
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: "Delete referral code?",
      text: `Delete ${code} and its influencer login? Membership history may be affected.`,
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
          description="Create and manage VP referral codes, linked influencer logins, and membership totals."
        >
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={isPreparingSheet || isLoading}
            className="inline-flex items-center justify-center gap-2 border-2 border-[#C8102E] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#C8102E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPreparingSheet ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : (
              <Download size={14} />
            )}
            Download Excel
          </button>
        </PageHeader>

        <form
          onSubmit={handleGenerateVpCode}
          className="bg-[#f7f7f7] border-2 border-gray-200 p-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4 md:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="vp-name"
              className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2"
            >
              Full name
            </label>
            <input
              id="vp-name"
              type="text"
              maxLength={100}
              value={vpName}
              onChange={(e) => setVpName(e.target.value)}
              placeholder="e.g. Divya Singh"
              className="w-full border-2 border-gray-300 px-4 py-3 text-sm focus:border-[#C8102E] outline-none rounded-none"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="vp-referral-code"
              className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2"
            >
              Referral code (you choose)
            </label>
            <input
              id="vp-referral-code"
              type="text"
              maxLength={30}
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="e.g. DS01"
              pattern="[A-Za-z]+(0[1-9]|[1-9][0-9])"
              title="Use your chosen name or initials followed by a unique number from 01 to 99, e.g. DS01."
              className="w-full border-2 border-gray-300 px-4 py-3 text-sm focus:border-[#C8102E] outline-none rounded-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              Choose any name/prefix and an unused number from 01 to 99 (e.g. DS01, PS02).
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !vpName.trim() || !customCode.trim()}
            className="inline-flex items-center justify-center gap-2 bg-[#C8102E] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
            Create Code & Login
          </button>
        </form>

        <div className="overflow-x-auto border-2 border-gray-200">
          <table className="min-w-full text-left">
            <thead className="bg-[#111827] text-white">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Code</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Full Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Password</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Memberships</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Created</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-500">
                    No referral codes generated yet.
                  </td>
                </tr>
              ) : (
                codes.map((item) => (
                  <tr key={item._id} className="border-b border-gray-200 even:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-[#C8102E]">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.referrerName || "-"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {item.influencerAccountId?.password ? (
                        <div className="flex min-w-36 items-center gap-2">
                          <span className="font-mono text-gray-700">
                            {visiblePasswords[item._id]
                              ? item.influencerAccountId.password
                              : "••••••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setVisiblePasswords((current) => ({
                                ...current,
                                [item._id]: !current[item._id],
                              }))
                            }
                            className="text-gray-500 hover:text-gray-900"
                            title={visiblePasswords[item._id] ? "Hide password" : "Show password"}
                            aria-label={`${visiblePasswords[item._id] ? "Hide" : "Show"} password for ${item.code}`}
                          >
                            {visiblePasswords[item._id] ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>
                      ) : item.influencerAccountId ? (
                        <span className="text-amber-700">Reset to generate</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{item.membershipCount || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.isActive === false ? "Inactive" : "Active"}
                    </td>
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
                          onClick={() => handleShareCode(item.code)}
                          className="inline-flex items-center justify-center border-2 border-green-200 bg-green-50 p-2 text-green-700 hover:bg-green-100"
                          title={`Share referral code ${item.code}`}
                          aria-label={`Share referral code ${item.code}`}
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center border-2 border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          title="Edit referral code and full name"
                          aria-label={`Edit ${item.code} referral details`}
                        >
                          <Pencil size={14} />
                        </button>
                        {item.influencerAccountId ? (
                          <button
                            type="button"
                            onClick={() => handleResetLoginPassword(item)}
                            className="inline-flex items-center justify-center border-2 border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
                            title="Reset influencer password"
                            aria-label={`Reset password for ${item.code}`}
                          >
                            <KeyRound size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreateLogin(item)}
                            disabled={!item.referrerName}
                            className="inline-flex items-center justify-center border-2 border-emerald-200 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            title={item.referrerName ? "Create influencer login" : "Add full name before creating login"}
                            aria-label={`Create login for ${item.code}`}
                          >
                            <UserPlus size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center justify-center border-2 p-2 ${
                            item.isActive === false
                              ? "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                              : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                          title={item.isActive === false ? "Activate referral code" : "Deactivate referral code"}
                          aria-label={`${item.isActive === false ? "Activate" : "Deactivate"} ${item.code}`}
                        >
                          <Power size={14} />
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

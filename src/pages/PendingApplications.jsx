import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Eye, Mail, RefreshCw, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";

const PendingApplications = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/members/pending-applications");
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Failed to load pending applications:", error);
      Swal.fire("Error", "Failed to fetch pending applications.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter((application) =>
      [application.name, application.email, application.mobile, application.membership?.name]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [applications, searchTerm]);

  const downloadSheet = () => {
    if (filteredApplications.length === 0) {
      Swal.fire("No data", "There are no pending applications to download.", "info");
      return;
    }

    const dataToExport = filteredApplications.map((application, index) => ({
      "S.NO": index + 1,
      "Name": application.name || "N/A",
      "Email": application.email || "N/A",
      "Mobile": application.mobile || "N/A",
      "Membership Plan": application.membership?.name || "N/A",
      "Payment Status": "Payment Pending",
      "Saved On": application.updatedAt || application.createdAt
        ? new Date(application.updatedAt || application.createdAt).toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Applications");
    XLSX.writeFile(workbook, "Pending_Membership_Applications.xlsx");
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Pending Applications"
        description="People who submitted membership details but have not completed payment."
      >
        <button
          type="button"
          onClick={fetchApplications}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-bold uppercase hover:bg-gray-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
        <button
          type="button"
          onClick={downloadSheet}
          className="flex items-center gap-2 bg-[#C8102E] px-4 py-2 text-sm font-bold uppercase text-white hover:bg-[#a00d24]"
        >
          <Download size={16} />
          Download Sheet
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="rounded border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
          {filteredApplications.length} pending application{filteredApplications.length === 1 ? "" : "s"}
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search name, email, mobile or plan..."
          className="w-full max-w-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C8102E]"
        />
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Applicant", "Contact", "Plan", "Saved On", "Status", "Action"].map((heading) => (
                <th key={heading} className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">Loading applications...</td></tr>
            ) : filteredApplications.length === 0 ? (
              <tr><td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">No pending applications found.</td></tr>
            ) : filteredApplications.map((application) => {
              const savedOn = new Date(application.updatedAt || application.createdAt);
              return (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="font-bold uppercase text-sm text-gray-800">{application.name || "N/A"}</div>
                    <div className="text-[10px] font-bold text-[#C8102E]">ID: PENDING</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2"><Mail size={13} />{application.email || "N/A"}</div>
                    <div className="mt-1 flex items-center gap-2 font-bold"><Smartphone size={13} />{application.mobile || "N/A"}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-blue-600">{application.membership?.name || "N/A"}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2"><Calendar size={13} />{Number.isNaN(savedOn.getTime()) ? "N/A" : savedOn.toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded border border-yellow-200 bg-yellow-50 px-2 py-1 text-[10px] font-bold uppercase text-yellow-700">Payment Pending</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/member-profile/${application._id}`)}
                      className="rounded bg-blue-50 p-2 text-blue-600 hover:bg-blue-600 hover:text-white"
                      title="View application"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingApplications;

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  label = "items",
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [visiblePages, setVisiblePages] = useState([]);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    setVisiblePages(pages);
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* TEXT */}
      <div className="text-sm text-gray-700 font-medium">
        Showing <span className="font-semibold">{startItem}</span>–
        <span className="font-semibold">{endItem}</span> of{" "}
        <span className="font-semibold">{totalItems}</span> {label}
      </div>

      {/* BUTTONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border-2 border-gray-200 bg-white text-[#C8102E] disabled:opacity-50 transition hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {visiblePages.map((page, i) =>
          page === "..." ? (
            <div key={i} className="px-1">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 border-2 font-bold transition ${
                page === currentPage
                  ? "bg-[#C8102E] text-white border-[#C8102E]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border-2 border-gray-200 bg-white text-[#C8102E] disabled:opacity-50 transition hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

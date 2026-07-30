import React from 'react';
import { Search, List } from 'lucide-react';

const SearchBar = ({ 
    rowsPerPage, 
    totalItems, 
    onRowsPerPageChange, 
    searchValue, 
    onSearchChange, 
    searchPlaceholder = "Search..." 
}) => {
    return (
        <div className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 text-[12px] bg-white border-none focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 shadow-inner"
                    />
                </div>

                {/* Rows Per Page Selector */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <List size={14} className="text-white/60" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest hidden sm:inline">Show:</span>
                        <select 
                            value={rowsPerPage}
                            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                            className="h-10 text-[11px] font-black text-gray-800 border-none bg-white focus:ring-0 cursor-pointer uppercase tracking-widest px-4 shadow-inner"
                        >
                            <option value={5}>05 Rows</option>
                            <option value={10}>10 Rows</option>
                            <option value={20}>20 Rows</option>
                            <option value={50}>50 Rows</option>
                            <option value={totalItems}>All Results</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;

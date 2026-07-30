import { Eye, Edit, Trash2 } from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  wrapperClassName = "",
  theadClassName = "bg-[#C8102E]",
  rowClassName = "hover:bg-red-50 transition-colors"
}) {
  const showActions = onEdit || onDelete;

  return (
    <div className="w-full overflow-hidden">
      <div className={`table-scroll-wrapper overflow-x-auto rounded-md border border-gray-100 bg-white shadow-md ${wrapperClassName}`}>
        <table className="w-full text-sm whitespace-nowrap min-w-full">
          {/* HEADER */}
          <thead className={`${theadClassName}`}>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={`${col.key}-${index}`}
                  className={`px-6 py-4 font-bold text-white uppercase text-xs tracking-wider ${col.headerClassName || 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-right font-bold text-white uppercase text-xs tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center py-12 text-gray-400 font-medium"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={`${rowClassName}`}>
                  {columns.map((col, colIndex) => (
                    <td key={`${col.key}-${colIndex}`} className={`px-6 py-4 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 transition rounded-md border border-transparent hover:border-blue-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 text-red-600 hover:bg-red-50 transition rounded-md border border-transparent hover:border-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DataPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'bản ghi',
  pageSizeOptions = [5, 10, 20, 50],
}) {
  if (!totalItems || totalItems <= 0) return null

  const safePage = Math.max(1, page || 1)
  const safePageSize = Math.max(1, pageSize || 10)
  const computedTotalPages = Math.max(1, Math.ceil(totalItems / safePageSize))
  const safeTotalPages = Math.max(computedTotalPages, totalPages || 1)
  const start = (safePage - 1) * safePageSize + 1
  const end = Math.min(safePage * safePageSize, totalItems)

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 gap-3 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
        <p>
          Hiển thị <span className="font-semibold">{start}-{end}</span> / <span className="font-semibold">{totalItems}</span> {itemLabel}
        </p>
        <div className="flex items-center gap-2">
          <span>Mỗi trang</span>
          <select
            value={safePageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-1">
          Trang <span className="font-semibold">{safePage}</span> / {safeTotalPages}
        </span>
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === safeTotalPages}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  )
}

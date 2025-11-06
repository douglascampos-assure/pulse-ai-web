/**
 * DateRangeFilter Component
 * 
 * A reusable date range filter with separate dropdowns for start and end dates.
 * Uses month and day selectors (no year) for filtering meeting data.
 * Includes a clear button to reset all filters.
 * 
 * @component
 * @example
 * ```jsx
 * <DateRangeFilter
 *   startMonth={startMonth}
 *   startDay={startDay}
 *   endMonth={endMonth}
 *   endDay={endDay}
 *   onChangeStartMonth={setStartMonth}
 *   onChangeStartDay={setStartDay}
 *   onChangeEndMonth={setEndMonth}
 *   onChangeEndDay={setEndDay}
 *   onClear={clearDateFilter}
 * />
 * ```
 */

export default function DateRangeFilter({
  startMonth,
  startDay,
  endMonth,
  endDay,
  onChangeStartMonth,
  onChangeStartDay,
  onChangeEndMonth,
  onChangeEndDay,
  onClear,
  disabled = false,
  className = ""
}) {
  // Month options for dropdowns
  const months = [
    { value: "1", label: "Jan" },
    { value: "2", label: "Feb" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Apr" },
    { value: "5", label: "May" },
    { value: "6", label: "Jun" },
    { value: "7", label: "Jul" },
    { value: "8", label: "Aug" },
    { value: "9", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" }
  ];

  // Generate days array (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Check if any filter is active
  const hasActiveFilters = startMonth || startDay || endMonth || endDay;

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${className}`}>
      {/* ====================================================================
          START DATE FILTER
          ==================================================================== */}
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        <label 
          htmlFor="start-month"
          className="text-xs font-semibold text-slate-700 mb-1 block"
        >
          Start Date
        </label>
        
        <div className="flex gap-1">
          {/* Start Month Dropdown */}
          <select
            id="start-month"
            value={startMonth}
            onChange={(e) => onChangeStartMonth && onChangeStartMonth(e.target.value)}
            disabled={disabled}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          {/* Start Day Dropdown */}
          <select
            id="start-day"
            value={startDay}
            onChange={(e) => onChangeStartDay && onChangeStartDay(e.target.value)}
            disabled={disabled}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ====================================================================
          END DATE FILTER
          ==================================================================== */}
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        <label 
          htmlFor="end-month"
          className="text-xs font-semibold text-slate-700 mb-1 block"
        >
          End Date
        </label>
        
        <div className="flex gap-1">
          {/* End Month Dropdown */}
          <select
            id="end-month"
            value={endMonth}
            onChange={(e) => onChangeEndMonth && onChangeEndMonth(e.target.value)}
            disabled={disabled}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          {/* End Day Dropdown */}
          <select
            id="end-day"
            value={endDay}
            onChange={(e) => onChangeEndDay && onChangeEndDay(e.target.value)}
            disabled={disabled}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              disabled={disabled}
              className="px-2 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear date filter"
              aria-label="Clear date range filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} DateRangeFilterProps
 * @property {string} startMonth - Selected start month (1-12) or empty string
 * @property {string} startDay - Selected start day (1-31) or empty string
 * @property {string} endMonth - Selected end month (1-12) or empty string
 * @property {string} endDay - Selected end day (1-31) or empty string
 * @property {function} onChangeStartMonth - Callback when start month changes
 * @property {function} onChangeStartDay - Callback when start day changes
 * @property {function} onChangeEndMonth - Callback when end month changes
 * @property {function} onChangeEndDay - Callback when end day changes
 * @property {function} onClear - Callback to clear all date filters
 * @property {boolean} [disabled=false] - Whether the filter is disabled
 * @property {string} [className=""] - Additional CSS classes
 */
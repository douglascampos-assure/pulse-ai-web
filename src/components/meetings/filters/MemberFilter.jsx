/**
 * MemberFilter Component
 * 
 * A reusable dropdown filter for selecting team members in the analytics dashboard.
 * Displays "All Members" option and individual member names.
 * 
 * @component
 * @example
 * ```jsx
 * <MemberFilter
 *   value={selectedMember}
 *   onChange={handleMemberChange}
 *   members={['John Doe', 'Jane Smith', 'Mike Johnson']}
 *   showAllOption={true}
 * />
 * ```
 */

export default function MemberFilter({
  value,
  onChange,
  members = [],
  showAllOption = true,
  allOptionLabel = "All Members",
  disabled = false,
  className = ""
}) {
  /**
   * Handle member selection change
   * @param {Event} e - Change event from select element
   */
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`bg-white rounded-lg p-2 border border-gray-200 ${className}`}>
      {/* Label */}
      <label 
        htmlFor="member-filter"
        className="text-xs font-semibold text-slate-700 mb-1 block"
      >
        Team Member
      </label>

      {/* Select Dropdown */}
      <select
        id="member-filter"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* "All Members" Option */}
        {showAllOption && (
          <option value="">{allOptionLabel}</option>
        )}

        {/* Individual Member Options */}
        {members.map((name, index) => (
          <option key={`${name}-${index}`} value={name}>
            {name}
          </option>
        ))}
      </select>

      {/* Empty State Message */}
      {members.length === 0 && !showAllOption && (
        <p className="text-xs text-slate-500 mt-1 italic">
          No team members available
        </p>
      )}
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} MemberFilterProps
 * @property {string} value - Currently selected member name or empty string for "all"
 * @property {function} onChange - Callback function when member selection changes
 * @property {string[]} members - Array of unique member names
 * @property {boolean} [showAllOption=true] - Whether to show "All Members" option
 * @property {string} [allOptionLabel="All Members"] - Custom label for "all" option
 * @property {boolean} [disabled=false] - Whether the filter is disabled
 * @property {string} [className=""] - Additional CSS classes
 */
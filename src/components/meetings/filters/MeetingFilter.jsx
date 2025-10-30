/**
 * MeetingFilter Component
 * 
 * A reusable dropdown filter for selecting meetings in the analytics dashboard.
 * Displays "All Meetings" option and individual meeting dates.
 * 
 * @component
 * @example
 * ```jsx
 * <MeetingFilter
 *   value={selectedMeeting}
 *   onChange={handleMeetingChange}
 *   meetings={filteredMeetings}
 *   showAllOption={true}
 * />
 * ```
 */

export default function MeetingFilter({
  value,
  onChange,
  meetings = [],
  showAllOption = true,
  allOptionLabel = "All Meetings",
  disabled = false,
  className = ""
}) {
  /**
   * Handle meeting selection change
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
        htmlFor="meeting-filter"
        className="text-xs font-semibold text-slate-700 mb-1 block"
      >
        Meeting
      </label>

      {/* Select Dropdown */}
      <select
        id="meeting-filter"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* "All Meetings" Option */}
        {showAllOption && (
          <option value="all">{allOptionLabel}</option>
        )}

        {/* Individual Meeting Options */}
        {meetings.map((meeting) => (
          <option key={meeting.recording_id} value={meeting.recording_id}>
            {meeting.meeting_date}
          </option>
        ))}
      </select>

      {/* Empty State Message */}
      {meetings.length === 0 && !showAllOption && (
        <p className="text-xs text-slate-500 mt-1 italic">
          No meetings available
        </p>
      )}
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} MeetingFilterProps
 * @property {string} value - Currently selected meeting recording_id or "all"
 * @property {function} onChange - Callback function when meeting selection changes
 * @property {Array<Object>} meetings - Array of meeting objects with recording_id and meeting_date
 * @property {boolean} [showAllOption=true] - Whether to show "All Meetings" option
 * @property {string} [allOptionLabel="All Meetings"] - Custom label for "all" option
 * @property {boolean} [disabled=false] - Whether the filter is disabled
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} Meeting
 * @property {string} recording_id - Unique identifier for the meeting
 * @property {string} meeting_date - Date of the meeting (e.g., "2025-10-15")
 */
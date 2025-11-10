/**
 * ParticipantsSummaryCard Component
 * 
 * A card component that displays team size with a large centered number
 * and additional summary statistics below.
 * Shows total active members, meetings count, and key metrics.
 * 
 * @component
 * @example
 * ```jsx
 * <ParticipantsSummaryCard
 *   totalParticipants={12}
 *   totalMeetings={8}
 *   avgQuality="7.5"
 *   avgParticipation="65.3"
 * />
 * ```
 */

export default function ParticipantsSummaryCard({
  totalParticipants = 0,
  totalMeetings = 0,
  avgQuality = "0",
  avgParticipation = "0",
  icon = "👥",
  className = ""
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex flex-col h-full ${className}`}>
      {/* Main Display - Team Size */}
      <div className="text-center flex-1 flex flex-col justify-center py-6">
        {/* Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">{icon}</span>
        </div>

        {/* Label */}
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
          Team Size
        </p>

        {/* Main Number */}
        <p className="text-5xl font-bold text-slate-800 mb-1">
          {totalParticipants}
        </p>

        {/* Subtitle */}
        <p className="text-xs text-slate-500">Active Members</p>
      </div>

      {/* Summary Statistics */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        {/* Total Meetings */}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-xs text-slate-600 font-medium">Total Meetings</span>
          <span className="text-sm text-slate-800 font-bold">{totalMeetings}</span>
        </div>

        {/* Average Quality */}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-xs text-slate-600 font-medium">Avg Quality</span>
          <span className="text-sm text-slate-800 font-bold">{avgQuality}/10</span>
        </div>

        {/* Average Participation */}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-xs text-slate-600 font-medium">Avg Participation</span>
          <span className="text-sm text-slate-800 font-bold">{avgParticipation}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} ParticipantsSummaryCardProps
 * @property {number} [totalParticipants=0] - Total number of unique team members
 * @property {number} [totalMeetings=0] - Total number of meetings in the period
 * @property {string|number} [avgQuality="0"] - Average quality score (0-10)
 * @property {string|number} [avgParticipation="0"] - Average participation percentage
 * @property {string} [icon="👥"] - Emoji or icon to display in the circle
 * @property {string} [className=""] - Additional CSS classes
 */
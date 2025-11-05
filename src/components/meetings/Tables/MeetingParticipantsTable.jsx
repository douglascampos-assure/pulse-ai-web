/**
 * MeetingParticipantsTable Component
 * 
 * A table component for displaying participants of a specific meeting.
 * Shows camera usage, participation, interventions, contribution type, and quality scores.
 * Each row is clickable to view individual participant details.
 * Simpler than TeamMembersTable as it shows single-meeting data.
 * 
 * @component
 * @example
 * ```jsx
 * <MeetingParticipantsTable
 *   participants={participants}
 *   onSelectMember={(name) => setSelectedMember(name)}
 *   meetingDate="2025-10-15"
 * />
 * ```
 */

export default function MeetingParticipantsTable({
  participants = [],
  title = "Meeting Participants",
  icon = "👥",
  meetingDate = null,
  onSelectMember,
  className = ""
}) {
  /**
   * Get color scheme based on score and type
   * @param {number} score - The score to evaluate
   * @param {string} type - Either "quality" or "percentage"
   * @returns {Object} Color configuration object
   */
  const getScoreColor = (score, type = "quality") => {
    if (type === "quality") {
      if (score >= 8) return { 
        bg: "bg-emerald-500", 
        text: "text-emerald-700", 
        label: "Excellent", 
        lightBg: "bg-emerald-50", 
        border: "border-emerald-300" 
      };
      if (score >= 6) return { 
        bg: "bg-amber-500", 
        text: "text-amber-700", 
        label: "Good", 
        lightBg: "bg-amber-50", 
        border: "border-amber-300" 
      };
      return { 
        bg: "bg-rose-500", 
        text: "text-rose-700", 
        label: "Needs Improvement", 
        lightBg: "bg-rose-50", 
        border: "border-rose-300" 
      };
    }
  };

  /**
   * Get badge configuration for contribution types
   * @param {string} type - The contribution type
   * @returns {Object} Badge configuration with label and color
   */
  const getContributionTypeBadge = (type) => {
    const types = {
      proposal: { label: "Proactive", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      report: { label: "Informative", color: "bg-sky-50 text-sky-700 border-sky-200" },
      question: { label: "Inquisitive", color: "bg-orange-50 text-orange-700 border-orange-200" },
      discussion: { label: "Collaborative", color: "bg-teal-50 text-teal-700 border-teal-200" },
    };
    return types[type] || types.discussion;
  };

  /**
   * Get participation level color
   * @param {number} percentage - Participation percentage
   * @returns {Object} Color configuration
   */
  const getParticipationLevel = (percentage) => {
    if (percentage >= 20) return { color: "bg-emerald-500" };
    if (percentage >= 10) return { color: "bg-amber-500" };
    return { color: "bg-rose-500" };
  };

  /**
   * Handle row click
   * @param {string} participantName - Name of the participant
   */
  const handleRowClick = (participantName) => {
    if (onSelectMember) {
      onSelectMember(participantName);
    }
  };

  // Handle empty state
  if (participants.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${className}`}>
        <div className="bg-slate-700 px-3 py-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-base">{icon}</span>
            {title}
          </h3>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">
          No participants data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${className}`}>
      {/* Table Header */}
      <div className="bg-slate-700 px-3 py-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-base">{icon}</span>
          {title}
          {meetingDate && (
            <span className="text-xs font-normal text-slate-300 ml-2">
              • {meetingDate}
            </span>
          )}
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Participant</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Camera</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Participation</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Interventions</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Type</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.map((participant, index) => {
              const qualityColor = getScoreColor(participant.contribution_quality_score, "quality");
              const participation = getParticipationLevel(participant.speech_percentage);
              const contributionBadge = getContributionTypeBadge(participant.contribution_type);

              return (
                <tr 
                  key={index} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(participant.participant_name)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleRowClick(participant.participant_name);
                    }
                  }}
                >
                  {/* Participant Info with Avatar */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                        {participant.participant_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <p className="font-semibold text-slate-800">{participant.participant_name}</p>
                    </div>
                  </td>
                  
                  {/* Camera Usage */}
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">{participant.camera_on_percentage}%</span>
                  </td>
                  
                  {/* Participation with Progress Bar */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${participation.color}`}
                          style={{ width: `${Math.min(participant.speech_percentage * 5, 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-800">{participant.speech_percentage}%</span>
                    </div>
                  </td>
                  
                  {/* Interventions Count */}
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">{participant.total_utterances}</span>
                  </td>
                  
                  {/* Contribution Type Badge */}
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded border ${contributionBadge.color} font-medium`}>
                      {contributionBadge.label}
                    </span>
                  </td>
                  
                  {/* Quality Score */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded border ${qualityColor.lightBg} ${qualityColor.text} ${qualityColor.border} font-semibold`}>
                        {qualityColor.label}
                      </span>
                      <span className="font-bold text-slate-800">{participant.contribution_quality_score}/10</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} MeetingParticipantsTableProps
 * @property {Array<Participant>} [participants=[]] - Array of meeting participants
 * @property {string} [title="Meeting Participants"] - Table title
 * @property {string} [icon="👥"] - Icon to display next to title
 * @property {string} [meetingDate=null] - Optional meeting date to display in header
 * @property {function} [onSelectMember] - Callback when a participant row is clicked
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} Participant
 * @property {string} participant_name - Participant name
 * @property {number} camera_on_percentage - Camera on percentage (0-100)
 * @property {number} speech_percentage - Speech/participation percentage (0-100)
 * @property {number} total_utterances - Number of interventions
 * @property {string} contribution_type - Type of contribution (proposal, report, question, discussion)
 * @property {number} contribution_quality_score - Quality score (0-10)
 */
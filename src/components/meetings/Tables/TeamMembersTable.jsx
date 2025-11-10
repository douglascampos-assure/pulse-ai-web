/**
 * TeamMembersTable Component
 * 
 * A comprehensive table component for displaying team member performance metrics.
 * Shows participation, camera usage, interventions, contribution type, and quality scores.
 * Each row is clickable to view individual member details.
 * Data is sorted by quality score (lowest first) to highlight members needing attention.
 * 
 * @component
 * @example
 * ```jsx
 * <TeamMembersTable
 *   members={membersArray}
 *   onSelectMember={(name) => setSelectedMember(name)}
 * />
 * ```
 */

export default function TeamMembersTable({
  members = [],
  title = "Team Members Overview",
  icon = "👥",
  onSelectMember,
  sortBy = "quality", // "quality", "participation", "name"
  sortOrder = "asc", // "asc" or "desc"
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
      if (score >= 7.0) return { 
        bg: "bg-emerald-500", 
        text: "text-emerald-700", 
        label: "Excellent", 
        lightBg: "bg-emerald-50", 
        border: "border-emerald-300" 
      };
      if (score >= 6.3) return { 
        bg: "bg-lime-400", 
        text: "text-lime-700", 
        label: "Good", 
        lightBg: "bg-lime-50", 
        border: "border-lime-300" 
      };
      if (score >= 4.0) return { 
        bg: "bg-amber-400", 
        text: "text-amber-700", 
        label: "Regular", 
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

    if (type === "percentage") {
      if (score >= 80) return { 
        bg: "bg-emerald-500", 
        text: "text-emerald-700", 
        label: "Excellent", 
        lightBg: "bg-emerald-50", 
        border: "border-emerald-300" 
      };
      if (score >= 65) return { 
        bg: "bg-lime-400", 
        text: "text-lime-700", 
        label: "Good", 
        lightBg: "bg-lime-50", 
        border: "border-lime-300" 
      };
      if (score >= 45) return { 
        bg: "bg-amber-400", 
        text: "text-amber-700", 
        label: "Regular", 
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
   * Get role badge configuration
   * @param {string} role - The role of the participant
   * @returns {Object} Badge configuration
   */
  const getRoleBadge = (role) => {
    const roles = {
      "Project Manager": { label: "PM", color: "bg-blue-50 text-blue-700 border-blue-200" },
      "Product Owner": { label: "PO", color: "bg-purple-50 text-purple-700 border-purple-200" },
      "Team member": { label: "Dev", color: "bg-slate-50 text-slate-700 border-slate-200" },
      "Unknown": { label: "—", color: "bg-gray-50 text-gray-500 border-gray-200" },
    };
    return roles[role] || roles["Unknown"];
  };

  /**
   * Handle row click
   * @param {string} memberName - Name of the member
   */
  const handleRowClick = (memberName) => {
    if (onSelectMember) {
      onSelectMember(memberName);
    }
  };

  /**
   * Sort members based on sortBy and sortOrder
   */
  const sortedMembers = [...members].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "quality":
        comparison = parseFloat(a.avgQuality) - parseFloat(b.avgQuality);
        break;
      case "participation":
        comparison = parseFloat(a.avgParticipation) - parseFloat(b.avgParticipation);
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      default:
        comparison = parseFloat(a.avgQuality) - parseFloat(b.avgQuality);
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Handle empty state
  if (members.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${className}`}>
        <div className="bg-slate-700 px-3 py-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-base">{icon}</span>
            {title}
          </h3>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">
          No team members data available
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
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Member</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Role</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Sessions</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Participation</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Camera</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Interventions</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Type</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedMembers.map((member, index) => {
              const qualityColor = getScoreColor(parseFloat(member.avgQuality), "quality");
              const participation = getParticipationLevel(parseFloat(member.avgParticipation));
              const contributionBadge = getContributionTypeBadge(member.mostCommonType);
              const roleBadge = getRoleBadge(member.role);

              return (
                <tr 
                  key={index} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(member.name)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleRowClick(member.name);
                    }
                  }}
                >
                  {/* Member Info with Avatar */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <p className="font-semibold text-slate-800">{member.name}</p>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded border ${roleBadge.color} font-medium text-xs`}>
                      {roleBadge.label}
                    </span>
                  </td>
                  
                  {/* Number of Sessions */}
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {member.meetings}
                    </span>
                  </td>
                  
                  {/* Participation with Progress Bar */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 w-16">
                        <div
                          className={`h-2 rounded-full ${participation.color}`}
                          style={{ width: `${Math.min(parseFloat(member.avgParticipation) * 5, 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-800 w-10">{member.avgParticipation}%</span>
                    </div>
                  </td>
                  
                  {/* Camera Usage */}
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">{member.avgCamera}%</span>
                  </td>
                  
                  {/* Interventions Count */}
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">{member.avgInterventions}</span>
                  </td>
                  
                  {/* Contribution Type Badge */}
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border ${contributionBadge.color} font-medium`}>
                      {contributionBadge.label}
                    </span>
                  </td>
                  
                  {/* Quality Score */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded border ${qualityColor.lightBg} ${qualityColor.text} ${qualityColor.border} font-semibold`}>
                        {qualityColor.label}
                      </span>
                      <span className="font-bold text-slate-800">{member.avgQuality}/10</span>
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
 * @typedef {Object} TeamMembersTableProps
 * @property {Array<Member>} [members=[]] - Array of member statistics
 * @property {string} [title="Team Members Overview"] - Table title
 * @property {string} [icon="👥"] - Icon to display next to title
 * @property {function} [onSelectMember] - Callback when a member row is clicked
 * @property {string} [sortBy="quality"] - Field to sort by: "quality", "participation", "name"
 * @property {string} [sortOrder="asc"] - Sort order: "asc" or "desc"
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} Member
 * @property {string} name - Member name
 * @property {string} role - Member role (Project Manager, Product Owner, Team member, Unknown)
 * @property {number} meetings - Number of meetings attended
 * @property {string} avgParticipation - Average participation percentage
 * @property {string} avgCamera - Average camera on percentage
 * @property {string} avgInterventions - Average number of interventions
 * @property {string} avgQuality - Average contextual quality score
 * @property {string} mostCommonType - Most common contribution type
 */
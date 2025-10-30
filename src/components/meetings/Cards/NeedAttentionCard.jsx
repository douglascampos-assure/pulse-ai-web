/**
 * NeedAttentionCard Component
 * 
 * A card component that displays the bottom 3 team members based on quality scores.
 * Highlights members who may need coaching or additional support.
 * Each member is clickable to view their detailed performance.
 * 
 * @component
 * @example
 * ```jsx
 * <NeedAttentionCard
 *   members={[
 *     { name: "Alice Brown", avgQuality: "5.2" },
 *     { name: "Bob Wilson", avgQuality: "5.8" },
 *     { name: "Carol Davis", avgQuality: "6.1" }
 *   ]}
 *   onSelectMember={(name) => setSelectedMember(name)}
 * />
 * ```
 */

export default function NeedAttentionCard({
  members = [],
  title = "Need Attention",
  icon = "⚠️",
  subtitle = "Needs coaching",
  onSelectMember,
  maxDisplay = 3,
  className = ""
}) {
  /**
   * Handle member click
   * @param {string} memberName - Name of the member to select
   */
  const handleClick = (memberName) => {
    if (onSelectMember) {
      onSelectMember(memberName);
    }
  };

  // Get members that need attention (limited by maxDisplay)
  const attentionMembers = members.slice(0, maxDisplay);

  return (
    <div className={`bg-amber-50 rounded-lg shadow-sm p-3 border border-amber-200 ${className}`}>
      {/* Card Title */}
      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </h3>

      {/* Members List */}
      <div className="space-y-2">
        {attentionMembers.length > 0 ? (
          attentionMembers.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-amber-200 cursor-pointer hover:shadow transition-shadow"
              onClick={() => handleClick(member.name)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClick(member.name);
                }
              }}
            >
              {/* Left: Number Badge + Name */}
              <div className="flex items-center gap-2">
                {/* Number Badge */}
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Member Info */}
                <div>
                  <p className="text-xs font-bold text-slate-800">{member.name}</p>
                  <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
              </div>

              {/* Right: Score */}
              <div className="text-right">
                <p className="text-xl font-bold text-amber-600">
                  {member.avgQuality}
                </p>
                <p className="text-xs text-slate-500">/ 10</p>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="p-4 text-center text-slate-500 text-xs">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} NeedAttentionCardProps
 * @property {Array<Member>} [members=[]] - Array of members sorted by quality (lowest first)
 * @property {string} [title="Need Attention"] - Card title
 * @property {string} [icon="⚠️"] - Icon to display next to title
 * @property {string} [subtitle="Needs coaching"] - Subtitle shown under each member name
 * @property {function} [onSelectMember] - Callback when a member is clicked
 * @property {number} [maxDisplay=3] - Maximum number of members to display
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} Member
 * @property {string} name - Member name
 * @property {string|number} avgQuality - Average quality score (formatted)
 */
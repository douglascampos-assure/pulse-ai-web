/**
 * TopPerformersCard Component
 * 
 * A card component that displays the top 3 team members based on quality scores.
 * Shows medals (🥇🥈🥉) for first, second, and third place.
 * Each performer is clickable to view their detailed performance.
 * 
 * @component
 * @example
 * ```jsx
 * <TopPerformersCard
 *   performers={[
 *     { name: "John Doe", avgQuality: "9.2" },
 *     { name: "Jane Smith", avgQuality: "8.8" },
 *     { name: "Mike Johnson", avgQuality: "8.5" }
 *   ]}
 *   onSelectMember={(name) => setSelectedMember(name)}
 * />
 * ```
 */

export default function TopPerformersCard({
  performers = [],
  title = "Top Performers",
  icon = "🏆",
  subtitle = "Quality Champion",
  onSelectMember,
  maxDisplay = 3,
  className = ""
}) {
  // Medal emojis for top 3
  const medals = ["🥇", "🥈", "🥉"];

  /**
   * Handle performer click
   * @param {string} memberName - Name of the member to select
   */
  const handleClick = (memberName) => {
    if (onSelectMember) {
      onSelectMember(memberName);
    }
  };

  // Get top performers (limited by maxDisplay)
  const topPerformers = performers.slice(0, maxDisplay);

  return (
    <div className={`bg-emerald-50 rounded-lg shadow-sm p-3 border border-emerald-200 ${className}`}>
      {/* Card Title */}
      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </h3>

      {/* Performers List */}
      <div className="space-y-2">
        {topPerformers.length > 0 ? (
          topPerformers.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-emerald-200 cursor-pointer hover:shadow transition-shadow"
              onClick={() => handleClick(member.name)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClick(member.name);
                }
              }}
            >
              {/* Left: Medal + Name */}
              <div className="flex items-center gap-2">
                {/* Medal */}
                <span className="text-2xl">{medals[index]}</span>

                {/* Member Info */}
                <div>
                  <p className="text-xs font-bold text-slate-800">{member.name}</p>
                  <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
              </div>

              {/* Right: Score */}
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">
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
 * @typedef {Object} TopPerformersCardProps
 * @property {Array<Performer>} [performers=[]] - Array of top performers sorted by quality
 * @property {string} [title="Top Performers"] - Card title
 * @property {string} [icon="🏆"] - Icon to display next to title
 * @property {string} [subtitle="Quality Champion"] - Subtitle shown under each member name
 * @property {function} [onSelectMember] - Callback when a member is clicked
 * @property {number} [maxDisplay=3] - Maximum number of performers to display
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} Performer
 * @property {string} name - Member name
 * @property {string|number} avgQuality - Average quality score (formatted)
 */
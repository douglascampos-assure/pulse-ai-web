/**
 * KPICard Component
 * 
 * A reusable card component for displaying Key Performance Indicators (KPIs).
 * Shows a metric with an icon, label, value, and optional comparison with team average.
 * Commonly used for displaying participation, camera usage, quality scores, etc.
 * 
 * @component
 * @example
 * ```jsx
 * <KPICard
 *   label="Participation"
 *   value="85.5"
 *   unit="%"
 *   icon="🎤"
 *   badge={{ label: "Excellent", color: "bg-emerald-50 text-emerald-700 border-emerald-300" }}
 *   comparison={{ average: "72.3", isAbove: true, difference: "13.2" }}
 * />
 * ```
 */

export default function KPICard({
  label,
  value,
  unit = "",
  icon = "",
  badge = null,
  comparison = null,
  className = ""
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 border border-gray-200 ${className}`}>
      {/* Header: Label and Icon */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-600 font-medium">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>

      {/* Main Value */}
      <p className="text-2xl font-bold text-slate-800 mb-1">
        {value}
        <span className="text-sm text-slate-500">{unit}</span>
      </p>

      {/* Performance Badge */}
      {badge && (
        <div className={`inline-block px-2 py-0.5 rounded text-xs mb-2 font-semibold border ${badge.color}`}>
          {badge.label}
        </div>
      )}

      {/* Comparison with Team Average */}
      {comparison && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          {/* Team Average */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 font-medium">Team Avg:</span>
            <span className="text-slate-800 font-bold">
              {comparison.average}{unit}
            </span>
          </div>

          {/* Difference Badge */}
          <span 
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
              comparison.isAbove 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {comparison.isAbove ? '↑' : '↓'} {Math.abs(parseFloat(comparison.difference))}{unit} {comparison.isAbove ? 'above' : 'below'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} KPICardProps
 * @property {string} label - The label/name of the metric (e.g., "Participation")
 * @property {string|number} value - The main metric value to display
 * @property {string} [unit=""] - The unit of measurement (e.g., "%", "/10", "")
 * @property {string} [icon=""] - Emoji or icon to display next to the label
 * @property {Object} [badge=null] - Optional performance badge
 * @property {string} badge.label - Badge text (e.g., "Excellent", "Good")
 * @property {string} badge.color - Tailwind classes for badge styling
 * @property {Object} [comparison=null] - Optional comparison with team average
 * @property {string|number} comparison.average - Team average value
 * @property {boolean} comparison.isAbove - Whether value is above average
 * @property {string|number} comparison.difference - Difference from average
 * @property {string} [className=""] - Additional CSS classes
 */
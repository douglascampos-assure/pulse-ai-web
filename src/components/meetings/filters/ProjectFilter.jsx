/**
 * ProjectFilter Component
 * 
 * A reusable dropdown filter for selecting projects in the meetings analytics dashboard.
 * 
 * @component
 * @example
 * ```jsx
 * <ProjectFilter
 *   value={selectedProject}
 *   onChange={handleProjectChange}
 *   projects={['mdp-aftd-phf', 'aty-qrdo-sbz']}
 *   projectNames={{
 *     'mdp-aftd-phf': 'Communication AI',
 *     'aty-qrdo-sbz': 'Recruitment AI'
 *   }}
 * />
 * ```
 */

export default function ProjectFilter({
  value,
  onChange,
  projects = [],
  projectNames = {},
  disabled = false,
  className = ""
}) {
  /**
   * Handle project selection change
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
        htmlFor="project-filter"
        className="text-xs font-semibold text-slate-700 mb-1 block"
      >
        Project
      </label>

      {/* Select Dropdown */}
      <select
        id="project-filter"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {projects.map((projectId) => (
          <option key={projectId} value={projectId}>
            {projectNames[projectId] || projectId}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} ProjectFilterProps
 * @property {string} value - Currently selected project ID
 * @property {function} onChange - Callback function when project selection changes
 * @property {string[]} projects - Array of available project IDs
 * @property {Object} projectNames - Mapping of project IDs to display names
 * @property {boolean} [disabled=false] - Whether the filter is disabled
 * @property {string} [className=""] - Additional CSS classes
 */
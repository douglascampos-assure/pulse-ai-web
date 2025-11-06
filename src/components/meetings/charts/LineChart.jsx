/**
 * LineChart Component
 * 
 * A reusable SVG line chart for displaying average quality scores over time.
 * Shows data points with values, dates, and grid lines.
 * Commonly used for "Average Score per Meeting" visualization.
 * 
 * @component
 * @example
 * ```jsx
 * <LineChart
 *   data={projectHistory}
 *   title="Average Score per Meeting"
 *   dataKey="avgQuality"
 *   dateKey="date"
 *   height={288}
 *   color="#f59e0b"
 * />
 * ```
 */

export default function LineChart({
  data = [],
  title = "Average Score per Meeting",
  dataKey = "avgQuality",
  dateKey = "date",
  height = 288,
  color = "#f59e0b",
  maxValue = 10,
  className = ""
}) {
  /**
   * Format date to short readable format (e.g., "Oct 20")
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  /**
   * Generate Y-axis grid values based on max value
   * @returns {number[]} Array of grid values
   */
  const getGridValues = () => {
    const step = maxValue / 5;
    return Array.from({ length: 6 }, (_, i) => i * step);
  };

  const gridValues = getGridValues();

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 border border-gray-200 ${className}`}>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-lg">📈</span>
          {title}
        </h3>
        <div className="flex items-center justify-center h-72 text-slate-500 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border border-gray-200 ${className}`}>
      {/* Chart Title */}
      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span className="text-lg">📈</span>
        {title}
      </h3>

      {/* SVG Chart */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 800 240" className="w-full h-full">
          {/* Grid Lines with Y-axis Values */}
          {gridValues.map((val) => (
            <g key={val}>
              <line
                x1="60"
                y1={190 - (val * (180 / maxValue))}
                x2="780"
                y2={190 - (val * (180 / maxValue))}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x="45"
                y={195 - (val * (180 / maxValue))}
                fontSize="10"
                fill="#64748b"
                textAnchor="end"
              >
                {val.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Line Chart - Trend over time */}
          {data.length > 1 && (
            <polyline
              points={data.map((record, index) => {
                const x = 60 + (index * (720 / (data.length - 1)));
                const y = 190 - (parseFloat(record[dataKey]) * (180 / maxValue));
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points with Date Labels */}
          {data.map((record, index) => {
            const x = 60 + (index * (720 / Math.max(data.length - 1, 1)));
            const y = 190 - (parseFloat(record[dataKey]) * (180 / maxValue));
            
            return (
              <g key={index}>
                {/* Data Point Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                
                {/* Date Label */}
                <text
                  x={x}
                  y="210"
                  fontSize="11"
                  fill="#64748b"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {formatShortDate(record[dateKey])}
                </text>
              </g>
            );
          })}

          {/* Y-axis Label */}
          <text
            x="20"
            y="120"
            fontSize="11"
            fill="#475569"
            fontWeight="600"
            textAnchor="middle"
            transform="rotate(-90 20 120)"
          >
            Average Score
          </text>

          {/* X-axis Label */}
          <text
            x="420"
            y="235"
            fontSize="11"
            fill="#475569"
            fontWeight="600"
            textAnchor="middle"
          >
            Date
          </text>
        </svg>
      </div>
    </div>
  );
}

/**
 * PropTypes documentation
 * 
 * @typedef {Object} LineChartProps
 * @property {Array<Object>} data - Array of data objects to plot
 * @property {string} [title="Average Score per Meeting"] - Chart title
 * @property {string} [dataKey="avgQuality"] - Key name for Y-axis data values
 * @property {string} [dateKey="date"] - Key name for X-axis date values
 * @property {number} [height=288] - Chart height in pixels
 * @property {string} [color="#f59e0b"] - Line and point color (hex)
 * @property {number} [maxValue=10] - Maximum value for Y-axis scale
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} DataPoint
 * @property {string} date - ISO date string
 * @property {number} avgQuality - Quality score value
 */
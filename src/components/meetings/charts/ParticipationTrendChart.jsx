/**
 * ParticipationTrendChart Component
 * 
 * A reusable SVG line chart for displaying participation percentage trends over time.
 * Shows participation percentage (0-100%) for a team member across multiple meetings.
 * Displays data points with percentage values and meeting dates.
 * 
 * @component
 * @example
 * ```jsx
 * <ParticipationTrendChart
 *   data={memberHistory}
 *   title="Participation Trend"
 *   dataKey="speech_percentage"
 *   dateKey="meeting_date"
 * />
 * ```
 */

export default function ParticipationTrendChart({
  data = [],
  title = "Participation Trend",
  dataKey = "speech_percentage",
  dateKey = "meeting_date",
  height = 256,
  color = "#3b82f6",
  maxValue = 100,
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
   * Generate Y-axis grid values (0, 25, 50, 75, 100)
   * @returns {number[]} Array of grid values
   */
  const getGridValues = () => {
    return [0, 25, 50, 75, 100];
  };

  const gridValues = getGridValues();

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-3 border border-gray-200 ${className}`}>
        <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 border border-gray-200 ${className}`}>
      {/* Chart Title */}
      <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>

      {/* SVG Chart */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 500 230" className="w-full h-full">
          {/* Grid Lines with Y-axis Labels */}
          {gridValues.map((val) => (
            <g key={val}>
              <line 
                x1="60" 
                y1={180 - (val * 1.5)} 
                x2="480" 
                y2={180 - (val * 1.5)} 
                stroke="#e2e8f0" 
                strokeWidth="1" 
              />
              <text
                x="50"
                y={185 - (val * 1.5)}
                fontSize="10"
                fill="#64748b"
                textAnchor="end"
              >
                {val}%
              </text>
            </g>
          ))}

          {/* Y-axis Label */}
          <text
            x="15"
            y="110"
            fontSize="11"
            fill="#475569"
            fontWeight="600"
            textAnchor="middle"
            transform="rotate(-90 15 110)"
          >
            Participation %
          </text>

          {/* Line - Participation Trend */}
          {data.length > 1 && (
            <polyline
              points={data.map((record, index) => {
                const x = 60 + (index * (420 / (data.length - 1)));
                const y = 180 - (record[dataKey] * 1.5);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Data Points with Values */}
          {data.map((record, index) => {
            const x = 60 + (index * (420 / Math.max(data.length - 1, 1)));
            const y = 180 - (record[dataKey] * 1.5);
            
            return (
              <g key={index}>
                {/* Data Point Circle */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="4" 
                  fill={color} 
                  stroke="#fff" 
                  strokeWidth="2" 
                />
                
                {/* Percentage Value Label */}
                <text
                  x={x}
                  y={y - 8}
                  fontSize="9"
                  fill={color}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {record[dataKey]}%
                </text>
              </g>
            );
          })}

          {/* X-axis Labels - Meeting Dates */}
          {data.map((record, index) => {
            const x = 60 + (index * (420 / Math.max(data.length - 1, 1)));
            return (
              <text
                key={index}
                x={x}
                y="200"
                fontSize="10"
                fill="#64748b"
                fontWeight="500"
                textAnchor="middle"
              >
                {formatShortDate(record[dateKey])}
              </text>
            );
          })}

          {/* X-axis Label */}
          <text
            x="270"
            y="225"
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
 * @typedef {Object} ParticipationTrendChartProps
 * @property {Array<Object>} data - Array of participation data objects
 * @property {string} [title="Participation Trend"] - Chart title
 * @property {string} [dataKey="speech_percentage"] - Key name for participation percentage values
 * @property {string} [dateKey="meeting_date"] - Key name for date values
 * @property {number} [height=256] - Chart height in pixels
 * @property {string} [color="#3b82f6"] - Line and point color (hex)
 * @property {number} [maxValue=100] - Maximum value for Y-axis (typically 100 for percentages)
 * @property {string} [className=""] - Additional CSS classes
 * 
 * @typedef {Object} ParticipationDataPoint
 * @property {string} meeting_date - ISO date string of the meeting
 * @property {number} speech_percentage - Participation percentage (0-100)
 */
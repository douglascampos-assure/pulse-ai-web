"use client";

export default function MiniMetricChart({ data, color = "#ef4444", metricName = "Error Rate" }) {
  if (!data || data.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-center py-8 text-sm text-slate-400">
          <div className="text-3xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Si solo hay un punto, mostrar vista simplificada
  if (data.length === 1) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-center py-6">
          <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-xl" 
               style={{ backgroundColor: `${color}08`, border: `2px solid ${color}30` }}>
            <span className="text-xs font-semibold text-slate-600">{data[0].label}</span>
            <span className="text-2xl font-bold" style={{ color }}>{data[0].value.toFixed(2)}%</span>
            <span className="text-xs text-slate-500">{metricName}</span>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;
  
  const chartHeight = 100;
  const chartWidth = 100;
  const padding = 12;
  const plotHeight = chartHeight - padding * 2;
  const plotWidth = chartWidth - padding * 2;

  // Calcular posiciones de los puntos
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * plotWidth;
    const y = padding + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { x, y, ...point };
  });

  // Crear el path de la línea
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  // Crear área debajo de la línea
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  // Calcular tendencia
  const trend = data.length > 1 ? data[data.length - 1].value - data[0].value : 0;

  return (
    <div className="mt-5 pt-5 border-t border-gray-200">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {metricName} Trend
          </h4>
        </div>
        
        {/* Trend Badge */}
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trend < 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <span>{trend < 0 ? '↓' : '↑'}</span>
            <span>{Math.abs(trend).toFixed(2)}%</span>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ height: "110px" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines - horizontal */}
          {[0, 0.5, 1].map((fraction, i) => {
            const y = padding + plotHeight * (1 - fraction);
            const value = minValue + valueRange * fraction;
            return (
              <g key={`h-${i}`}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 2}
                  y={y + 1}
                  fontSize="3.5"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  {value.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Grid lines - vertical */}
          {points.map((point, i) => (
            <line
              key={`v-${i}`}
              x1={point.x}
              y1={padding}
              x2={point.x}
              y2={chartHeight - padding}
              stroke="#f1f5f9"
              strokeWidth="0.2"
            />
          ))}

          {/* Área con gradiente */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>

          <path
            d={areaPath}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />

          {/* Línea principal */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Puntos */}
          {points.map((point, index) => (
            <g key={index} className="cursor-pointer">
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color}
                opacity="0.2"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="white"
                stroke={color}
                strokeWidth="1.5"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="0.8"
                fill={color}
              />
              <title>{`${point.label}: ${point.value.toFixed(2)}% ${metricName.toLowerCase()}`}</title>
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-3 px-2">
          {points.map((point, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-[11px] font-bold text-slate-700">
                {point.label}
              </div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color }}>
                {point.value.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
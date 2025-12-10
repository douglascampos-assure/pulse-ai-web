"use client";

export default function MetricChart({ data, metricName, title, color = "#ef4444" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">No data available for this metric</p>
      </div>
    );
  }

  // Si solo hay un punto, mostrar vista simplificada
  if (data.length === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-slate-700 px-4 py-3">
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-slate-600 mb-2">{data[0].label}</p>
          <p className="text-4xl font-bold" style={{ color }}>{data[0].value}</p>
          <p className="text-xs text-slate-500 mt-2">{metricName}</p>
        </div>
      </div>
    );
  }

  // Encontrar el valor máximo para escalar el gráfico
  const maxValue = Math.max(...data.map(d => d.value), 1); // Mínimo 1 para evitar división por 0
  const chartHeight = 200;
  const chartWidth = 100;

  // Calcular posiciones de los puntos
  const points = data.map((point, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((point.value / maxValue) * (chartHeight * 0.9)); // 90% del alto para dejar margen
    return { x, y, ...point };
  });

  // Crear el path de la línea
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-slate-700 px-4 py-3">
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      
      <div className="p-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ height: "250px" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
            const y = chartHeight * (1 - fraction);
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.2"
              />
            );
          })}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={color}
              />
              <title>{`${point.label}: ${point.value} errors`}</title>
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-3 text-xs text-slate-600">
          {points.map((point, index) => (
            <div 
              key={index} 
              className="text-center flex-1"
            >
              <div className="font-semibold">{point.label}</div>
              <div className="text-slate-500">{point.value} errors</div>
            </div>
          ))}
        </div>

        {/* Y-axis info */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Max: {maxValue} errors</span>
          <span>Metric: {metricName}</span>
        </div>
      </div>
    </div>
  );
}
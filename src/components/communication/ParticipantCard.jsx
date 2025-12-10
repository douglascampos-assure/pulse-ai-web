import MiniMetricChart from './MiniMetricChart';

export default function TeamMetricsCards({ participants }) {
  const totalUtterances = participants.reduce((sum, p) => sum + (p.utterances_analyzed || 0), 0);
  const avgGrammarScore = participants.length > 0
    ? Math.round(participants.reduce((sum, p) => sum + (p.avg_grammar_score || 0), 0) / participants.length)
    : 0;

  // Función para calcular error rate por fecha
  const getErrorRateByDate = () => {
    // Agrupar por meeting_date
    const dateMap = new Map();
    
    participants.forEach(p => {
      const date = p.meeting_date;
      if (!date) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          totalErrors: 0,
          totalWords: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.totalErrors += p.total_errors || 0;
      dateData.totalWords += p.total_words || 0;
    });

    // Convertir a formato para el chart
    const chartData = Array.from(dateMap.entries()).map(([date, data]) => {
      const errorRate = data.totalWords > 0 
        ? (data.totalErrors / data.totalWords) * 100 
        : 0;
      
      return {
        label: formatDate(date),
        value: errorRate,
        rawDate: date
      };
    });

    // Ordenar por fecha
    return chartData.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };

  // Formatear fecha: "2025-10-20" -> "Oct 20"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const grammarChartData = getErrorRateByDate();
  
  // Para Pronunciation y Fluency, por ahora vacío
  const pronunciationChartData = [];
  const fluencyChartData = [];

  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 70) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const grammarColor = getScoreColor(avgGrammarScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Grammar Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Grammar</p>
          <span className="text-xl">📝</span>
        </div>
        <p className="text-4xl font-bold" style={{ color: grammarColor }}>
          {avgGrammarScore}<span className="text-lg text-slate-400">/100</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block w-2 h-2 rounded-full`} style={{ backgroundColor: grammarColor }}></span>
          <p className="text-xs font-semibold" style={{ color: grammarColor }}>
            {avgGrammarScore >= 90 ? '✅ Good' : avgGrammarScore >= 70 ? '🟦 Fair' : avgGrammarScore >= 50 ? '⚠️ Needs Work' : '❌ Poor'}
          </p>
        </div>
        
        <MiniMetricChart data={grammarChartData} color="#ef4444" metricName="Error Rate" />
      </div>

      {/* Pronunciation Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Pronunciation</p>
          <span className="text-xl">🗣️</span>
        </div>
        <p className="text-3xl font-bold text-slate-300">Coming Soon</p>
        <p className="text-xs text-slate-400 mt-1">In development</p>
        
        <MiniMetricChart data={pronunciationChartData} color="#8b5cf6" metricName="Issues" />
      </div>

      {/* Fluency Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Fluency</p>
          <span className="text-xl">⚡</span>
        </div>
        <p className="text-3xl font-bold text-slate-300">Coming Soon</p>
        <p className="text-xs text-slate-400 mt-1">In development</p>
        
        <MiniMetricChart data={fluencyChartData} color="#f59e0b" metricName="Issues" />
      </div>

      {/* Team Size Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Team Size</p>
          <span className="text-xl">👥</span>
        </div>
        <p className="text-4xl font-bold text-slate-700">
          {new Set(participants.map(p => p.participant_name)).size}
        </p>
        <p className="text-xs text-slate-500 mt-1">Active members</p>
      </div>
    </div>
  );
}
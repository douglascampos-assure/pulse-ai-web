import MiniMetricChart from './MiniMetricChart';

export default function TeamMetricsCards({ 
  englishParticipants,      // ✅ NEW: English Assessment from Gold
  grammarParticipants,      // ✅ Grammar Analysis from Gold
  englishTeamStats,         // ✅ NEW: English team statistics
  grammarTeamStats          // ✅ Grammar team statistics
}) {
  
  // ==========================================
  // ENGLISH ASSESSMENT METRICS
  // ==========================================
  
  const avgOverallEnglishScore = englishTeamStats?.avg_overall_score || 0;
  const avgPronunciationScore = englishTeamStats?.avg_pronunciation || 0;
  const avgFluencyScore = englishTeamStats?.avg_fluency || 0;
  const avgVocabularyScore = englishTeamStats?.avg_vocabulary || 0;

  // ==========================================
  // GRAMMAR METRICS
  // ==========================================
  
  const avgGrammarScore = grammarTeamStats?.avg_grammar_score || 0;
  const totalGrammarErrors = grammarTeamStats?.total_grammar_errors || 0;
  const totalWords = grammarTeamStats?.total_words_analyzed || 0;
  const avgErrorRate = grammarTeamStats?.avg_error_rate || 0;

  // ==========================================
  // CHART DATA - ENGLISH SCORES BY DATE
  // ==========================================
  
  const getPronunciationScoreByDate = () => {
    const dateMap = new Map();
    
    englishParticipants.forEach(p => {
      const date = p.meeting_date;
      if (!date) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          totalScore: 0,
          count: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.totalScore += p.pronunciation_score || 0;
      dateData.count += 1;
    });

    const chartData = Array.from(dateMap.entries()).map(([date, data]) => {
      return {
        label: formatDate(date),
        value: data.count > 0 ? data.totalScore / data.count : 0,
        rawDate: date
      };
    });

    return chartData.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };

  const getFluencyScoreByDate = () => {
    const dateMap = new Map();
    
    englishParticipants.forEach(p => {
      const date = p.meeting_date;
      if (!date) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          totalScore: 0,
          count: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.totalScore += p.fluency_score || 0;
      dateData.count += 1;
    });

    const chartData = Array.from(dateMap.entries()).map(([date, data]) => {
      return {
        label: formatDate(date),
        value: data.count > 0 ? data.totalScore / data.count : 0,
        rawDate: date
      };
    });

    return chartData.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };

  const getGrammarScoreByDate = () => {
    const dateMap = new Map();
    
    grammarParticipants.forEach(p => {
      const date = p.meeting_date;
      if (!date) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          totalScore: 0,
          count: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.totalScore += p.grammar_score || 0;
      dateData.count += 1;
    });

    const chartData = Array.from(dateMap.entries()).map(([date, data]) => {
      return {
        label: formatDate(date),
        value: data.count > 0 ? data.totalScore / data.count : 0,
        rawDate: date
      };
    });

    return chartData.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };

  const getVocabularyScoreByDate = () => {
    const dateMap = new Map();
    
    englishParticipants.forEach(p => {
      const date = p.meeting_date;
      if (!date) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          totalScore: 0,
          count: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.totalScore += p.vocabulary_score || 0;
      dateData.count += 1;
    });

    const chartData = Array.from(dateMap.entries()).map(([date, data]) => {
      return {
        label: formatDate(date),
        value: data.count > 0 ? data.totalScore / data.count : 0,
        rawDate: date
      };
    });

    return chartData.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const pronunciationChartData = getPronunciationScoreByDate();
  const fluencyChartData = getFluencyScoreByDate();
  const grammarChartData = getGrammarScoreByDate();
  const vocabularyChartData = getVocabularyScoreByDate();

  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 75) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return '✅ Excellent';
    if (score >= 75) return '🟦 Good';
    if (score >= 60) return '⚠️ Fair';
    return '❌ Needs Work';
  };

  const pronunciationColor = getScoreColor(avgPronunciationScore);
  const fluencyColor = getScoreColor(avgFluencyScore);
  const grammarColor = getScoreColor(avgGrammarScore);
  const vocabularyColor = getScoreColor(avgVocabularyScore);
  
  // Team size
  const uniqueEnglishParticipants = new Set(englishParticipants.map(p => p.participant_name)).size;
  const uniqueGrammarParticipants = new Set(grammarParticipants.map(p => p.participant_name)).size;
  const totalParticipants = Math.max(uniqueEnglishParticipants, uniqueGrammarParticipants);
  
  // Total audio segments analyzed
  const totalAudioSegments = englishParticipants.reduce(
    (sum, p) => sum + (p.number_of_audio_segments || 0), 
    0
  );
  
  // Avg errors per person
  const avgErrorsPerPerson = uniqueGrammarParticipants > 0 
    ? (totalGrammarErrors / uniqueGrammarParticipants).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Pronunciation Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Pronunciation</p>
          <span className="text-xl">🗣️</span>
        </div>
        <p className="text-4xl font-bold" style={{ color: pronunciationColor }}>
          {avgPronunciationScore.toFixed(1)}<span className="text-lg text-slate-400">/100</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block w-2 h-2 rounded-full`} style={{ backgroundColor: pronunciationColor }}></span>
          <p className="text-xs font-semibold" style={{ color: pronunciationColor }}>
            {getScoreLabel(avgPronunciationScore)}
          </p>
        </div>
        
        <MiniMetricChart data={pronunciationChartData} color="#8b5cf6" metricName="Score" />
      </div>

      {/* Fluency Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Fluency</p>
          <span className="text-xl">💬</span>
        </div>
        <p className="text-4xl font-bold" style={{ color: fluencyColor }}>
          {avgFluencyScore.toFixed(1)}<span className="text-lg text-slate-400">/100</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block w-2 h-2 rounded-full`} style={{ backgroundColor: fluencyColor }}></span>
          <p className="text-xs font-semibold" style={{ color: fluencyColor }}>
            {getScoreLabel(avgFluencyScore)}
          </p>
        </div>
        
        <MiniMetricChart data={fluencyChartData} color="#3b82f6" metricName="Score" />
      </div>

      {/* Grammar Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Grammar</p>
          <span className="text-xl">📝</span>
        </div>
        <p className="text-4xl font-bold" style={{ color: grammarColor }}>
          {avgGrammarScore.toFixed(1)}<span className="text-lg text-slate-400">/100</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block w-2 h-2 rounded-full`} style={{ backgroundColor: grammarColor }}></span>
          <p className="text-xs font-semibold" style={{ color: grammarColor }}>
            {getScoreLabel(avgGrammarScore)}
          </p>
        </div>
        
        <MiniMetricChart data={grammarChartData} color="#ef4444" metricName="Score" />
      </div>

      {/* Vocabulary Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600 font-medium">Vocabulary</p>
          <span className="text-xl">📚</span>
        </div>
        <p className="text-4xl font-bold" style={{ color: vocabularyColor }}>
          {avgVocabularyScore.toFixed(1)}<span className="text-lg text-slate-400">/100</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block w-2 h-2 rounded-full`} style={{ backgroundColor: vocabularyColor }}></span>
          <p className="text-xs font-semibold" style={{ color: vocabularyColor }}>
            {getScoreLabel(avgVocabularyScore)}
          </p>
        </div>
        
        <MiniMetricChart data={vocabularyChartData} color="#10b981" metricName="Score" />
      </div>

      {/* Team Statistics Summary - SIN CEFR DISTRIBUTION */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">📊 Team Statistics</h3>
          <span className="text-xl">👥</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Team Size</p>
            <p className="text-2xl font-bold text-slate-700">{totalParticipants}</p>
            <p className="text-xs text-slate-500">members</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Audio Segments</p>
            <p className="text-2xl font-bold text-blue-700">{totalAudioSegments}</p>
            <p className="text-xs text-blue-500">analyzed</p>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 mb-1">Total Errors</p>
            <p className="text-2xl font-bold text-red-600">{totalGrammarErrors}</p>
            <p className="text-xs text-red-500">detected</p>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 mb-1">Error Rate</p>
            <p className="text-2xl font-bold text-orange-600">{avgErrorRate.toFixed(2)}%</p>
            <p className="text-xs text-orange-500">average</p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">Errors/Person</p>
            <p className="text-2xl font-bold text-purple-600">{avgErrorsPerPerson}</p>
            <p className="text-xs text-purple-500">average</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 mb-1">Overall Score</p>
            <p className="text-2xl font-bold text-green-600">{avgOverallEnglishScore.toFixed(1)}</p>
            <p className="text-xs text-green-500">team avg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
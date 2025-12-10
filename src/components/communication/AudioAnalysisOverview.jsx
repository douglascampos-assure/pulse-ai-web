export default function AudioAnalysisOverview({ participants, teamStats, onSelectParticipant }) {
  if (!participants || participants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No Audio Analysis Data
        </h3>
        <p className="text-slate-600">
          Audio analysis data will appear here once meetings are processed.
        </p>
      </div>
    );
  }

  // Filtrar moderadores
  const regularParticipants = participants.filter(p => !p.is_moderator);
  const moderators = participants.filter(p => p.is_moderator);

  // Top 5 performers
  const topPerformers = [...regularParticipants]
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 5);

  // Calcular promedios
  const avgOverall = regularParticipants.length > 0
    ? Math.round(regularParticipants.reduce((sum, p) => sum + p.overall_score, 0) / regularParticipants.length)
    : 0;

  const avgFluency = regularParticipants.length > 0
    ? Math.round(regularParticipants.reduce((sum, p) => sum + p.fluency_score, 0) / regularParticipants.length)
    : 0;

  const avgClarity = regularParticipants.length > 0
    ? Math.round(regularParticipants.reduce((sum, p) => sum + p.clarity_score, 0) / regularParticipants.length)
    : 0;

  const avgIntonation = regularParticipants.length > 0
    ? Math.round(regularParticipants.reduce((sum, p) => sum + p.intonation_score, 0) / regularParticipants.length)
    : 0;

  // Categorías de performance
  const performanceCategories = regularParticipants.reduce((acc, p) => {
    acc[p.performance_category] = (acc[p.performance_category] || 0) + 1;
    return acc;
  }, {});

  const getCategoryColor = (category) => {
    switch (category) {
      case "Excellent": return "bg-green-100 text-green-800 border-green-200";
      case "Good": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fair": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Needs Improvement": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Overall Average</div>
          <div className={`text-3xl font-bold ${getScoreColor(avgOverall)}`}>
            {avgOverall}/100
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Avg Fluency</div>
          <div className={`text-3xl font-bold ${getScoreColor(avgFluency)}`}>
            {avgFluency}/100
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Avg Clarity</div>
          <div className={`text-3xl font-bold ${getScoreColor(avgClarity)}`}>
            {avgClarity}/100
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Avg Intonation</div>
          <div className={`text-3xl font-bold ${getScoreColor(avgIntonation)}`}>
            {avgIntonation}/100
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          📊 Performance Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(performanceCategories).map(([category, count]) => (
            <div
              key={category}
              className={`p-4 rounded-lg border ${getCategoryColor(category)}`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm font-medium">{category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          🌟 Top 5 Performers
        </h3>
        <div className="space-y-3">
          {topPerformers.map((participant, index) => (
            <div
              key={participant.participant_name}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              onClick={() => onSelectParticipant(participant.participant_name)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-slate-400">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {participant.participant_name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {participant.performance_category} • {participant.speech_rate_wpm} wpm
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(participant.overall_score)}`}>
                  {participant.overall_score}
                </div>
                <div className="text-xs text-slate-600">Overall</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Participants Table */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          👥 All Participants
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Overall</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Fluency</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Clarity</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Intonation</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">WPM</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
              </tr>
            </thead>
            <tbody>
              {regularParticipants
                .sort((a, b) => b.overall_score - a.overall_score)
                .map((participant) => (
                  <tr
                    key={participant.participant_name}
                    className="border-b border-gray-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onSelectParticipant(participant.participant_name)}
                  >
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {participant.participant_name}
                    </td>
                    <td className={`text-center py-3 px-4 font-bold ${getScoreColor(participant.overall_score)}`}>
                      {participant.overall_score}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-700">
                      {participant.fluency_score}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-700">
                      {participant.clarity_score}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-700">
                      {participant.intonation_score}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-700">
                      {participant.speech_rate_wpm}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(participant.performance_category)}`}>
                        {participant.performance_category}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderators (if any) */}
      {moderators.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            🎤 Meeting Moderators
          </h4>
          <div className="flex flex-wrap gap-2">
            {moderators.map((mod) => (
              <span
                key={mod.participant_name}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200"
                onClick={() => onSelectParticipant(mod.participant_name)}
              >
                {mod.participant_name} ({mod.overall_score}/100)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
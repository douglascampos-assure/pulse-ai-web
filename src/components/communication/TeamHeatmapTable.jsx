export default function TeamHeatmapTable({ participants, onSelectParticipant }) {
  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 75) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-slate-700 px-4 py-3">
        <h3 className="text-sm font-bold text-white">📊 Team Communication Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-700 uppercase sticky left-0 bg-slate-50 z-10">
                Name
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Overall Score
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Pronunciation
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Fluency
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Grammar
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Vocabulary
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Total Errors
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700 uppercase">
                Error Rate
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-700 uppercase">
                Top Errors
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.map((p, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelectParticipant(p.participant_name)}
              >
                {/* Name - Sticky column */}
                <td className="px-4 py-3 sticky left-0 bg-white hover:bg-slate-50 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                      {p.participant_name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {p.display_name || p.participant_name}
                      </div>
                      {p.job_title && (
                        <div className="text-xs text-slate-500">{p.job_title}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Overall English Score */}
                <td className="px-4 py-3 text-center">
                  <div
                    className="font-bold text-xl"
                    style={{ color: getScoreColor(p.overall_english_score) }}
                  >
                    {p.overall_english_score?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.number_of_audio_segments || 0} segments
                  </div>
                </td>

                {/* Pronunciation */}
                <td className="px-4 py-3 text-center">
                  <div
                    className="font-semibold text-base"
                    style={{ color: getScoreColor(p.pronunciation_score) }}
                  >
                    {p.pronunciation_score?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${p.pronunciation_score || 0}%`,
                        backgroundColor: getScoreColor(p.pronunciation_score)
                      }}
                    />
                  </div>
                </td>

                {/* Fluency */}
                <td className="px-4 py-3 text-center">
                  <div
                    className="font-semibold text-base"
                    style={{ color: getScoreColor(p.fluency_score) }}
                  >
                    {p.fluency_score?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${p.fluency_score || 0}%`,
                        backgroundColor: getScoreColor(p.fluency_score)
                      }}
                    />
                  </div>
                </td>

                {/* Grammar */}
                <td className="px-4 py-3 text-center">
                  <div
                    className="font-semibold text-base"
                    style={{ color: getScoreColor(p.grammar_score) }}
                  >
                    {p.grammar_score?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${p.grammar_score || 0}%`,
                        backgroundColor: getScoreColor(p.grammar_score)
                      }}
                    />
                  </div>
                </td>

                {/* Vocabulary */}
                <td className="px-4 py-3 text-center">
                  <div
                    className="font-semibold text-base"
                    style={{ color: getScoreColor(p.vocabulary_score_english) }}
                  >
                    {p.vocabulary_score_english?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${p.vocabulary_score_english || 0}%`,
                        backgroundColor: getScoreColor(p.vocabulary_score_english)
                      }}
                    />
                  </div>
                </td>

                {/* Total Errors */}
                <td className="px-4 py-3 text-center">
                  <div className={`font-bold text-lg ${p.total_grammar_errors > 10 ? 'text-red-600' : p.total_grammar_errors > 5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {p.total_grammar_errors || 0}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.utterances_analyzed || 0} utterances
                  </div>
                </td>

                {/* Error Rate */}
                <td className="px-4 py-3 text-center">
                  <div className={`font-bold text-base ${parseFloat(p.error_rate) > 3 ? 'text-red-600' : parseFloat(p.error_rate) > 1.5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {p.error_rate || '0.00'}%
                  </div>
                  <div className="text-xs text-slate-500">
                    per {p.total_words || 0} words
                  </div>
                </td>

                {/* Top Error Types */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {/* Show top 3 error types based on counts */}
                    {[
                      { type: 'Verb Tense', count: p.verb_tense_errors || 0 },
                      { type: 'S-V Agreement', count: p.subject_verb_errors || 0 },
                      { type: 'Articles', count: p.article_errors || 0 },
                      { type: 'Prepositions', count: p.preposition_errors || 0 },
                      { type: 'Plurals', count: p.plural_errors || 0 }
                    ]
                      .filter(e => e.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .map((error, i) => (
                        <span
                          key={i}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium"
                        >
                          {error.type}: {error.count}
                        </span>
                      ))}
                    {p.total_grammar_errors === 0 && (
                      <span className="text-xs text-green-600 font-semibold">✅ No errors</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend - SIMPLIFICADO */}
      <div className="bg-slate-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Score Colors:</span>
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></span>
              <span className="text-slate-600">Excellent (90+)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></span>
              <span className="text-slate-600">Good (75-89)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></span>
              <span className="text-slate-600">Developing (60-74)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></span>
              <span className="text-slate-600">Needs Support (&lt;60)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
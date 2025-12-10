import TeamMetricsCards from './TeamMetricsCards';
import TeamHeatmapTable from './TeamHeatmapTable';

export default function TeamOverview({ 
  englishParticipants,      // ✅ NEW: English Assessment from Gold
  grammarParticipants,       // ✅ Grammar Analysis from Gold (aggregated)
  englishTeamStats,          // ✅ NEW: English team statistics
  grammarTeamStats,          // ✅ Grammar team statistics
  onSelectParticipant 
}) {
  
  // ==========================================
  // AGGREGATION FUNCTION - Combine multiple meetings per participant
  // ==========================================
  
  const aggregateByParticipant = (participants, isEnglish = false) => {
    const participantMap = new Map();

    participants.forEach(p => {
      const name = p.participant_name;
      
      if (!participantMap.has(name)) {
        // Primera entrada para este participante
        participantMap.set(name, {
          participant_name: name,
          display_name: p.display_name || name,
          department: p.department,
          job_title: p.job_title,
          
          // Acumuladores para promedios
          count: 1,
          
          // English metrics (si aplica)
          ...(isEnglish && {
            overall_english_score_sum: p.overall_english_score || 0,
            pronunciation_score_sum: p.pronunciation_score || 0,
            fluency_score_sum: p.fluency_score || 0,
            grammar_score_english_sum: p.grammar_score || 0,
            vocabulary_score_english_sum: p.vocabulary_score || 0,
            number_of_audio_segments: p.number_of_audio_segments || 0,
            immediate_focus: p.immediate_focus
          }),
          
          // Grammar metrics (si aplica)
          ...(!isEnglish && {
            grammar_score_sum: p.grammar_score || 0,
            total_grammar_errors: p.total_grammar_errors || 0,
            total_vocabulary_issues: p.total_vocabulary_issues || 0,
            total_words: p.total_words || 0,
            verb_tense_errors: p.verb_tense_errors || 0,
            subject_verb_errors: p.subject_verb_errors || 0,
            article_errors: p.article_errors || 0,
            preposition_errors: p.preposition_errors || 0,
            plural_errors: p.plural_errors || 0,
            utterances_analyzed: p.utterances_analyzed || 0,
            personalized_recommendations: p.personalized_recommendations,
            priority_focus_areas: p.priority_focus_areas
          })
        });
      } else {
        // Ya existe, acumular valores
        const existing = participantMap.get(name);
        existing.count += 1;
        
        if (isEnglish) {
          existing.overall_english_score_sum += p.overall_english_score || 0;
          existing.pronunciation_score_sum += p.pronunciation_score || 0;
          existing.fluency_score_sum += p.fluency_score || 0;
          existing.grammar_score_english_sum += p.grammar_score || 0;
          existing.vocabulary_score_english_sum += p.vocabulary_score || 0;
          existing.number_of_audio_segments += p.number_of_audio_segments || 0;
          existing.immediate_focus = p.immediate_focus;
        } else {
          existing.grammar_score_sum += p.grammar_score || 0;
          existing.total_grammar_errors += p.total_grammar_errors || 0;
          existing.total_vocabulary_issues += p.total_vocabulary_issues || 0;
          existing.total_words += p.total_words || 0;
          existing.verb_tense_errors += p.verb_tense_errors || 0;
          existing.subject_verb_errors += p.subject_verb_errors || 0;
          existing.article_errors += p.article_errors || 0;
          existing.preposition_errors += p.preposition_errors || 0;
          existing.plural_errors += p.plural_errors || 0;
          existing.utterances_analyzed += p.utterances_analyzed || 0;
          existing.personalized_recommendations = p.personalized_recommendations;
          existing.priority_focus_areas = p.priority_focus_areas;
        }
      }
    });

    // Convertir Map a array y calcular promedios
    return Array.from(participantMap.values()).map(p => {
      if (isEnglish) {
        return {
          ...p,
          overall_english_score: p.overall_english_score_sum / p.count,
          pronunciation_score: p.pronunciation_score_sum / p.count,
          fluency_score: p.fluency_score_sum / p.count,
          grammar_score_english: p.grammar_score_english_sum / p.count,
          vocabulary_score_english: p.vocabulary_score_english_sum / p.count
        };
      } else {
        return {
          ...p,
          grammar_score: p.grammar_score_sum / p.count,
          error_rate: p.total_words > 0 
            ? ((p.total_grammar_errors / p.total_words) * 100).toFixed(2)
            : 0
        };
      }
    });
  };

  // ==========================================
  // AGGREGATE PARTICIPANTS (1 row per person)
  // ==========================================
  
  // Agregar English participants (promediar scores)
  const aggregatedEnglish = aggregateByParticipant(englishParticipants, true);

  // Agregar Grammar participants (sumar errors, promediar scores)
  const aggregatedGrammar = aggregateByParticipant(grammarParticipants, false);

  // Total errors across all participants (ya agregado)
  const totalGrammarErrors = aggregatedGrammar.reduce(
    (sum, p) => sum + (p.total_grammar_errors || 0), 
    0
  );

  // ==========================================
  // COMBINED TEAM OVERVIEW
  // ==========================================
  
  // Combinar ambos datasets
  const combinedParticipants = aggregatedEnglish.map(englishData => {
    const grammarData = aggregatedGrammar.find(
      g => g.participant_name === englishData.participant_name
    );

    return {
      // Identity
      participant_name: englishData.participant_name,
      display_name: englishData.display_name,
      department: englishData.department,
      job_title: englishData.job_title,
      
      // English Assessment (promediados)
      overall_english_score: englishData.overall_english_score,
      pronunciation_score: englishData.pronunciation_score,
      fluency_score: englishData.fluency_score,
      grammar_score_english: englishData.grammar_score_english,
      vocabulary_score_english: englishData.vocabulary_score_english,
      immediate_focus: englishData.immediate_focus,
      number_of_audio_segments: englishData.number_of_audio_segments,
      
      // Grammar Analysis (sumados/promediados)
      grammar_score: grammarData?.grammar_score || 0,
      total_grammar_errors: grammarData?.total_grammar_errors || 0,
      total_vocabulary_issues: grammarData?.total_vocabulary_issues || 0,
      total_words: grammarData?.total_words || 0,
      error_rate: grammarData?.error_rate || 0,
      
      // Error breakdown (sumados)
      verb_tense_errors: grammarData?.verb_tense_errors || 0,
      subject_verb_errors: grammarData?.subject_verb_errors || 0,
      article_errors: grammarData?.article_errors || 0,
      preposition_errors: grammarData?.preposition_errors || 0,
      plural_errors: grammarData?.plural_errors || 0,
      
      // Recommendations
      personalized_recommendations: grammarData?.personalized_recommendations,
      priority_focus_areas: grammarData?.priority_focus_areas,
      
      // Metadata (sumados)
      utterances_analyzed: grammarData?.utterances_analyzed || 0
    };
  }).sort((a, b) => b.overall_english_score - a.overall_english_score);

  // ==========================================
  // TOP ERROR TYPES (from aggregated data)
  // ==========================================
  
  const topErrorTypes = [
    { type: 'Verb Tense', count: aggregatedGrammar.reduce((s, p) => s + (p.verb_tense_errors || 0), 0) },
    { type: 'Subject-Verb Agreement', count: aggregatedGrammar.reduce((s, p) => s + (p.subject_verb_errors || 0), 0) },
    { type: 'Articles', count: aggregatedGrammar.reduce((s, p) => s + (p.article_errors || 0), 0) },
    { type: 'Prepositions', count: aggregatedGrammar.reduce((s, p) => s + (p.preposition_errors || 0), 0) },
    { type: 'Plurals', count: aggregatedGrammar.reduce((s, p) => s + (p.plural_errors || 0), 0) }
  ]
    .filter(e => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(e => ({
      ...e,
      percentage: totalGrammarErrors > 0 
        ? Math.round((e.count / totalGrammarErrors) * 100) 
        : 0
    }));

  return (
    <div className="space-y-3">
      {/* Team Metrics Cards - Pass aggregated data */}
      <TeamMetricsCards 
        englishParticipants={englishParticipants}        // ✅ CORRECTO - Datos originales con fechas
        grammarParticipants={grammarParticipants}        // ✅ CORRECTO - Datos originales con fechas
        englishTeamStats={englishTeamStats}
        grammarTeamStats={grammarTeamStats}
      />

      {/* Summary Stats - SIN "MOST COMMON CEFR" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Avg Communication Score</p>
          <p className="text-3xl font-bold text-blue-600">
            {englishTeamStats?.avg_overall_score?.toFixed(1) || 'N/A'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Overall team proficiency</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Total Grammar Errors</p>
          <p className="text-3xl font-bold text-red-600">{totalGrammarErrors}</p>
          <p className="text-xs text-slate-500 mt-1">Across all participants</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Last Analysis</p>
          <p className="text-xl font-bold text-slate-700">
            {new Date().toISOString().split('T')[0]}
          </p>
          <p className="text-xs text-slate-500 mt-1">Using Llama 3.3 70B</p>
        </div>
      </div>

      {/* Team's Most Common Grammar Errors */}
      {topErrorTypes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-slate-700 px-4 py-3">
            <h3 className="text-sm font-bold text-white">🎯 Team's Most Common Grammar Errors</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {topErrorTypes.map((error, idx) => (
                <div
                  key={idx}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <p className="text-sm font-bold text-red-800">{error.type}</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{error.count}</p>
                  <p className="text-xs text-red-600 mt-1">{error.percentage}% of errors</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Heatmap Table with Combined Data */}
      <TeamHeatmapTable 
        participants={combinedParticipants} 
        onSelectParticipant={onSelectParticipant} 
      />
    </div>
  );
}
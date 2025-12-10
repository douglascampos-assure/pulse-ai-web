import { useState, useEffect } from 'react';
import ScoreIndicator from './ScoreIndicator';

export default function IndividualAnalysis({ 
  englishParticipants,      // ✅ NEW: English Assessment from Gold
  grammarParticipants,      // ✅ Grammar Analysis from Gold (aggregated)
  selectedMember, 
  setSelectedMember,
  allMembers 
}) {
  // Estados para drill-down de errores detallados
  const [showDetailedErrors, setShowDetailedErrors] = useState(false);
  const [detailedErrors, setDetailedErrors] = useState([]);
  const [loadingErrors, setLoadingErrors] = useState(false);

  // Encontrar datos de English Assessment y Grammar para el miembro seleccionado
  const englishData = englishParticipants.find(p => p.participant_name === selectedMember);
  const grammarData = grammarParticipants.find(p => p.participant_name === selectedMember);

  // Si no hay miembro seleccionado, usar el primero disponible
  const currentMember = selectedMember || allMembers[0];

  // 🔄 Limpiar errores detallados cuando cambie de persona
  useEffect(() => {
    setShowDetailedErrors(false);
    setDetailedErrors([]);
  }, [currentMember]);
  
  if (!currentMember) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <p className="text-slate-600">No participant data available</p>
      </div>
    );
  }

  // Función para fetch de errores detallados desde Silver
  const fetchDetailedErrors = async () => {
    // Si ya tenemos errores cargados, solo toggle el display
    if (detailedErrors.length > 0) {
      setShowDetailedErrors(!showDetailedErrors);
      return;
    }
    
    setLoadingErrors(true);
    try {
      const response = await fetch(`/api/communication/errors?participant=${encodeURIComponent(currentMember)}`);
      const data = await response.json();
      
      if (data.errors) {
        // 🔄 Agrupar errores por utterance para evitar duplicados de contexto
        const groupedByUtterance = data.errors.reduce((acc, error) => {
          const key = `${error.meeting_id}-${error.utterance_text}`;
          if (!acc[key]) {
            acc[key] = {
              utterance_text: error.utterance_text,
              meeting_date: error.meeting_date,
              meeting_id: error.meeting_id,
              recording_id: error.recording_id,
              errors: []
            };
          }
          acc[key].errors.push({
            error_type: error.error_type,
            error_text: error.error_text,
            corrected_text: error.corrected_text,
            explanation: error.explanation
          });
          return acc;
        }, {});
        
        // Convertir a array y agregar IDs secuenciales
        const groupedErrors = Object.values(groupedByUtterance).map((group, idx) => ({
          ...group,
          utterance_id: idx + 1
        }));
        
        setDetailedErrors(groupedErrors);
        setShowDetailedErrors(true);
      }
    } catch (error) {
      console.error('Error fetching detailed errors:', error);
      alert('Failed to load detailed errors. Please try again.');
    } finally {
      setLoadingErrors(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 75) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getProgressColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getErrorTypeColor = (type) => {
    const colors = {
      'verb_tense': 'bg-red-500',
      'subject_verb': 'bg-orange-500',
      'article': 'bg-yellow-500',
      'preposition': 'bg-blue-500',
      'plural': 'bg-purple-500',
      'vocabulary': 'bg-pink-500',
      'spelling': 'bg-indigo-500',
      'unknown': 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-3">
      {/* Member Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Select Team Member
        </label>
        <select
          value={currentMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          {allMembers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Member Header - SIN BADGES DE CLASIFICACIÓN */}
      <div className="bg-slate-700 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {currentMember.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{englishData?.display_name || currentMember}</h2>
            <p className="text-slate-300 text-sm">
              {englishData?.department && englishData?.job_title 
                ? `${englishData.job_title} • ${englishData.department}`
                : 'Communication Skills Assessment'
              }
            </p>
          </div>
        </div>
      </div>

      {/* ========== ENGLISH ASSESSMENT SECTION ========== */}
      {englishData ? (
        <>
          {/* Overall English Score */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              🌍 English Communication Assessment
            </h3>

            {/* Overall Score Banner - SIN CLASIFICACIONES */}
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Overall Communication Score</p>
              <p className="text-5xl font-bold" style={{ color: getScoreColor(englishData.overall_english_score) }}>
                {englishData.overall_english_score.toFixed(1)}/100
              </p>
              <p className="text-xs text-slate-600 mt-3">
                Based on {englishData.number_of_audio_segments} conversation{englishData.number_of_audio_segments !== 1 ? 's' : ''} analyzed
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4 mb-6">
              {/* Pronunciation */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">🗣️ Pronunciation</span>
                  <span className="text-sm font-bold" style={{ color: getScoreColor(englishData.pronunciation_score) }}>
                    {englishData.pronunciation_score.toFixed(1)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(englishData.pronunciation_score)}`}
                    style={{ width: `${englishData.pronunciation_score}%` }}
                  />
                </div>
              </div>

              {/* Fluency */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">💬 Fluency</span>
                  <span className="text-sm font-bold" style={{ color: getScoreColor(englishData.fluency_score) }}>
                    {englishData.fluency_score.toFixed(1)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(englishData.fluency_score)}`}
                    style={{ width: `${englishData.fluency_score}%` }}
                  />
                </div>
              </div>

              {/* Grammar (from English Assessment) */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">📝 Grammar</span>
                  <span className="text-sm font-bold" style={{ color: getScoreColor(englishData.grammar_score) }}>
                    {englishData.grammar_score.toFixed(1)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(englishData.grammar_score)}`}
                    style={{ width: `${englishData.grammar_score}%` }}
                  />
                </div>
              </div>

              {/* Vocabulary */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">📚 Vocabulary</span>
                  <span className="text-sm font-bold" style={{ color: getScoreColor(englishData.vocabulary_score) }}>
                    {englishData.vocabulary_score.toFixed(1)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(englishData.vocabulary_score)}`}
                    style={{ width: `${englishData.vocabulary_score}%` }}
                  />
                </div>
              </div>

              {/* Communication (if available) */}
              {englishData.communication_score && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">💡 Communication</span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(englishData.communication_score) }}>
                      {englishData.communication_score.toFixed(1)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(englishData.communication_score)}`}
                      style={{ width: `${englishData.communication_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Personalized Recommendations (renamed from Immediate Focus) */}
            {englishData.immediate_focus && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Personalized Recommendations</h4>
                <p className="text-sm text-slate-700">{englishData.immediate_focus}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
          <p className="text-slate-500">No English assessment data available for this member</p>
        </div>
      )}

      {/* ========== GRAMMAR DETAILED ANALYSIS ========== */}
      {grammarData ? (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              📝 Grammar Detailed Analysis
            </h3>
            
            {/* Grammar Score Banner */}
            <div
              className="rounded-lg p-6 text-center mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${getScoreColor(grammarData.grammar_score)}15 0%, ${getScoreColor(grammarData.grammar_score)}05 100%)` 
              }}
            >
              <p className="text-5xl font-bold" style={{ color: getScoreColor(grammarData.grammar_score) }}>
                {grammarData.grammar_score.toFixed(1)}/100
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Grammar Score • {grammarData.utterances_analyzed} utterances analyzed
              </p>
            </div>

            {/* Error Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 mb-1">Grammar Errors</p>
                <p className="text-3xl font-bold text-red-600">{grammarData.total_grammar_errors}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-600 mb-1">Vocabulary Issues</p>
                <p className="text-3xl font-bold text-orange-600">{grammarData.total_vocabulary_issues}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Total Words</p>
                <p className="text-3xl font-bold text-slate-800">{grammarData.total_words}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-600 mb-1">Error Rate</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {((grammarData.total_grammar_errors / grammarData.total_words) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Error Type Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                🎯 Error Type Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-800">Verb Tense</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{grammarData.verb_tense_errors}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-800">Subject-Verb</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{grammarData.subject_verb_errors}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-800">Articles</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{grammarData.article_errors}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-800">Prepositions</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{grammarData.preposition_errors}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-800">Plurals</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{grammarData.plural_errors}</p>
                </div>
              </div>
            </div>

            {/* Scores Breakdown - SIN CEFR LEVELS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Vocabulary</p>
                <p className="text-2xl font-bold" style={{ color: getScoreColor(grammarData.vocabulary_score) }}>
                  {grammarData.vocabulary_score.toFixed(1)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Professionalism</p>
                <p className="text-2xl font-bold" style={{ color: getScoreColor(grammarData.professionalism_score) }}>
                  {grammarData.professionalism_score.toFixed(1)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Assertiveness</p>
                <p className="text-2xl font-bold" style={{ color: getScoreColor(grammarData.assertiveness_score) }}>
                  {grammarData.assertiveness_score.toFixed(1)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Overall Language</p>
                <p className="text-2xl font-bold" style={{ color: getScoreColor(grammarData.overall_language_score) }}>
                  {grammarData.overall_language_score.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Priority Focus Areas */}
            {grammarData.priority_focus_areas && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">⚡ Priority Focus Areas</h4>
                <div className="space-y-2">
                  {(() => {
                    try {
                      const parts = grammarData.priority_focus_areas.split(';').map(p => p.trim()).filter(p => p);
                      const allAreas = new Set();
                      
                      parts.forEach(part => {
                        try {
                          const areas = JSON.parse(part);
                          if (Array.isArray(areas)) {
                            areas.forEach(area => allAreas.add(area));
                          }
                        } catch (e) {
                          // Ignorar partes inválidas
                        }
                      });
                      
                      if (allAreas.size > 0) {
                        return Array.from(allAreas).map((area, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-orange-600 font-bold mt-0.5">{idx + 1}.</span>
                            <span className="text-slate-700 text-sm capitalize">{area}</span>
                          </div>
                        ));
                      }
                      
                      return <p className="text-sm text-slate-700">{grammarData.priority_focus_areas}</p>;
                    } catch (e) {
                      return <p className="text-sm text-slate-700">{grammarData.priority_focus_areas}</p>;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Personalized Recommendations */}
            {grammarData.personalized_recommendations && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Personalized Recommendations</h4>
                <div className="space-y-4">
                  {(() => {
                    try {
                      const parts = grammarData.personalized_recommendations.split(';').map(p => p.trim()).filter(p => p);
                      const allRecommendations = {};
                      
                      parts.forEach(part => {
                        try {
                          const recs = JSON.parse(part);
                          if (typeof recs === 'object' && !Array.isArray(recs)) {
                            Object.assign(allRecommendations, recs);
                          }
                        } catch (e) {
                          // Ignorar partes inválidas
                        }
                      });
                      
                      if (Object.keys(allRecommendations).length > 0) {
                        return Object.entries(allRecommendations)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([key, value], idx) => {
                            if (typeof value === 'object' && value.area) {
                              return (
                                <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase">
                                      {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800 capitalize">
                                      {value.area}
                                    </span>
                                  </div>
                                  
                                  {value.issue && (
                                    <p className="text-xs text-slate-600 mb-2">
                                      <span className="font-semibold">Issue:</span> {value.issue}
                                    </p>
                                  )}
                                  
                                  {value.examples && Array.isArray(value.examples) && value.examples.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold text-slate-700 mb-1">Examples:</p>
                                      <ul className="text-xs text-slate-600 space-y-1 ml-4">
                                        {value.examples.map((ex, i) => (
                                          <li key={i} className="list-disc">"{ex}"</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {value.study_topics && Array.isArray(value.study_topics) && value.study_topics.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold text-slate-700 mb-1">Study Topics:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {value.study_topics.map((topic, i) => (
                                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {value.practice_exercises && Array.isArray(value.practice_exercises) && value.practice_exercises.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold text-slate-700 mb-1">Practice Exercises:</p>
                                      <ul className="text-xs text-slate-600 space-y-1 ml-4">
                                        {value.practice_exercises.map((ex, i) => (
                                          <li key={i} className="list-disc">{ex}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {value.estimated_time && (
                                    <p className="text-xs text-slate-500 mt-2">
                                      <span className="font-semibold">Estimated Time:</span> {value.estimated_time}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          });
                      }
                      
                      return <p className="text-sm text-slate-700 whitespace-pre-line">{grammarData.personalized_recommendations}</p>;
                    } catch (e) {
                      return <p className="text-sm text-slate-700 whitespace-pre-line">{grammarData.personalized_recommendations}</p>;
                    }
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* ========== DRILL-DOWN: BOTÓN PARA VER ERRORES DETALLADOS ========== */}
          <div className="mt-6">
            <button
              onClick={fetchDetailedErrors}
              disabled={loadingErrors}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loadingErrors ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Loading errors...</span>
                </>
              ) : (
                <>
                  <span>{showDetailedErrors ? '🔼 Hide' : '🔍 View'} Detailed Errors</span>
                  {detailedErrors.length > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {detailedErrors.reduce((sum, utterance) => sum + (utterance?.errors?.length || 0), 0)} errors in {detailedErrors.length} utterances
                    </span>
                  )}
                </>
              )}
            </button>
          </div>

          {/* ========== SECCIÓN EXPANDIBLE DE ERRORES DETALLADOS ========== */}
          {showDetailedErrors && detailedErrors.length > 0 && (
            <div className="mt-6 border-t-2 border-red-200 pt-6">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    🔍 Detailed Error Analysis
                  </h3>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {detailedErrors.reduce((sum, utterance) => sum + (utterance?.errors?.length || 0), 0)} errors in {detailedErrors.length} utterances
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                  Utterance-by-utterance breakdown of grammar and vocabulary errors.
                </p>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {detailedErrors.map((utteranceGroup) => {
                    if (!utteranceGroup || !utteranceGroup.errors || utteranceGroup.errors.length === 0) {
                      return null;
                    }
                    
                    return (
                    <div 
                      key={utteranceGroup.utterance_id} 
                      className="bg-white rounded-lg p-5 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                        <span className="text-sm font-bold text-slate-700">
                          Utterance #{utteranceGroup.utterance_id}
                        </span>
                        {utteranceGroup.meeting_date && (
                          <span className="text-xs text-slate-500">
                            📅 {utteranceGroup.meeting_date.split('T')[0]}
                          </span>
                        )}
                        <span className="ml-auto bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          {utteranceGroup.errors.length} error{utteranceGroup.errors.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Context */}
                      <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1 font-semibold">📝 Full Context:</p>
                        <p className="text-sm text-slate-700 italic">
                          "{utteranceGroup.utterance_text}"
                        </p>
                      </div>

                      {/* Errors */}
                      <div className="space-y-3">
                        {utteranceGroup.errors.map((error, errorIdx) => (
                          <div 
                            key={errorIdx}
                            className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-slate-500">Error {errorIdx + 1}:</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getErrorTypeColor(error.error_type)}`}>
                                {error.error_type.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3 mb-3">
                              <div className="p-3 bg-red-100 rounded border border-red-300">
                                <p className="text-xs text-red-600 font-semibold mb-1">❌ Error:</p>
                                <p className="text-sm text-red-900 font-medium">
                                  {error.error_text}
                                </p>
                              </div>
                              <div className="p-3 bg-green-100 rounded border border-green-300">
                                <p className="text-xs text-green-600 font-semibold mb-1">✅ Correction:</p>
                                <p className="text-sm text-green-900 font-medium">
                                  {error.corrected_text}
                                </p>
                              </div>
                            </div>

                            {error.explanation && (
                              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold mb-1">💡 Explanation:</p>
                                <p className="text-sm text-slate-700">
                                  {error.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {utteranceGroup.meeting_id && (
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-400">
                            Meeting ID: <span className="font-mono">{utteranceGroup.meeting_id}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
          <p className="text-slate-500">No grammar analysis data available for this member</p>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
export default function AudioIndividualAnalysis({ participants, selectedMember, setSelectedMember }) {
  if (!participants || participants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No Audio Analysis Data
        </h3>
        <p className="text-slate-600">
          Select a participant to view their audio analysis.
        </p>
      </div>
    );
  }

  const selectedParticipant = participants.find(
    (p) => p.participant_name === selectedMember
  );

  if (!selectedParticipant) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          Participant Not Found
        </h3>
        <p className="text-slate-600">
          Please select a participant from the dropdown.
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Excellent": return "bg-green-100 text-green-800 border-green-200";
      case "Good": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fair": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Needs Improvement": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      {/* Participant Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Participant
        </label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          {participants.map((participant) => (
            <option key={participant.participant_name} value={participant.participant_name}>
              {participant.participant_name}
              {participant.is_moderator && " (Moderator)"}
              {" - "}
              {participant.overall_score}/100
            </option>
          ))}
        </select>
      </div>

      {/* Overall Summary Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedParticipant.participant_name}
              {selectedParticipant.is_moderator && (
                <span className="ml-3 text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  🎤 Moderator
                </span>
              )}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Analyzed on {formatDate(selectedParticipant.meeting_date)}
            </p>
          </div>
          <div className={`text-center px-6 py-3 rounded-lg border ${getCategoryColor(selectedParticipant.performance_category)}`}>
            <div className={`text-4xl font-bold ${getScoreColor(selectedParticipant.overall_score)}`}>
              {selectedParticipant.overall_score}
            </div>
            <div className="text-xs font-medium mt-1">
              {selectedParticipant.performance_category}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          📊 Score Breakdown
        </h3>
        <div className="space-y-4">
          {/* Fluency Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                💬 Fluency
              </span>
              <span className={`text-sm font-bold ${getScoreColor(selectedParticipant.fluency_score)}`}>
                {selectedParticipant.fluency_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(selectedParticipant.fluency_score)}`}
                style={{ width: `${selectedParticipant.fluency_score}%` }}
              />
            </div>
          </div>

          {/* Clarity Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                🎯 Clarity
              </span>
              <span className={`text-sm font-bold ${getScoreColor(selectedParticipant.clarity_score)}`}>
                {selectedParticipant.clarity_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(selectedParticipant.clarity_score)}`}
                style={{ width: `${selectedParticipant.clarity_score}%` }}
              />
            </div>
          </div>

          {/* Intonation Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                🎵 Intonation
              </span>
              <span className={`text-sm font-bold ${getScoreColor(selectedParticipant.intonation_score)}`}>
                {selectedParticipant.intonation_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(selectedParticipant.intonation_score)}`}
                style={{ width: `${selectedParticipant.intonation_score}%` }}
              />
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                💪 Confidence
              </span>
              <span className={`text-sm font-bold ${getScoreColor(selectedParticipant.confidence_score)}`}>
                {selectedParticipant.confidence_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(selectedParticipant.confidence_score)}`}
                style={{ width: `${selectedParticipant.confidence_score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Speaking Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Speech Rate</div>
          <div className="text-3xl font-bold text-slate-800">
            {selectedParticipant.speech_rate_wpm}
          </div>
          <div className="text-xs text-slate-500 mt-1">words per minute</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Total Pauses</div>
          <div className="text-3xl font-bold text-slate-800">
            {selectedParticipant.total_pauses}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            avg: {selectedParticipant.avg_pause_duration}s
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-slate-600 mb-1">Duration</div>
          <div className="text-3xl font-bold text-slate-800">
            {formatDuration(selectedParticipant.total_duration_sec)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {selectedParticipant.word_count} words
          </div>
        </div>
      </div>

      {/* Pitch & Tone */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          🎵 Pitch & Tone Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Pitch Variation</div>
            <div className="text-2xl font-bold text-slate-800">
              {selectedParticipant.pitch_variation}%
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Tone Quality</div>
            <div className="text-2xl font-bold text-slate-800">
              {selectedParticipant.is_monotone ? "⚠️ Monotone" : "✅ Varied"}
            </div>
          </div>
        </div>
      </div>

      {/* Filler Words */}
      {selectedParticipant.filler_words && selectedParticipant.filler_words.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            🗣️ Filler Words Detected ({selectedParticipant.filler_words_count} total)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedParticipant.filler_words.map((filler, index) => (
              <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-medium text-yellow-800">
                  "{filler.filler}"
                </div>
                <div className="text-xl font-bold text-yellow-900">
                  {filler.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {selectedParticipant.recommendations && selectedParticipant.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            💡 Personalized Recommendations
          </h3>
          <ul className="space-y-2">
            {selectedParticipant.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span className="text-slate-700 text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
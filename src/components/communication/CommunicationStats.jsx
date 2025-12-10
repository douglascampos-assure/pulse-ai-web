export default function CommunicationStats({ participants }) {
  const totalParticipants = participants.length;
  const averageScore = participants.length > 0 
    ? Math.round(participants.reduce((sum, p) => sum + p.avg_grammar_score, 0) / participants.length)
    : 0;
  const totalErrors = participants.reduce((sum, p) => sum + p.total_errors, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Participants</h3>
        <p className="text-4xl font-bold text-slate-700">{totalParticipants}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Average Score</h3>
        <p className="text-4xl font-bold text-slate-700">{averageScore}/100</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Errors</h3>
        <p className="text-4xl font-bold text-red-600">{totalErrors}</p>
      </div>
    </div>
  );
}
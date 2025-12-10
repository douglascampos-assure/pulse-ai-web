export default function CommunicationHeader({ totalParticipants, totalAudioAnalyzed = 0 }) {
  return (
    <header className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h1 className="text-3xl font-bold text-slate-800">
        English Communication Analysis
      </h1>
      <p className="text-slate-600 mt-2">
        Grammar & Pronunciation assessment powered by AI • 
        {totalParticipants > 0 && ` ${totalParticipants} grammar analyzed`}
        {totalAudioAnalyzed > 0 && ` • ${totalAudioAnalyzed} audio analyzed`}
      </p>
    </header>
  );
}
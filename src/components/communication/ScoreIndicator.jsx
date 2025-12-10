export default function ScoreIndicator({ score }) {
  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 70) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <span 
      className="text-3xl font-bold px-3 py-1 rounded"
      style={{ color: getScoreColor(score) }}
    >
      {score}/100
    </span>
  );
}
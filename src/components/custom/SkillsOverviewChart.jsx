"use client";
import { useEffect, useState, useMemo } from "react";

const COLORS = {
  positive: "#4CAF50",
  neutral: "#B0BEC5",
  negative: "#E57373",
  track: "#E6EEF3",
};

export default function SkillsOverviewChart({ team = "", employee = "", startDate = "", endDate = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team && !employee) {
      setData([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (team) params.append("team", team);
        if (employee) params.append("employee", employee);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const res = await fetch(`/api/charts/skills-overview?${params.toString()}`, { signal: controller.signal });
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Error loading skills overview:", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [team, employee, startDate, endDate]);

  const { sortedByCount, sortedByAvgScoreAsc, maxCount, top3Names, worst3Names } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { sortedByCount: [], sortedByAvgScoreAsc: [], maxCount: 1, top3Names: [], worst3Names: [] };
    }

    const sortedByCount = [...data].sort((a, b) => b.times_mentioned - a.times_mentioned);
    const sortedByAvgScoreAsc = [...data].sort((a, b) => (a.avg_score || 0) - (b.avg_score || 0));
    const top3Names = sortedByCount.slice(0, 3).map((d) => d.Skill_to_Improve);
    const worst3Names = sortedByAvgScoreAsc.slice(0, 3).map((d) => d.Skill_to_Improve);
    const maxCount = Math.max(...data.map((d) => d.times_mentioned), 1);

    return { sortedByCount, sortedByAvgScoreAsc, maxCount, top3Names, worst3Names };
  }, [data]);

  const getColorForSkill = (skillName) => {
    if (top3Names.includes(skillName)) return COLORS.positive;
    if (worst3Names.includes(skillName)) return COLORS.negative;
    return COLORS.neutral;
  };

  if (!team && !employee)
    return <div className="p-4 text-sm text-gray-500">Select a team o employee.</div>;

  if (loading)
    return <div className="p-4 text-sm text-gray-500">Loading skills...</div>;

  if (!data || data.length === 0)
    return <div className="p-4 text-sm text-gray-500">There is no skills data to display.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Skills Overview — Strengths & Improvement Areas</h3>
        <div className="text-sm text-gray-500">Metrics based on feedback count and average match score</div>
      </div>

      <div className="space-y-3">
        {sortedByCount.map((row) => {
          const pct = Math.round((row.times_mentioned / maxCount) * 100);
          const color = getColorForSkill(row.Skill_to_Improve);
          const isTop = top3Names.includes(row.Skill_to_Improve);
          const isWorst = worst3Names.includes(row.Skill_to_Improve);

          return (
            <div key={row.Skill_to_Improve} className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium truncate">{row.Skill_to_Improve}</div>
                    {isTop && <Badge label="Top" color={COLORS.positive} bg="#E6F6EA" />}
                    {isWorst && <Badge label="Needs work" color={COLORS.negative} bg="#FDE8E8" />}
                  </div>

                  <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {row.times_mentioned} menciones • Avg Match {row.avg_score ?? "N/A"}%
                  </div>
                </div>

                <div className="mt-2 h-3 rounded-md" style={{ backgroundColor: COLORS.track }}>
                  <div
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 6,
                      backgroundColor: color,
                      transition: "width 400ms ease",
                    }}
                  />
                </div>
              </div>

              <div className="w-16 flex-shrink-0 text-right mt-2 md:mt-0">
                <div className="text-sm font-medium">{pct}%</div>
                <div className="text-xs text-gray-400">relative</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center space-x-4 pt-2">
        <Legend color={COLORS.positive} label="Top 3 most mentioned" />
        <Legend color={COLORS.neutral} label="Others" />
        <Legend color={COLORS.negative} label="Bottom 3 below average match score" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <div style={{ width: 16, height: 10, backgroundColor: color, borderRadius: 3 }} />
      <div>{label}</div>
    </div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

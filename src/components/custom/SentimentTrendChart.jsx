"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = {
  Positive: "#4CAF50",
  Neutral: "#B0BEC5",
  Negative: "#E57373",
};

function computePercentages(arr) {
  return arr.map((r) => {
    const pos = Number(r.Positive ?? r.Positive_avg ?? 0);
    const neg = Number(r.Negative ?? r.Negative_avg ?? 0);
    const neu = Number(r.Neutral ?? r.Neutral_avg ?? 0);
    const total = pos + neg + neu || 1;
    return {
      ...r,
      Positive_pct: (pos / total) * 100,
      Negative_pct: (neg / total) * 100,
      Neutral_pct: (neu / total) * 100,
      Positive_count: pos,
      Negative_count: neg,
      Neutral_count: neu,
    };
  });
}

function rollingAverage(arr, window = 7, keys = ["Positive_pct", "Neutral_pct", "Negative_pct"]) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    const avgRow = { ...arr[i] };
    keys.forEach((k) => {
      const sum = slice.reduce((acc, s) => acc + (Number(s[k]) || 0), 0);
      avgRow[k.replace("_pct", "_avg")] = parseFloat((sum / slice.length).toFixed(2));
    });
    out.push(avgRow);
  }
  return out;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="p-3 bg-white border rounded shadow-md text-sm">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p, i) => {
        return (
          <div key={i} style={{ color: p.color }}>
            <div className="font-medium">{p.name}</div>
            <div>
              {typeof p.payload[`${p.dataKey.replace("_avg", "_pct")}`] !== "undefined" && (
                <span>{p.payload[`${p.dataKey.replace("_avg", "_pct")}`].toFixed(1)}% (pct)</span>
              )}
              {p.payload[`${p.dataKey.replace("_avg", "_count")}`] != null && (
                <span className="ml-2 text-gray-500">• {p.payload[`${p.dataKey.replace("_avg", "_count")}`]} msgs</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SentimentTrendChart = ({ chartData, isEmployeeView = false, rollingWindow = 7 }) => {
  if (!chartData) return null;

  let rawTeam = [];
  let rawEmp = [];

  if (Array.isArray(chartData)) {
    rawTeam = chartData;
  } else {
    if (Array.isArray(chartData.team)) rawTeam = chartData.team;
    if (Array.isArray(chartData.employee)) rawEmp = chartData.employee;
    if (!rawTeam.length && chartData.date && chartData.Positive != null) rawTeam = [chartData];
  }

  const sortByDate = (a, b) => new Date(a.date) - new Date(b.date);
  rawTeam = [...rawTeam].sort(sortByDate);
  rawEmp = [...rawEmp].sort(sortByDate);

  const teamPct = computePercentages(rawTeam);
  const empPct = computePercentages(rawEmp);

  const teamProcessed = teamPct.map((r) => {
    return { ...r };
  });
  const empProcessed = empPct.map((r) => ({ ...r }));

  const teamWithAvg = rollingAverage(teamProcessed, rollingWindow);
  const empWithAvg = rollingAverage(empProcessed, rollingWindow);

  const hasEmp = isEmployeeView && empWithAvg.length > 0;
  const mainData = hasEmp ? empWithAvg : teamWithAvg;
  const overlayTeamData = teamWithAvg;

  if (!mainData || mainData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Sentiment Trend Over Time</CardTitle>
          <CardDescription>Nothing to display for the selected filters.</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-sm text-gray-500">
          No data for the selected period.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Sentiment Trend Over Time</CardTitle>
        <CardDescription>
          Sentiment evolution.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mainData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={true} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {["Positive", "Neutral", "Negative"].map((k) => (
              <Line
                key={`main-${k}`}
                type="monotone"
                dataKey={`${k}_avg`}
                stroke={COLORS[k]}
                strokeWidth={2.5}
                dot={false}
                name={`${hasEmp ? "Employee" : "Team"} ${k} (avg)`}
                isAnimationActive={false}
              />
            ))}
            {hasEmp &&
              ["Positive", "Neutral", "Negative"].map((k) => (
                <Line
                  key={`overlay-${k}`}
                  type="monotone"
                  data={overlayTeamData}
                  dataKey={`${k}_avg`}
                  stroke={COLORS[k]}
                  strokeWidth={1.8}
                  strokeDasharray="5 5"
                  dot={false}
                  name={`Team ${k} (avg)`}
                  isAnimationActive={false}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentTrendChart;

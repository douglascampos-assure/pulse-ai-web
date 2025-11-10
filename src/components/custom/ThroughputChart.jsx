"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Loader } from "lucide-react";

const issueTypeColors = {};
const getColorForIssueType = (type) => {
  if (issueTypeColors[type]) return issueTypeColors[type];
  const colors = ["#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0", "#009688"];
  const hash = type.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  issueTypeColors[type] = color;
  return color;
};

export default function ThroughputChart({ team = "", employee = "", startDate = "", endDate = "", periodicity = "2week" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team) {
      setData([]);
      return;
    }
    
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("team", team);
        params.append("periodicity", periodicity);
        if (employee) params.append("employee", employee);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const res = await fetch(`/api/charts/jira-throughput?${params.toString()}`, { signal: controller.signal });
        
        if (!res.ok) throw new Error("Failed to fetch data");
        
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Error loading throughput data:", err);
      } finally {
        setLoading(false);
      }
    })();
    
    return () => controller.abort();
  }, [team, employee, startDate, endDate, periodicity]);

  const { chartData, issueTypes, maxCount } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], issueTypes: [], maxCount: 1 };
    }

    const pivotedData = {};
    const types = new Set();
    let max = 1;

    data.forEach(row => {
      if (!pivotedData[row.period]) {
        pivotedData[row.period] = { period: row.period };
      }
      pivotedData[row.period][row.issue_type] = row.count;
      types.add(row.issue_type);
      if (row.count > max) max = row.count;
    });

    const issueTypes = Array.from(types);
    const chartData = Object.values(pivotedData);

    return { chartData, issueTypes, maxCount: max };
  }, [data]);

  if (loading) {
    return (
      <Card className="min-h-[300px] flex justify-center items-center">
        <Loader className="animate-spin text-gray-400" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="min-h-[300px] flex justify-center items-center">
        <div className="p-4 text-sm text-gray-500">No throughput data to display for the selected period.</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Throughput</CardTitle>
        <div className="text-sm text-gray-500">Tickets completed by period and type.</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-2 pb-4">
          {issueTypes.map(type => (
            <Legend key={type} color={getColorForIssueType(type)} label={type} />
          ))}
        </div>
        
        <div className="space-y-6">
          {chartData.map((periodData) => (
            <div key={periodData.period} className="space-y-2">
              <span className="font-semibold">{periodData.period}</span>
              {issueTypes.map(type => {
                const count = periodData[type] || 0;
                if (count === 0) return null;
                
                const pct = Math.round((count / maxCount) * 100);
                const color = getColorForIssueType(type);

                return (
                  <div key={type} className="flex items-center space-x-2">
                    <div className="w-16 text-xs text-gray-500 truncate" title={type}>{type}</div>
                    <div className="flex-1 h-3 rounded-md" style={{ backgroundColor: "#E6EEF3" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 6,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="w-8 text-sm font-medium text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 3 }} />
      <div>{label}</div>
    </div>
  );
}
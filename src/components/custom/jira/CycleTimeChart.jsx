"use client";

import { useEffect, useState } from "react";
import { LinePerformanceChart } from "@/src/components/charts/line-chart";

export const CycleTimeChart = ({ team, member, startDate, endDate, periodicity, sprints }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (team) params.append("team", team);
        if (member) params.append("member", member);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (periodicity) params.append("periodicity", periodicity);
        sprints.forEach(sprint => params.append("sprints", sprint));

        const res = await fetch(`/api/charts/jira/cycle-time?${params.toString()}`);
        const chartData = await res.json();
        setData(chartData);
      } catch (error) {
        console.error("Error fetching cycle time data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (team || member) {
      fetchData();
    }
  }, [team, member, startDate, endDate, periodicity, sprints]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const chartConfig = {
    dataKey: "avg_cycle_time",
    xKey: "period",
    color: "var(--chart-1)",
    label: "Avg Cycle Time (days)",
  };

  return (
    <div className="w-full">
      <LinePerformanceChart
        title="Cycle Time"
        description="Average time to complete tickets"
        chartData={data}
        chartConfig={chartConfig}
      />
    </div>
  );
};

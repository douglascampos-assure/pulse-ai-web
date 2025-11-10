"use client";

import { useEffect, useState } from "react";
import { BarMultiple } from "@/src/components/charts/bar-multiple";

export const ThroughputChart = ({ team, member, startDate, endDate, periodicity, sprints }) => {
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

        const res = await fetch(`/api/charts/jira/throughput?${params.toString()}`);
        const chartData = await res.json();
        setData(chartData);
      } catch (error) {
        console.error("Error fetching throughput data:", error);
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

  const processedData = data.reduce((acc, curr) => {
    const { period, issue_type, ticket_count } = curr;
    let periodObj = acc.find(item => item.period === period);
    if (!periodObj) {
      periodObj = { period };
      acc.push(periodObj);
    }
    periodObj[issue_type] = ticket_count;
    return acc;
  }, []);

  const yKeys = [...new Set(data.map(d => d.issue_type))];

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold">Throughput</h3>
      <BarMultiple
        chartData={processedData}
        xKey="period"
        yKeys={yKeys}
        colors={["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57"]}
        stacked={true}
      />
    </div>
  );
};

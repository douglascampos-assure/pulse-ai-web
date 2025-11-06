"use client";

import { useEffect, useState } from "react";
import { BarMultiple } from "@/src/components/charts/bar-multiple";
import { LoaderWrapper } from "@/src/components/general/loader-wrapper";

export const VelocityChart = ({ team, member, sprints }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (team) params.append("team", team);
        if (member) params.append("member", member);
        sprints.forEach(sprint => params.append("sprints", sprint));

        const res = await fetch(`/api/charts/jira/velocity?${params.toString()}`);
        const chartData = await res.json();

        if (Array.isArray(chartData) && chartData.every(d => d.committed === null && d.completed === null)) {
          setData([]);
        } else {
          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching velocity data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (team || member || sprints.length > 0) {
      fetchData();
    }
  }, [team, member, sprints]);

  if (loading) {
    return <LoaderWrapper />;
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold">Velocity</h3>
      <BarMultiple
        chartData={data}
        xKey="sprint"
        yKeys={["committed", "completed"]}
        colors={["#8884d8", "#82ca9d"]}
      />
    </div>
  );
};

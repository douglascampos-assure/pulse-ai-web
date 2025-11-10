"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader } from "lucide-react";

export default function CycleTimeChart({ team = "", employee = "", startDate = "", endDate = "", periodicity = "2week" }) {
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

        const res = await fetch(`/api/charts/jira-cycle-time?${params.toString()}`, { signal: controller.signal });
        
        if (!res.ok) throw new Error("Failed to fetch data");
        
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Error loading cycle time data:", err);
      } finally {
        setLoading(false);
      }
    })();
    
    return () => controller.abort();
  }, [team, employee, startDate, endDate, periodicity]);

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
        <div className="p-4 text-sm text-gray-500">No cycle time data to display for the selected period. Ensure tickets have 'in_progress_date' and 'done_date'.</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Cycle Time</CardTitle>
        <div className="text-sm text-gray-500">Average time (in days) from 'In Progress' to 'Done'.</div>
      </CardHeader>
      <CardContent className="h-[300px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="period" angle={-15} textAnchor="end" height={40} tick={{ fontSize: 10 }} />
            <YAxis 
                label={{ value: 'Days', angle: -90, position: 'insideLeft', fontSize: 10 }} 
                tick={{ fontSize: 10 }}
            />
            <Tooltip 
                formatter={(value) => [`${value} days`, 'Avg. Cycle Time']}
                labelFormatter={(label) => `Period: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="avg_cycle_time_days" 
              name="Avg. Cycle Time"
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
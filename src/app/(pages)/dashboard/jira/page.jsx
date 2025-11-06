"use client";

import { useState } from "react";
import { JiraFilters } from "@/src/components/custom/jira/JiraFilters";
import { VelocityChart } from "@/src/components/custom/jira/VelocityChart";
import { ThroughputChart } from "@/src/components/custom/jira/ThroughputChart";
import { CycleTimeChart } from "@/src/components/custom/jira/CycleTimeChart";
import { Card, CardContent } from "@/src/components/ui/card";

const JiraDashboardPage = () => {
  const [filters, setFilters] = useState({
    team: "",
    member: "",
    sprints: [],
    startDate: "",
    endDate: "",
    periodicity: "2 weeks",
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto p-6">
      <Card className="w-full shadow-lg">
        <CardContent className="flex flex-col gap-6 p-6">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-800">
            Jira Dashboard
          </h3>
          <JiraFilters onFilterChange={handleFilterChange} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <VelocityChart
          team={filters.team}
          member={filters.member}
          sprints={filters.sprints}
        />
        <ThroughputChart
          team={filters.team}
          member={filters.member}
          startDate={filters.startDate}
          endDate={filters.endDate}
          periodicity={filters.periodicity}
          sprints={filters.sprints}
        />
      </div>

      <div className="w-full">
        <CycleTimeChart
          team={filters.team}
          member={filters.member}
          startDate={filters.startDate}
          endDate={filters.endDate}
          periodicity={filters.periodicity}
          sprints={filters.sprints}
        />
      </div>
    </div>
  );
};

export default JiraDashboardPage;

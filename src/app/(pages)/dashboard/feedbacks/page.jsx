"use client";

import { useEffect, useState } from "react";
import { SentimentTrendChart } from "@/src/components/custom/SentimentTrendChart";
import SkillsOverviewChart from "@/src/components/custom/SkillsOverviewChart";
import { RecommendedCoursesCards } from "@/src/components/custom/RecommendedCoursesCards";

const FeedbacksPage = () => {
  const [sentimentTrend, setSentimentTrend] = useState(null);
  const [teamSentimentAverages, setTeamSentimentAverages] = useState(null);
  const [topCourses, setTopCourses] = useState([]);

  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/filters/teams');
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams list:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      let url = '/api/filters/employees';
      if (selectedTeam) {
        url += `?team=${selectedTeam}`;
      }
      try {
        const res = await fetch(url);
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees list:", error);
      }
    };
    
    if (selectedTeam) {
      fetchEmployees();
    } else {
      setEmployees([]);
    }
    setSelectedEmployee(""); 
  }, [selectedTeam]);

  const fetchData = async () => {
    if (!selectedTeam) return;

    try {
      const params = new URLSearchParams();
      params.append("team", selectedTeam);
      if (selectedEmployee) params.append("employee", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("rolling", "7");

      const [trendRes, coursesRes] = await Promise.all([
        fetch(`/api/charts/sentiment-trend?${params.toString()}`),
        fetch(`/api/charts/courses?${params.toString()}&limit=4`),
      ]);

      const trendData = await trendRes.json();
      const coursesData = await coursesRes.json();

      setSentimentTrend(trendData);

      setTopCourses(Array.isArray(coursesData) ? coursesData : []);

      let teamSeries = [];
      if (trendData == null) {
        teamSeries = [];
      } else if (Array.isArray(trendData)) {
        teamSeries = trendData;
      } else if (trendData.team && Array.isArray(trendData.team)) {
        teamSeries = trendData.team;
      } else {
        teamSeries = [];
      }

      if (teamSeries.length > 0) {
        const sums = teamSeries.reduce(
          (acc, row) => {
            const pos = Number(row.Positive ?? row.Positive_avg ?? 0);
            const neg = Number(row.Negative ?? row.Negative_avg ?? 0);
            const neu = Number(row.Neutral ?? row.Neutral_avg ?? 0);
            acc.pos += pos;
            acc.neg += neg;
            acc.neu += neu;
            return acc;
          },
          { pos: 0, neg: 0, neu: 0 }
        );

        const total = sums.pos + sums.neg + sums.neu || 1;
        setTeamSentimentAverages({
          Positive: (sums.pos / total) * 100,
          Negative: (sums.neg / total) * 100,
          Neutral: (sums.neu / total) * 100,
        });
      } else {
        setTeamSentimentAverages(null);
      }
    } catch (error) {
      console.error("Error fetching charts:", error);
      setSentimentTrend(null);
      setTopCourses([]);
      setTeamSentimentAverages(null);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      fetchData();
    } else {
      setSentimentTrend(null);
      setTeamSentimentAverages(null);
    }
  }, [selectedTeam, selectedEmployee, startDate, endDate]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border rounded p-2"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          disabled={!selectedTeam} 
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.displayName} 
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border rounded p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {selectedTeam ? (
        <>
        <div className="w-full max-w-7xl mx-auto">
          <SentimentTrendChart
            chartData={sentimentTrend}
            isEmployeeView={!!selectedEmployee}
            teamAverages={teamSentimentAverages}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
          <div className="flex flex-col">
            <RecommendedCoursesCards coursesData={topCourses} />
          </div>
      
          <div className="flex flex-col">
            <SkillsOverviewChart
              team={selectedTeam}
              employee={selectedEmployee}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </>
      ) : (
        <div className="flex justify-center items-center h-[400px] border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
          <p>Please select a team to view the charts.</p>
        </div>
      )}
    </div>
  );
};

export default FeedbacksPage;

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import VelocityChart from "@/src/components/custom/VelocityChart";
import ThroughputChart from "@/src/components/custom/ThroughputChart";
import CycleTimeChart from "@/src/components/custom/CycleTimeChart";

const JiraDashboardPage = () => {
  const [teams, setTeams] = useState([]); 
  const [employees, setEmployees] = useState([]); 
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [periodicity, setPeriodicity] = useState("sprint");  

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/filters/jira/teams');
        const data = await res.json();
        setTeams(data);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedTeam(data[0].value); 
        }
      } catch (error) {
        console.error("Error fetching Jira teams list:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedTeam) return;
      let url = `/api/filters/jira/employees?team=${selectedTeam}`;
      try {
        setIsLoading(true);
        const res = await fetch(url);
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching Jira employees list:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
    setSelectedEmployee("");
  }, [selectedTeam]);

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto p-6">
  
      <Card className="w-full shadow-lg">
        <CardContent className="flex flex-col gap-6 p-6">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-800">
            Jira Performance Dashboard
          </h3>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Select Team / Project</Label>
              <select
                className="border rounded-md p-3 w-full bg-white"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.label}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Select Team Member</Label>
              <select
                className="border rounded-md p-3 w-full bg-white"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={!selectedTeam || isLoading}
              >
                <option value="">All Team Members</option>
                {employees.map((emp) => (
                  <option key={emp.value} value={emp.value}>
                    {emp.label}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Periodicity</Label>
              <select
                className="border rounded-md p-3 w-full bg-white"
                value={periodicity}
                onChange={(e) => setPeriodicity(e.target.value)}
              >
                <option value="sprint">By Sprint</option>
                <option value="1week">1 Week</option>
                <option value="2week">2 Weeks</option>
                <option value="1month">1 Month</option>
              </select>
            </div>
  
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Start Date</Label>
              <input type="date" className="border rounded-md p-3 w-full bg-white"
                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
  
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">End Date</Label>
              <input type="date" className="border rounded-md p-3 w-full bg-white"
                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
  
      {selectedTeam ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <VelocityChart
              team={selectedTeam}
              employee={selectedEmployee}
              startDate={startDate}
              endDate={endDate}
            />
  
            <ThroughputChart
              team={selectedTeam}
              employee={selectedEmployee}
              startDate={startDate}
              endDate={endDate}
              periodicity={periodicity}
            />
          </div>
          <CycleTimeChart
            team={selectedTeam}
            employee={selectedEmployee}
            startDate={startDate}
            endDate={endDate}
            periodicity={periodicity}
          />
        </>
      ) : (
        <div className="flex justify-center items-center h-[400px] border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
          <p>Please select a team to view the charts.</p>
        </div>
      )}
    </div>
  );  
};

export default JiraDashboardPage;
"use client";

import { useEffect, useState } from "react";
import { Label } from "@/src/components/ui/label";

export const JiraFilters = ({ onFilterChange }) => {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedSprints, setSelectedSprints] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodicity, setPeriodicity] = useState("2 weeks");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/filters/jira/teams');
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams list:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      let url = '/api/filters/jira/members';
      if (selectedTeam) {
        url += `?team=${selectedTeam}`;
      }
      try {
        const res = await fetch(url);
        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members list:", error);
      }
    };
    fetchMembers();
  }, [selectedTeam]);

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const res = await fetch('/api/filters/jira/sprints');
        const data = await res.json();
        setSprints(data);
      } catch (error) {
        console.error("Error fetching sprints list:", error);
      }
    };
    fetchSprints();
  }, []);

  useEffect(() => {
    onFilterChange({
      team: selectedTeam,
      member: selectedMember,
      sprints: selectedSprints,
      startDate,
      endDate,
      periodicity: selectedSprints.length > 0 ? "sprints" : periodicity,
    });
  }, [selectedTeam, selectedMember, selectedSprints, startDate, endDate, periodicity]);

  const handleSprintChange = (sprint) => {
    setSelectedSprints(prev =>
      prev.includes(sprint)
        ? prev.filter(s => s !== sprint)
        : [...prev, sprint]
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Select Team</Label>
        <select
          className="border rounded-md p-3 w-full bg-white"
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
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Select Member</Label>
        <select
          className="border rounded-md p-3 w-full bg-white"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          disabled={!selectedTeam}
        >
          <option value="">All Members</option>
          {members.map((member) => (
            <option key={`${member.employee_id}-${member.display_name}`} value={member.employee_id}>
              {member.display_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Select Sprints</Label>
        <div className="border rounded-md p-3 w-full bg-white max-h-40 overflow-y-auto">
          {sprints.map((sprint) => (
            <div key={sprint} className="flex items-center">
              <input
                type="checkbox"
                id={sprint}
                value={sprint}
                checked={selectedSprints.includes(sprint)}
                onChange={() => handleSprintChange(sprint)}
                className="mr-2"
              />
              <label htmlFor={sprint}>{sprint}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Periodicity</Label>
        <select
          className="border rounded-md p-3 w-full bg-white"
          value={periodicity}
          onChange={(e) => setPeriodicity(e.target.value)}
          disabled={selectedSprints.length > 0}
        >
          <option value="1 week">1 Week</option>
          <option value="2 weeks">2 Weeks</option>
          <option value="1 month">1 Month</option>
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Start Date</Label>
        <input
          type="date"
          className="border rounded-md p-3 w-full bg-white"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={selectedSprints.length > 0}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">End Date</Label>
        <input
          type="date"
          className="border rounded-md p-3 w-full bg-white"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={selectedSprints.length > 0}
        />
      </div>
    </div>
  );
};

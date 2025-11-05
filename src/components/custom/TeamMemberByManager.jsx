"use client";
import React from "react";
import { Funnel } from "lucide-react";

export default function TeamMemberByManager({ teams, selectedTeam, onSelect }) {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      <Funnel className="w-5 h-5 text-gray-500" />
      <select
        className="border border-gray-300 rounded-md px-3 py-2 w-64 text-base outline-none"
        value={selectedTeam}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Select a Team</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";
import TeamMemberByManager from "@/src/components/custom/TeamMemberByManager";
import SimpleCard from "@/src/components/ui/simple-card";
import { useAuth } from "@/src/context/AuthContext";
import { useTeamsByManager } from "@/src/hooks/useTeamsByManager";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const email = user?.email;
  const { teams, loading } = useTeamsByManager(email);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [LoadingTeam, setLoadingTeam] = useState(false);

  async function loadTeamData(teamName) {
    if (!teamName) return;

    try {
      setLoadingTeam(true);
      const res = await fetch(
        `/api/team-data?team=${encodeURIComponent(teamName)}`
      );
      if (!res.ok) throw new Error("Failed to load team data");
      const data = await res.json();
      setTeamData(data);
    } catch (err) {
      console.error("Error loading team data:", err);
    } finally {
      setLoadingTeam(false);
    }
  }

  useEffect(() => {
    if (selectedTeam) loadTeamData(selectedTeam);
  }, [selectedTeam]);

  return (
    <div className="p-6 flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900  w-full">
      {/* Titulo */}
      <div className="mb-4 w-full text-center">
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "36px",
          }}
          className="text-gray-900 dark:text-gray-100"
        >
          Overview
        </h1>
      </div>

      <div className="mb-6 flex justify-end">
        <TeamMemberByManager
          teams={teams || []}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
        />
      </div>

      {/* Resume 1 */}
      <div className="mb-1 py-5 flex justify-center px-8 bg-white rounded-xl shadow-lg">
        <div className="flex items-center w-full px-10">
          <SimpleCard
            bgColor="bg-[#C4E7FF]"
            textColor="text-black"
            width="w-44"
            height="h-44"
            indicator="4"
            description="Teams"
          />

          <div className="flex flex-col justify-center gap-4 flex-grow ml-8">
            <div
              className="w-full h-8 rounded-xl shadow-md flex items-center px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: "#FFBABA", color: "#000" }}
            >
              <span>Team Phoenix: Average sentiment this week is Negative</span>
            </div>
            <div
              className="w-full h-8 rounded-xl shadow-md flex items-center px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: "#FFBABA", color: "#000" }}
            >
              <span>
                There is 1 team member with the camera on less than 85% of the
                times
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Resume 2 */}
      <div className="py-6 dark:bg-gray-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator="8"
          description="Members in the team"
          icon="/icons/people.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator="24"
          description="Meetings this week"
          icon="/icons/meetings.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator="500"
          description="Mentions on Slack"
          icon="/icons/slack.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator=""
          description="Completed Tasks"
          icon="/icons/jira.svg"
        />
      </div>
      {/* Resume 3 */}
      <div className="py-6 rounded-xl grid grid-cols-2 gap-6 bg-white">
        <div className="py-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          aa
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center">
          <SimpleCard
            bgColor="bg-[#C4E7FF]"
            textColor="text-black"
            width="w-64"
            height="h-44"
            indicator="92%"
            description="Engagement Rate"
          />
        </div>
      </div>
    </div>
  );
}

"use client";
import TeamMemberByManager from "@/src/components/custom/TeamMemberByManager";
import TeamMemberCards from "@/src/components/custom/TeamMembersCards";
import SentimentCard from "@/src/components/ui/sentimentCard";
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
  const [teamData, setTeamData] = useState(false);

  async function loadTeamData(teamName) {
    if (!teamName) return;

    try {
      setLoadingTeam(true);
      const res = await fetch(
        `/api/team-data?team=${encodeURIComponent(teamName)}`
      );
      if (!res.ok) throw new Error("Failed to load team data");
      const data = await res.json();
      console.log(data);
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
            indicator={(teams?.length ?? 0).toString()}
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
          indicator={teamData.members?.length ?? 0}
          description="Members in the team"
          icon="/icons/people.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator={(teamData.avgWeeklyHours ?? 0).toFixed(1)}
          description="Meetings this week"
          icon="/icons/meetings.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator={teamData.totalKudos}
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
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-row justify-center items-center">
          <div flex flex-col>
            <div>Warnings 1</div>
            <div>Warnings 2</div>
          </div>
          <SentimentCard averageSentiment={teamData.averageSentiment} />
        </div>
      </div>
      {/* Table */}
      <div className="py-6 rounded-xl bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Team Members Details</h2>
        <TeamMemberCards members={teamData.members || []} />
      </div>
    </div>
  );
}

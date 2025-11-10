"use client";
import { useAuth } from "@/src/context/AuthContext";
import { useTeamsByManager } from "@/src/hooks/useTeamsByManager";
import { useState, useEffect } from "react";
import CustomSpinner from "@/src/components/custom/CustomSpinner";
import OverviewGlobalData from "@/src/components/dashboard/OverviewGlobalData";
import OverviewFilters from "@/src/components/dashboard/OverviewFilters";
import OverviewTeam from "@/src/components/dashboard/OverviewTeam";
import OverviewTeamMembersTable from "@/src/components/dashboard/OverviewTeamMembersTable";

export default function DashboardPage() {
  const { user } = useAuth();
  const email = user?.email;
  const { teams, loading } = useTeamsByManager(email);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [LoadingTeam, setLoadingTeam] = useState(false);
  const [teamData, setTeamData] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const performanceData = [
    { month: "Jul", performance: 72 },
    { month: "Aug", performance: 80 },
    { month: "Sep", performance: 77 },
    { month: "Oct", performance: 90 },
  ];

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

  if (loading) {
    return <CustomSpinner text="Loading Dashboard..." />;
  }
  return (
    <div className="p-6 flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900  w-full space-y-6">
      {/* Header */}
      <header className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 text-center">
          Overview
        </h1>
      </header>

      {/* GLOBAL RESUME */}
      <OverviewGlobalData
        teams={teams}
        sentimentMessage="Team Phoenix: Average sentiment this week is Negative"
        cameraMessage="There is 1 team member with the camera on less than 85% of the times"
      />

      {/* Filters */}

      <OverviewFilters
        teams={teams || []}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        members={teamData.members || []}
        selectedMember={selectedMember}
        onMemberChange={setSelectedMember}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
      />

      {LoadingTeam ? (
        <CustomSpinner text="Loading Team..." />
      ) : selectedTeam ? (
        <>
          {/* Team Data */}
          <OverviewTeam teamData={teamData} performanceData={performanceData} />
          {/* Table */}
          <div className="py-6 rounded-xl bg-white p-6">
            <OverviewTeamMembersTable members={teamData.members || []} />
          </div>
        </>
      ) : (
        <div className="py-6 rounded-xl bg-white p-6 text-center text-slate-500">
          Please select a team to view data.
        </div>
      )}
    </div>
  );
}

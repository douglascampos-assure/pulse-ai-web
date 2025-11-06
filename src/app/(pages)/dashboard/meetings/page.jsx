"use client";

/**
 * ============================================================================
 * MEETING ANALYTICS DASHBOARD - REFACTORED
 * ============================================================================
 * 
 * A comprehensive dashboard for analyzing team meeting performance metrics.
 * Now using modular, reusable components for better maintainability.
 * 
 * Features:
 * - Project-level overview with performance trends
 * - Individual member performance tracking
 * - Meeting-specific analysis
 * - AI-powered insights and recommendations
 * - Date range filtering with dropdowns
 * 
 * Author: Pulse AI
 * Last Updated: October 2025
 * ============================================================================
 */

import { useState, useEffect } from "react";

// Import Filter Components
import ProjectFilter from "@/src/components/meetings/filters/ProjectFilter";
import MeetingFilter from "@/src/components/meetings/filters/MeetingFilter";
import MemberFilter from "@/src/components/meetings/filters/MemberFilter";
import DateRangeFilter from "@/src/components/meetings/filters/DateRangeFilter";

// Import Chart Components
import LineChart from "@/src/components/meetings/charts/LineChart";
import ParticipationTrendChart from "@/src/components/meetings/charts/ParticipationTrendChart";
import QualityTrendChart from "@/src/components/meetings/charts/QualityTrendChart";

// Import Card Components
import KPICard from "@/src/components/meetings/Cards/KPICard";
import ParticipantsSummaryCard from "@/src/components/meetings/Cards/ParticipantsSummaryCard";
import TopPerformersCard from "@/src/components/meetings/Cards/TopPerformersCard";
import NeedAttentionCard from "@/src/components/meetings/Cards/NeedAttentionCard";

// Import Table Components
import TeamMembersTable from "@/src/components/meetings/Tables/TeamMembersTable";
import MeetingParticipantsTable from "@/src/components/meetings/Tables/MeetingParticipantsTable";

export default function MeetingsPage() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [meetings, setMeetings] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedMeeting, setSelectedMeeting] = useState("all");
  const [selectedMember, setSelectedMember] = useState("");
  const [participants, setParticipants] = useState([]);
  const [allProjectParticipants, setAllProjectParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [projectHistory, setProjectHistory] = useState([]);

  // Date Filter State
  const [startMonth, setStartMonth] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endDay, setEndDay] = useState("");

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  
  const projectNames = {
    'mdp-aftd-phf': 'Pulse AI',
    'aty-qrdo-sbz': 'Recruitment AI'
  };

  // ============================================================================
  // DATA FETCHING - Initial Load
  // ============================================================================
  
  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoading(true);
        const response = await fetch('/api/meetings');
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        setMeetings(result.data);
        
        if (result.data.length > 0) {
          const firstProject = result.data[0].meeting_id;
          setSelectedProject(firstProject);
          loadProjectData(firstProject);
        }
      } catch (err) {
        console.error("Error loading meetings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  // ============================================================================
  // DATA FETCHING - Dynamic Updates
  // ============================================================================
  
  useEffect(() => {
    if (selectedProject !== "all") {
      if (selectedMeeting === "all") {
        loadProjectData(selectedProject);
      } else {
        loadMeetingDetails(selectedMeeting);
      }
    }
  }, [selectedProject, selectedMeeting, selectedMember, startMonth, startDay, endMonth, endDay]);

  /**
   * Load all participants and metrics for a specific project
   */
  async function loadProjectData(projectId) {
    try {
      const projectMeetings = meetings.filter(m => m.meeting_id === projectId);
      const filteredProjectMeetings = filterMeetingsByDateRange(projectMeetings);
      
      const allParticipantsPromises = filteredProjectMeetings.map(async (meeting) => {
        const response = await fetch(`/api/meetings/${meeting.recording_id}`);
        const result = await response.json();
        if (result.success) {
          return result.data.map(p => ({
            ...p,
            meeting_date: meeting.meeting_date,
            recording_id: meeting.recording_id
          }));
        }
        return [];
      });

      const allParticipantsArrays = await Promise.all(allParticipantsPromises);
      const allParticipants = allParticipantsArrays.flat();
      
      setAllProjectParticipants(allParticipants);
      
      const historyByDate = {};
      filteredProjectMeetings.forEach(meeting => {
        const meetingParticipants = allParticipants.filter(p => p.recording_id === meeting.recording_id);
        if (meetingParticipants.length > 0) {
          historyByDate[meeting.meeting_date] = {
            date: meeting.meeting_date,
            avgParticipation: (meetingParticipants.reduce((sum, p) => sum + p.speech_percentage, 0) / meetingParticipants.length).toFixed(1),
            avgCamera: (meetingParticipants.reduce((sum, p) => sum + p.camera_on_percentage, 0) / meetingParticipants.length).toFixed(1),
            avgQuality: (meetingParticipants.reduce((sum, p) => sum + p.contribution_quality_score, 0) / meetingParticipants.length).toFixed(1),
            totalParticipants: meetingParticipants.length
          };
        }
      });
      
      const history = Object.values(historyByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
      setProjectHistory(history);

      if (selectedMember) {
        const memberData = allParticipants.filter(p => p.participant_name === selectedMember);
        memberData.sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date));
        setMemberHistory(memberData);
      }
    } catch (err) {
      console.error("Error loading project data:", err);
    }
  }

  /**
   * Load participants for a specific meeting
   */
  async function loadMeetingDetails(recordingId) {
    try {
      const response = await fetch(`/api/meetings/${recordingId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setParticipants(result.data);
    } catch (err) {
      console.error("Error loading participants:", err);
    }
  }

  // ============================================================================
  // DATE FILTERING LOGIC
  // ============================================================================
  
  const filterMeetingsByDateRange = (meetingsArray) => {
    if (!startMonth && !startDay && !endMonth && !endDay) {
      return meetingsArray;
    }

    return meetingsArray.filter(meeting => {
      const meetingDate = new Date(meeting.meeting_date);
      const meetingMonth = meetingDate.getMonth() + 1;
      const meetingDay = meetingDate.getDate();
      
      const hasStartFilter = startMonth && startDay;
      const hasEndFilter = endMonth && endDay;
      
      if (hasStartFilter && hasEndFilter) {
        const startMonthNum = parseInt(startMonth);
        const startDayNum = parseInt(startDay);
        const endMonthNum = parseInt(endMonth);
        const endDayNum = parseInt(endDay);
        
        const meetingValue = meetingMonth * 100 + meetingDay;
        const startValue = startMonthNum * 100 + startDayNum;
        const endValue = endMonthNum * 100 + endDayNum;
        
        return meetingValue >= startValue && meetingValue <= endValue;
      } else if (hasStartFilter) {
        const startMonthNum = parseInt(startMonth);
        const startDayNum = parseInt(startDay);
        const meetingValue = meetingMonth * 100 + meetingDay;
        const startValue = startMonthNum * 100 + startDayNum;
        
        return meetingValue >= startValue;
      } else if (hasEndFilter) {
        const endMonthNum = parseInt(endMonth);
        const endDayNum = parseInt(endDay);
        const meetingValue = meetingMonth * 100 + meetingDay;
        const endValue = endMonthNum * 100 + endDayNum;
        
        return meetingValue <= endValue;
      }
      
      return true;
    });
  };

  const clearDateFilter = () => {
    setStartMonth("");
    setStartDay("");
    setEndMonth("");
    setEndDay("");
  };

  // ============================================================================
  // HELPER FUNCTIONS FOR DATA PROCESSING
  // ============================================================================

  /**
   * Get score color configuration
   */
  const getScoreColor = (score, type = "quality") => {
    if (type === "quality") {
      if (score >= 8) return { 
        bg: "bg-emerald-500", 
        text: "text-emerald-700", 
        label: "Excellent", 
        lightBg: "bg-emerald-50", 
        border: "border-emerald-300" 
      };
      if (score >= 6) return { 
        bg: "bg-amber-500", 
        text: "text-amber-700", 
        label: "Good", 
        lightBg: "bg-amber-50", 
        border: "border-amber-300" 
      };
      return { 
        bg: "bg-rose-500", 
        text: "text-rose-700", 
        label: "Needs Improvement", 
        lightBg: "bg-rose-50", 
        border: "border-rose-300" 
      };
    }
    
    if (type === "percentage") {
      if (score >= 70) return { bg: "bg-emerald-500", text: "text-emerald-700", lightBg: "bg-emerald-50", label: "Excellent", border: "border-emerald-300" };
      if (score >= 50) return { bg: "bg-amber-500", text: "text-amber-700", lightBg: "bg-amber-50", label: "Good", border: "border-amber-300" };
      return { bg: "bg-rose-500", text: "text-rose-700", lightBg: "bg-rose-50", label: "Needs Improvement", border: "border-rose-300" };
    }
  };

  /**
   * Generate AI-powered insights for a team member
   */
  const generateInsights = (member) => {
    const insights = {
      strengths: [],
      improvements: [],
      recommendations: []
    };

    const avgPart = parseFloat(member.avgParticipation);
    const avgCam = parseFloat(member.avgCamera);
    const avgQual = parseFloat(member.avgQuality);

    if (avgQual >= 8) insights.strengths.push("Consistently delivers high-quality contributions");
    if (avgPart >= 20) insights.strengths.push("Active participant with strong engagement");
    if (avgCam >= 80) insights.strengths.push("Excellent video presence and availability");

    if (avgQual < 6) insights.improvements.push("Focus on contribution quality and relevance");
    if (avgPart < 10) insights.improvements.push("Increase participation in discussions");
    if (avgCam < 50) insights.improvements.push("Improve camera usage for better team connection");

    if (avgPart < 15 && avgQual >= 7) {
      insights.recommendations.push("Quality is strong - encourage more frequent participation");
    }
    if (avgPart >= 15 && avgQual < 6) {
      insights.recommendations.push("Good engagement - focus on more strategic contributions");
    }
    if (avgCam < 70) {
      insights.recommendations.push("Enable camera more often to strengthen team dynamics");
    }

    return insights;
  };

  /**
   * Get top performers data
   */
  const getTopPerformers = () => {
    const memberStats = {};
    
    allProjectParticipants.forEach(p => {
      if (!memberStats[p.participant_name]) {
        memberStats[p.participant_name] = { 
          name: p.participant_name, 
          totalQuality: 0, 
          count: 0 
        };
      }
      memberStats[p.participant_name].totalQuality += p.contribution_quality_score;
      memberStats[p.participant_name].count++;
    });

    return Object.values(memberStats)
      .map(m => ({ 
        name: m.name, 
        avgQuality: (m.totalQuality / m.count).toFixed(1) 
      }))
      .sort((a, b) => parseFloat(b.avgQuality) - parseFloat(a.avgQuality));
  };

  /**
   * Get members that need attention
   */
  const getNeedAttentionMembers = () => {
    const memberStats = {};
    
    allProjectParticipants.forEach(p => {
      if (!memberStats[p.participant_name]) {
        memberStats[p.participant_name] = { 
          name: p.participant_name, 
          totalQuality: 0, 
          count: 0 
        };
      }
      memberStats[p.participant_name].totalQuality += p.contribution_quality_score;
      memberStats[p.participant_name].count++;
    });

    return Object.values(memberStats)
      .map(m => ({ 
        name: m.name, 
        avgQuality: (m.totalQuality / m.count).toFixed(1) 
      }))
      .sort((a, b) => parseFloat(a.avgQuality) - parseFloat(b.avgQuality));
  };

  /**
   * Get team members data for table
   */
  const getTeamMembersData = () => {
    const memberStats = {};
    
    allProjectParticipants.forEach(p => {
      if (!memberStats[p.participant_name]) {
        memberStats[p.participant_name] = {
          name: p.participant_name,
          meetings: 0,
          totalParticipation: 0,
          totalCamera: 0,
          totalInterventions: 0,
          totalQuality: 0,
          contributionTypes: []
        };
      }
      memberStats[p.participant_name].meetings++;
      memberStats[p.participant_name].totalParticipation += p.speech_percentage;
      memberStats[p.participant_name].totalCamera += p.camera_on_percentage;
      memberStats[p.participant_name].totalInterventions += p.total_utterances;
      memberStats[p.participant_name].totalQuality += p.contribution_quality_score;
      memberStats[p.participant_name].contributionTypes.push(p.contribution_type);
    });

    return Object.values(memberStats).map(m => ({
      name: m.name,
      meetings: m.meetings,
      avgParticipation: (m.totalParticipation / m.meetings).toFixed(1),
      avgCamera: (m.totalCamera / m.meetings).toFixed(0),
      avgInterventions: Math.round(m.totalInterventions / m.meetings),
      avgQuality: (m.totalQuality / m.meetings).toFixed(1),
      mostCommonType: m.contributionTypes.sort((a,b) =>
        m.contributionTypes.filter(v => v===a).length - 
        m.contributionTypes.filter(v => v===b).length
      ).pop()
    }));
  };

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (loading) {
    return (
      <section className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-slate-700 mx-auto mb-3"></div>
          <p className="text-slate-700 font-medium text-sm">Loading Analytics...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded">
          <p className="text-rose-700 font-semibold text-sm">❌ Error: {error}</p>
        </div>
      </section>
    );
  }

  // ============================================================================
  // DATA PREPARATION
  // ============================================================================

  const projects = [...new Set(meetings.map(m => m.meeting_id))];
  const filteredMeetings = filterMeetingsByDateRange(
    selectedProject === "all" 
      ? meetings 
      : meetings.filter(m => m.meeting_id === selectedProject)
  );

  const uniqueParticipants = selectedMeeting === "all"
    ? [...new Set(allProjectParticipants.map(p => p.participant_name))]
    : [...new Set(participants.map(p => p.participant_name))];

  // View state determination
  const isProjectView = selectedMeeting === "all" && !selectedMember;
  const isMeetingView = selectedMeeting !== "all" && !selectedMember;
  const isMemberProjectView = selectedMeeting === "all" && selectedMember;
  const isMemberMeetingView = selectedMeeting !== "all" && selectedMember;

  // Calculate metrics
  const totalParticipants = [...new Set(allProjectParticipants.map(p => p.participant_name))].length;
  const avgCamera = allProjectParticipants.length > 0 
    ? (allProjectParticipants.reduce((sum, p) => sum + p.camera_on_percentage, 0) / allProjectParticipants.length).toFixed(0)
    : 0;
  const avgParticipation = allProjectParticipants.length > 0
    ? (allProjectParticipants.reduce((sum, p) => sum + p.speech_percentage, 0) / allProjectParticipants.length).toFixed(1)
    : 0;
  const avgQuality = allProjectParticipants.length > 0
    ? (allProjectParticipants.reduce((sum, p) => sum + p.contribution_quality_score, 0) / allProjectParticipants.length).toFixed(1)
    : 0;

  // Team averages for comparison
  const projectAvg = {
    participation: allProjectParticipants.length > 0
      ? (allProjectParticipants.reduce((sum, p) => sum + p.speech_percentage, 0) / allProjectParticipants.length).toFixed(1)
      : "0",
    camera: allProjectParticipants.length > 0
      ? (allProjectParticipants.reduce((sum, p) => sum + p.camera_on_percentage, 0) / allProjectParticipants.length).toFixed(0)
      : "0",
    quality: allProjectParticipants.length > 0
      ? (allProjectParticipants.reduce((sum, p) => sum + p.contribution_quality_score, 0) / allProjectParticipants.length).toFixed(1)
      : "0",
    interventions: allProjectParticipants.length > 0 
      ? (allProjectParticipants.reduce((sum, p) => sum + p.total_utterances, 0) / allProjectParticipants.length).toFixed(0)
      : "0"
  };

  const currentMeeting = meetings.find(m => m.recording_id === selectedMeeting);

  // ============================================================================
  // MAIN RENDER - Dashboard Layout
  // ============================================================================

  return (
    <section className="p-3 md:p-4 space-y-3 bg-gray-50 min-h-screen">
      
      {/* ========================================================================
          HEADER SECTION
          ======================================================================== */}
      <header className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Meeting Analytics</h1>
            <div className="flex items-center gap-2 mt-1">
              {selectedProject !== "all" && (
                <>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                    {projectNames[selectedProject]}
                  </span>
                  {selectedMeeting !== "all" && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {filteredMeetings.find(m => m.recording_id === selectedMeeting)?.meeting_date}
                    </span>
                  )}
                  {selectedMember && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {selectedMember}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {selectedMember && (
            <button
              onClick={() => setSelectedMember("")}
              className="px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium"
            >
              ← Back
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================
          FILTER CONTROLS - USING MODULAR COMPONENTS
          ======================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <ProjectFilter
          value={selectedProject}
          onChange={(newProject) => {
            setSelectedProject(newProject);
            setSelectedMeeting("all");
            setSelectedMember("");
          }}
          projects={projects}
          projectNames={projectNames}
        />

        <MeetingFilter
          value={selectedMeeting}
          onChange={(newMeeting) => {
            setSelectedMeeting(newMeeting);
            setSelectedMember("");
          }}
          meetings={filteredMeetings}
        />

        <MemberFilter
          value={selectedMember}
          onChange={setSelectedMember}
          members={uniqueParticipants}
        />

        <DateRangeFilter
          startMonth={startMonth}
          startDay={startDay}
          endMonth={endMonth}
          endDay={endDay}
          onChangeStartMonth={setStartMonth}
          onChangeStartDay={setStartDay}
          onChangeEndMonth={setEndMonth}
          onChangeEndDay={setEndDay}
          onClear={clearDateFilter}
          className="md:col-span-2"
        />
      </div>

      {/* ========================================================================
          PROJECT VIEW - Overview Dashboard (USANDO COMPONENTES)
          ======================================================================== */}
      {isProjectView && (
        <>
          {/* Line Chart + Participants Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <LineChart
              data={projectHistory}
              title="Average Score per Meeting"
              dataKey="avgQuality"
              dateKey="date"
              className="lg:col-span-4"
            />

            <ParticipantsSummaryCard
              totalParticipants={totalParticipants}
              totalMeetings={filteredMeetings.length}
              avgQuality={avgQuality}
              avgParticipation={avgParticipation}
            />
          </div>

          {/* Top Performers + Need Attention Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <TopPerformersCard
              performers={getTopPerformers()}
              onSelectMember={setSelectedMember}
            />

            <NeedAttentionCard
              members={getNeedAttentionMembers()}
              onSelectMember={setSelectedMember}
            />
          </div>

          {/* Team Members Table */}
          <TeamMembersTable
            members={getTeamMembersData()}
            onSelectMember={setSelectedMember}
            sortBy="quality"
            sortOrder="asc"
          />
        </>
      )}

      {/* ========================================================================
          MEMBER PROJECT VIEW - Individual Performance History (USANDO COMPONENTES)
          ======================================================================== */}
      {isMemberProjectView && (
        <>
          {/* Member Header */}
          <div className="bg-slate-700 rounded-lg shadow-sm p-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {selectedMember.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{selectedMember}</h2>
                <p className="text-xs text-slate-300">Performance History • {projectNames[selectedProject]}</p>
              </div>
            </div>
          </div>

          {/* Performance KPIs with Team Comparison */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <KPICard
              label="Participation"
              value={memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.speech_percentage, 0) / memberHistory.length).toFixed(1) : 0}
              unit="%"
              icon="🎤"
              badge={(() => {
                const val = memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.speech_percentage, 0) / memberHistory.length) : 0;
                return getScoreColor(val, "percentage");
              })()}
              comparison={{
                average: projectAvg.participation,
                isAbove: memberHistory.length > 0 && (memberHistory.reduce((sum, m) => sum + m.speech_percentage, 0) / memberHistory.length) >= parseFloat(projectAvg.participation),
                difference: memberHistory.length > 0 ? ((memberHistory.reduce((sum, m) => sum + m.speech_percentage, 0) / memberHistory.length) - parseFloat(projectAvg.participation)).toFixed(1) : "0"
              }}
            />

            <KPICard
              label="Camera"
              value={memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.camera_on_percentage, 0) / memberHistory.length).toFixed(0) : 0}
              unit="%"
              icon="📹"
              badge={(() => {
                const val = memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.camera_on_percentage, 0) / memberHistory.length) : 0;
                return getScoreColor(val, "percentage");
              })()}
              comparison={{
                average: projectAvg.camera,
                isAbove: memberHistory.length > 0 && (memberHistory.reduce((sum, m) => sum + m.camera_on_percentage, 0) / memberHistory.length) >= parseFloat(projectAvg.camera),
                difference: memberHistory.length > 0 ? ((memberHistory.reduce((sum, m) => sum + m.camera_on_percentage, 0) / memberHistory.length) - parseFloat(projectAvg.camera)).toFixed(1) : "0"
              }}
            />

            <KPICard
              label="Interventions"
              value={memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.total_utterances, 0) / memberHistory.length).toFixed(0) : 0}
              icon="💬"
              comparison={{
                average: projectAvg.interventions,
                isAbove: memberHistory.length > 0 && (memberHistory.reduce((sum, m) => sum + m.total_utterances, 0) / memberHistory.length) >= parseFloat(projectAvg.interventions),
                difference: memberHistory.length > 0 ? ((memberHistory.reduce((sum, m) => sum + m.total_utterances, 0) / memberHistory.length) - parseFloat(projectAvg.interventions)).toFixed(1) : "0"
              }}
            />

            <KPICard
              label="Quality"
              value={memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.contribution_quality_score, 0) / memberHistory.length).toFixed(1) : 0}
              unit="/10"
              icon="⭐"
              badge={(() => {
                const val = memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.contribution_quality_score, 0) / memberHistory.length) : 0;
                return getScoreColor(val, "quality");
              })()}
              comparison={{
                average: projectAvg.quality,
                isAbove: memberHistory.length > 0 && (memberHistory.reduce((sum, m) => sum + m.contribution_quality_score, 0) / memberHistory.length) >= parseFloat(projectAvg.quality),
                difference: memberHistory.length > 0 ? ((memberHistory.reduce((sum, m) => sum + m.contribution_quality_score, 0) / memberHistory.length) - parseFloat(projectAvg.quality)).toFixed(1) : "0"
              }}
            />
          </div>

          {/* Performance Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <ParticipationTrendChart
              data={memberHistory}
              title="Participation Trend"
              dataKey="speech_percentage"
              dateKey="meeting_date"
            />

            <QualityTrendChart
              data={memberHistory}
              title="Quality Trend"
              dataKey="contribution_quality_score"
              dateKey="meeting_date"
            />
          </div>

          {/* AI-Powered Insights */}
          {(() => {
            const memberStats = {
              name: selectedMember,
              avgParticipation: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.speech_percentage, 0) / memberHistory.length).toFixed(1) : 0,
              avgCamera: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.camera_on_percentage, 0) / memberHistory.length).toFixed(0) : 0,
              avgQuality: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.contribution_quality_score, 0) / memberHistory.length).toFixed(1) : 0
            };
            const insights = generateInsights(memberStats);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Strengths */}
                <div className="bg-emerald-50 rounded-lg shadow-sm p-3 border border-emerald-200">
                  <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">💪</span>
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {insights.strengths.length > 0 ? (
                      insights.strengths.map((item, idx) => (
                        <li key={idx} className="text-xs text-emerald-700 flex items-start gap-1">
                          <span>✓</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-emerald-600">Building strengths...</li>
                    )}
                  </ul>
                </div>

                {/* Areas to Improve */}
                <div className="bg-amber-50 rounded-lg shadow-sm p-3 border border-amber-200">
                  <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    Areas to Improve
                  </h3>
                  <ul className="space-y-1">
                    {insights.improvements.length > 0 ? (
                      insights.improvements.map((item, idx) => (
                        <li key={idx} className="text-xs text-amber-700 flex items-start gap-1">
                          <span>→</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-amber-600">Performing well overall</li>
                    )}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-sky-50 rounded-lg shadow-sm p-3 border border-sky-200">
                  <h3 className="text-sm font-bold text-sky-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Recommendations
                  </h3>
                  <ul className="space-y-1">
                    {insights.recommendations.length > 0 ? (
                      insights.recommendations.map((item, idx) => (
                        <li key={idx} className="text-xs text-sky-700 flex items-start gap-1">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-sky-600">Continue current approach</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ========================================================================
          MEETING VIEW - Specific Meeting Analysis (USANDO COMPONENTES)
          ======================================================================== */}
      {isMeetingView && (
        <>
          {/* Meeting Header */}
          <div className="bg-slate-700 rounded-lg shadow-sm p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Meeting Analysis</h2>
                <p className="text-xs text-slate-300">{currentMeeting?.meeting_date} • {projectNames[selectedProject]}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">Participants</p>
                <p className="text-3xl font-bold">{participants.length}</p>
              </div>
            </div>
          </div>

          {/* Meeting Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <KPICard
              label="High Participation"
              value={participants.length > 0 ? ((participants.filter(p => p.speech_percentage >= 20).length / participants.length) * 100).toFixed(0) : 0}
              unit="%"
              icon="📊"
            />

            <KPICard
              label="Avg Camera"
              value={participants.length > 0 ? (participants.reduce((sum, p) => sum + p.camera_on_percentage, 0) / participants.length).toFixed(0) : 0}
              unit="%"
              icon="📹"
            />

            <KPICard
              label="Interventions"
              value={participants.reduce((sum, p) => sum + p.total_utterances, 0)}
              icon="💬"
            />

            <KPICard
              label="Avg Quality"
              value={participants.length > 0 ? (participants.reduce((sum, p) => sum + p.contribution_quality_score, 0) / participants.length).toFixed(1) : 0}
              unit="/10"
              icon="⭐"
            />
          </div>

          {/* Meeting Participants Table */}
          <MeetingParticipantsTable
            participants={participants}
            meetingDate={currentMeeting?.meeting_date}
            onSelectMember={setSelectedMember}
          />
        </>
      )}

      {/* ========================================================================
          MEMBER MEETING VIEW - Individual in Specific Meeting (USANDO COMPONENTES)
          ======================================================================== */}
      {isMemberMeetingView && participants.filter(p => p.participant_name === selectedMember).length > 0 && (
        <>
          {/* Member Meeting Header */}
          <div className="bg-slate-700 rounded-lg shadow-sm p-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {selectedMember.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{selectedMember}</h2>
                <p className="text-xs text-slate-300">Performance on {filteredMeetings.find(m => m.recording_id === selectedMeeting)?.meeting_date}</p>
              </div>
            </div>
          </div>

          {/* Member Meeting KPIs */}
          {(() => {
            const memberData = participants.find(p => p.participant_name === selectedMember);
            if (!memberData) return null;

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <KPICard
                  label="Participation"
                  value={memberData.speech_percentage}
                  unit="%"
                  icon="🎤"
                />

                <KPICard
                  label="Camera"
                  value={memberData.camera_on_percentage}
                  unit="%"
                  icon="📹"
                />

                <KPICard
                  label="Interventions"
                  value={memberData.total_utterances}
                  icon="💬"
                />

                <KPICard
                  label="Quality"
                  value={memberData.contribution_quality_score}
                  unit="/10"
                  icon="⭐"
                />
              </div>
            );
          })()}
        </>
      )}
    </section>
  );
}

"use client";

/**
 * ============================================================================
 * MEETING ANALYTICS DASHBOARD
 * ============================================================================
 * 
 * A comprehensive dashboard for analyzing team meeting performance metrics.
 * 
 * Features:
 * - Project-level overview with performance trends
 * - Individual member performance tracking
 * - Meeting-specific analysis
 * - AI-powered insights and recommendations
 * 
 * Author: Your Team
 * Last Updated: October 2025
 * ============================================================================
 */

import { useState, useEffect } from "react";

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
        
        // Auto-select first project on load
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
  }, [selectedProject, selectedMeeting, selectedMember]);

  /**
   * Load all participants and metrics for a specific project
   * @param {string} projectId - The project identifier
   */
  async function loadProjectData(projectId) {
    try {
      const projectMeetings = meetings.filter(m => m.meeting_id === projectId);
      
      // Fetch all participants across all meetings in parallel
      const allParticipantsPromises = projectMeetings.map(async (meeting) => {
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
      
      // Calculate aggregate metrics per meeting date
      const historyByDate = {};
      projectMeetings.forEach(meeting => {
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
      
      // Sort by date for timeline visualization
      const history = Object.values(historyByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
      setProjectHistory(history);

      // Load individual member history if a member is selected
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
   * @param {string} recordingId - The meeting recording identifier
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
  // HELPER FUNCTIONS - Styling & Formatting
  // ============================================================================

  /**
   * Get color scheme based on score and type
   * @param {number} score - The score to evaluate
   * @param {string} type - Either "quality" or "percentage"
   * @returns {Object} Color configuration object
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
      if (score >= 70) return { 
        bg: "bg-emerald-500", 
        text: "text-emerald-700", 
        lightBg: "bg-emerald-50" 
      };
      if (score >= 50) return { 
        bg: "bg-amber-500", 
        text: "text-amber-700", 
        lightBg: "bg-amber-50" 
      };
      return { 
        bg: "bg-rose-500", 
        text: "text-rose-700", 
        lightBg: "bg-rose-50" 
      };
    }
  };

  /**
   * Get badge configuration for contribution types
   * @param {string} type - The contribution type
   * @returns {Object} Badge configuration with label, icon, and color
   */
  const getContributionTypeBadge = (type) => {
    const types = {
      proposal: { label: "Proactive", icon: "🎯", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      report: { label: "Informative", icon: "📋", color: "bg-sky-50 text-sky-700 border-sky-200" },
      question: { label: "Inquisitive", icon: "❓", color: "bg-orange-50 text-orange-700 border-orange-200" },
      discussion: { label: "Collaborative", icon: "💬", color: "bg-teal-50 text-teal-700 border-teal-200" },
    };
    return types[type] || types.discussion;
  };

  /**
   * Get participation level color based on percentage
   * @param {number} percentage - Participation percentage
   * @returns {Object} Color configuration
   */
  const getParticipationLevel = (percentage) => {
    if (percentage >= 20) return { color: "bg-emerald-500" };
    if (percentage >= 10) return { color: "bg-amber-500" };
    return { color: "bg-rose-500" };
  };

  /**
   * Get camera status configuration
   * @param {number} percentage - Camera on percentage
   * @returns {Object} Status configuration with icon, label, and color
   */
  const getCameraStatus = (percentage) => {
    if (percentage >= 80) return { icon: "📹", label: "Active", color: "text-emerald-600" };
    if (percentage > 0) return { icon: "📹", label: "Partial", color: "text-amber-600" };
    return { icon: "📹", label: "Off", color: "text-rose-600" };
  };

  /**
   * Format date to short readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date (e.g., "Oct 20")
   */
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  /**
   * Generate AI-powered insights for a team member
   * @param {Object} member - Member statistics object
   * @returns {Object} Insights categorized as strengths, improvements, and recommendations
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

    // Identify strengths
    if (avgQual >= 8) insights.strengths.push("Consistently delivers high-quality contributions");
    if (avgPart >= 20) insights.strengths.push("Active participant with strong engagement");
    if (avgCam >= 80) insights.strengths.push("Excellent video presence and availability");

    // Identify areas for improvement
    if (avgQual < 6) insights.improvements.push("Focus on contribution quality and relevance");
    if (avgPart < 10) insights.improvements.push("Increase participation in discussions");
    if (avgCam < 50) insights.improvements.push("Improve camera usage for better team connection");

    // Generate strategic recommendations
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
  // DATA PREPARATION & CALCULATIONS
  // ============================================================================

  const projects = [...new Set(meetings.map(m => m.meeting_id))];
  const projectNames = {
    'mdp-aftd-phf': 'Pulse AI',
    'aty-qrdo-sbz': 'Recruitment AI'
  };

  const filteredMeetings = selectedProject === "all" 
    ? meetings 
    : meetings.filter(m => m.meeting_id === selectedProject);

  const uniqueParticipants = selectedMeeting === "all"
    ? [...new Set(allProjectParticipants.map(p => p.participant_name))]
    : [...new Set(participants.map(p => p.participant_name))];

  // View state determination
  const isProjectView = selectedMeeting === "all" && !selectedMember;
  const isMeetingView = selectedMeeting !== "all" && !selectedMember;
  const isMemberProjectView = selectedMeeting === "all" && selectedMember;
  const isMemberMeetingView = selectedMeeting !== "all" && selectedMember;

  // Calculate metrics based on current view
  let displayParticipants = [];
  let totalParticipants = 0;
  let avgCamera = 0;
  let avgParticipation = 0;
  let avgQuality = 0;

  if (isProjectView) {
    displayParticipants = allProjectParticipants;
    totalParticipants = [...new Set(allProjectParticipants.map(p => p.participant_name))].length;
    avgCamera = allProjectParticipants.length > 0 
      ? (allProjectParticipants.reduce((sum, p) => sum + p.camera_on_percentage, 0) / allProjectParticipants.length).toFixed(0)
      : 0;
    avgParticipation = allProjectParticipants.length > 0
      ? (allProjectParticipants.reduce((sum, p) => sum + p.speech_percentage, 0) / allProjectParticipants.length).toFixed(1)
      : 0;
    avgQuality = allProjectParticipants.length > 0
      ? (allProjectParticipants.reduce((sum, p) => sum + p.contribution_quality_score, 0) / allProjectParticipants.length).toFixed(1)
      : 0;
  } else if (isMeetingView) {
    displayParticipants = participants;
    totalParticipants = participants.length;
    avgCamera = participants.length > 0 
      ? (participants.reduce((sum, p) => sum + p.camera_on_percentage, 0) / participants.length).toFixed(0)
      : 0;
    avgParticipation = participants.length > 0
      ? (participants.reduce((sum, p) => sum + p.speech_percentage, 0) / participants.length).toFixed(1)
      : 0;
    avgQuality = participants.length > 0
      ? (participants.reduce((sum, p) => sum + p.contribution_quality_score, 0) / participants.length).toFixed(1)
      : 0;
  } else if (isMemberProjectView) {
    displayParticipants = memberHistory;
  } else if (isMemberMeetingView) {
    displayParticipants = participants.filter(p => p.participant_name === selectedMember);
  }

  // Participation distribution metrics
  const goodParticipation = displayParticipants.filter(p => p.speech_percentage >= 20).length;
  const mediumParticipation = displayParticipants.filter(p => p.speech_percentage >= 10 && p.speech_percentage < 20).length;
  const lowParticipation = displayParticipants.filter(p => p.speech_percentage < 10).length;

  const goodPercent = displayParticipants.length > 0 ? ((goodParticipation / displayParticipants.length) * 100).toFixed(0) : 0;
  const mediumPercent = displayParticipants.length > 0 ? ((mediumParticipation / displayParticipants.length) * 100).toFixed(0) : 0;
  const lowPercent = displayParticipants.length > 0 ? ((lowParticipation / displayParticipants.length) * 100).toFixed(0) : 0;

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
          FILTER CONTROLS
          ======================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Project Filter */}
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Project</label>
          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedMeeting("all");
              setSelectedMember("");
            }}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium"
          >
            {projects.map((projectId) => (
              <option key={projectId} value={projectId}>
                {projectNames[projectId] || projectId}
              </option>
            ))}
          </select>
        </div>

        {/* Meeting Filter */}
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Meeting</label>
          <select
            value={selectedMeeting}
            onChange={(e) => {
              setSelectedMeeting(e.target.value);
              setSelectedMember("");
            }}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium"
          >
            <option value="all">All Meetings</option>
            {filteredMeetings.map((meeting) => (
              <option key={meeting.recording_id} value={meeting.recording_id}>
                {meeting.meeting_date}
              </option>
            ))}
          </select>
        </div>

        {/* Team Member Filter */}
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Team Member</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white text-slate-900 font-medium"
          >
            <option value="">All Members</option>
            {uniqueParticipants.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================
          PROJECT VIEW - Overview Dashboard
          Shows aggregate metrics across all meetings in a project
          ======================================================================== */}
      {isProjectView && (
        <>
          {/* ==================================================================
              LINE CHART + PARTICIPANTS CARD - 80/20 Layout
              Main performance visualization with team summary
              ================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            
            {/* LINE CHART - 80% Width (4/5 columns) */}
            <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="text-lg">📈</span>
                Average Score per Meeting
              </h3>
              <div className="relative h-72">
                <svg viewBox="0 0 800 240" className="w-full h-full">
                  {/* Grid lines with Y-axis values */}
                  {[0, 2, 4, 6, 8, 10].map((val) => (
                    <g key={val}>
                      <line
                        x1="60"
                        y1={190 - (val * 18)}
                        x2="780"
                        y2={190 - (val * 18)}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x="45"
                        y={195 - (val * 18)}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  ))}

                  {/* Line Chart - Quality trend over time */}
                  {projectHistory.length > 1 && (
                    <polyline
                      points={projectHistory.map((record, index) => {
                        const x = 60 + (index * (720 / (projectHistory.length - 1)));
                        const y = 190 - (parseFloat(record.avgQuality) * 18);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data points with date labels */}
                  {projectHistory.map((record, index) => {
                    const x = 60 + (index * (720 / Math.max(projectHistory.length - 1, 1)));
                    const y = 190 - (parseFloat(record.avgQuality) * 18);
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#f59e0b"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y="210"
                          fontSize="11"
                          fill="#64748b"
                          fontWeight="500"
                          textAnchor="middle"
                        >
                          {formatShortDate(record.date)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Y-axis label */}
                  <text
                    x="20"
                    y="120"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="600"
                    textAnchor="middle"
                    transform="rotate(-90 20 120)"
                  >
                    Average Score
                  </text>

                  {/* X-axis label */}
                  <text
                    x="420"
                    y="235"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Date
                  </text>
                </svg>
              </div>
            </div>

            {/* PARTICIPANTS SUMMARY CARD - 20% Width (1/5 columns) */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex flex-col h-full">
              <div className="text-center flex-1 flex flex-col justify-center py-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">👥</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
                  Team Size
                </p>
                <p className="text-5xl font-bold text-slate-800 mb-1">{totalParticipants}</p>
                <p className="text-xs text-slate-500">Active Members</p>
              </div>
              
              {/* Summary Statistics */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600 font-medium">Total Meetings</span>
                  <span className="text-sm text-slate-800 font-bold">{filteredMeetings.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600 font-medium">Avg Quality</span>
                  <span className="text-sm text-slate-800 font-bold">{avgQuality}/10</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600 font-medium">Avg Participation</span>
                  <span className="text-sm text-slate-800 font-bold">{avgParticipation}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================================
              TOP & BOTTOM PERFORMERS - Side by Side Cards
              Highlights best performers and members needing support
              ================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            
            {/* TOP PERFORMERS CARD */}
            <div className="bg-emerald-50 rounded-lg shadow-sm p-3 border border-emerald-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-lg">🏆</span>
                Top Performers
              </h3>
              <div className="space-y-2">
                {(() => {
                  // Calculate average quality score per member
                  const memberStats = {};
                  allProjectParticipants.forEach(p => {
                    if (!memberStats[p.participant_name]) {
                      memberStats[p.participant_name] = { name: p.participant_name, totalQuality: 0, count: 0 };
                    }
                    memberStats[p.participant_name].totalQuality += p.contribution_quality_score;
                    memberStats[p.participant_name].count++;
                  });

                  return Object.values(memberStats)
                    .map(m => ({ name: m.name, avgQuality: (m.totalQuality / m.count).toFixed(1) }))
                    .sort((a, b) => parseFloat(b.avgQuality) - parseFloat(a.avgQuality))
                    .slice(0, 3)
                    .map((member, index) => {
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-white rounded border border-emerald-200 cursor-pointer hover:shadow transition-shadow"
                          onClick={() => setSelectedMember(member.name)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{medals[index]}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{member.name}</p>
                              <p className="text-xs text-slate-500">Quality Champion</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-emerald-600">{member.avgQuality}</p>
                            <p className="text-xs text-slate-500">/ 10</p>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            {/* NEED ATTENTION CARD */}
            <div className="bg-amber-50 rounded-lg shadow-sm p-3 border border-amber-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                Need Attention
              </h3>
              <div className="space-y-2">
                {(() => {
                  // Calculate average quality score per member
                  const memberStats = {};
                  allProjectParticipants.forEach(p => {
                    if (!memberStats[p.participant_name]) {
                      memberStats[p.participant_name] = { name: p.participant_name, totalQuality: 0, count: 0 };
                    }
                    memberStats[p.participant_name].totalQuality += p.contribution_quality_score;
                    memberStats[p.participant_name].count++;
                  });

                  return Object.values(memberStats)
                    .map(m => ({ name: m.name, avgQuality: (m.totalQuality / m.count).toFixed(1) }))
                    .sort((a, b) => parseFloat(a.avgQuality) - parseFloat(b.avgQuality))
                    .slice(0, 3)
                    .map((member, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-white rounded border border-amber-200 cursor-pointer hover:shadow transition-shadow"
                        onClick={() => setSelectedMember(member.name)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{member.name}</p>
                            <p className="text-xs text-slate-500">Needs coaching</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-600">{member.avgQuality}</p>
                          <p className="text-xs text-slate-500">/ 10</p>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>

          {/* ==================================================================
              TEAM MEMBERS OVERVIEW TABLE
              Comprehensive performance table for all team members
              Sorted by quality score (lowest first - needs attention)
              ================================================================== */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-slate-700 px-3 py-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-base">👥</span>
                Team Members Overview
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Member</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Sessions</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Participation</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Camera</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Interventions</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 uppercase">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    // Aggregate member statistics across all meetings
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

                    // Calculate averages and most common contribution type
                    const membersArray = Object.values(memberStats).map(m => ({
                      ...m,
                      avgParticipation: (m.totalParticipation / m.meetings).toFixed(1),
                      avgCamera: (m.totalCamera / m.meetings).toFixed(0),
                      avgInterventions: Math.round(m.totalInterventions / m.meetings),
                      avgQuality: (m.totalQuality / m.meetings).toFixed(1),
                      mostCommonType: m.contributionTypes.sort((a,b) =>
                        m.contributionTypes.filter(v => v===a).length - m.contributionTypes.filter(v => v===b).length
                      ).pop()
                    }));

                    // Sort by quality score - LOWEST FIRST (need attention)
                    membersArray.sort((a, b) => parseFloat(a.avgQuality) - parseFloat(b.avgQuality));

                    return membersArray.map((member, index) => {
                      const qualityColor = getScoreColor(parseFloat(member.avgQuality), "quality");
                      const participation = getParticipationLevel(parseFloat(member.avgParticipation));
                      const contributionBadge = getContributionTypeBadge(member.mostCommonType);

                      return (
                        <tr 
                          key={index} 
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedMember(member.name)}
                        >
                          {/* Member Info with Avatar */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <p className="font-semibold text-slate-800">{member.name}</p>
                            </div>
                          </td>
                          
                          {/* Number of Sessions */}
                          <td className="px-3 py-2">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                              {member.meetings}
                            </span>
                          </td>
                          
                          {/* Participation with Progress Bar */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2 w-16">
                                <div
                                  className={`h-2 rounded-full ${participation.color}`}
                                  style={{ width: `${Math.min(parseFloat(member.avgParticipation) * 5, 100)}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-800 w-10">{member.avgParticipation}%</span>
                            </div>
                          </td>
                          
                          {/* Camera Usage */}
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-800">{member.avgCamera}%</span>
                          </td>
                          
                          {/* Interventions Count */}
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-800">{member.avgInterventions}</span>
                          </td>
                          
                          {/* Contribution Type Badge */}
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded border ${contributionBadge.color} font-medium`}>
                              {contributionBadge.label}
                            </span>
                          </td>
                          
                          {/* Quality Score */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded border ${qualityColor.lightBg} ${qualityColor.text} ${qualityColor.border} font-semibold`}>
                                {qualityColor.label}
                              </span>
                              <span className="font-bold text-slate-800">{member.avgQuality}/10</span>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================
          MEMBER PROJECT VIEW - Individual Performance History
          Shows detailed performance metrics for a specific member across all meetings
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

          {/* ==================================================================
              PERFORMANCE KPIs WITH TEAM COMPARISON
              Shows member metrics vs team averages
              ================================================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { 
                label: "Participation", 
                value: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.speech_percentage, 0) / memberHistory.length).toFixed(1) : 0,
                avg: projectAvg.participation,
                icon: "🎤",
                unit: "%",
                type: "percentage"
              },
              { 
                label: "Camera", 
                value: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.camera_on_percentage, 0) / memberHistory.length).toFixed(0) : 0,
                avg: projectAvg.camera,
                icon: "📹",
                unit: "%",
                type: "percentage"
              },
              { 
                label: "Interventions", 
                value: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.total_utterances, 0) / memberHistory.length).toFixed(0) : 0,
                avg: projectAvg.interventions,
                icon: "💬",
                unit: "",
                type: "number"
              },
              { 
                label: "Quality", 
                value: memberHistory.length > 0 ? (memberHistory.reduce((sum, m) => sum + m.contribution_quality_score, 0) / memberHistory.length).toFixed(1) : 0,
                avg: projectAvg.quality,
                icon: "⭐",
                unit: "/10",
                type: "quality"
              }
            ].map((metric, idx) => {
              const isAboveAvg = parseFloat(metric.value) >= parseFloat(metric.avg);
              const diff = (parseFloat(metric.value) - parseFloat(metric.avg)).toFixed(1);
              const scoreColor = getScoreColor(parseFloat(metric.value), metric.type === "quality" ? "quality" : "percentage");
              
              return (
                <div key={idx} className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-600 font-medium">{metric.label}</p>
                    <span className="text-lg">{metric.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mb-1">{metric.value}<span className="text-sm text-slate-500">{metric.unit}</span></p>
                  
                  {/* Performance Badge */}
                  <div className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${scoreColor.lightBg} ${scoreColor.text} font-semibold border ${scoreColor.border}`}>
                    {scoreColor.label}
                  </div>
                  
                  {/* Comparison with Team Average */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Team Avg:</span>
                      <span className="text-slate-800 font-bold">{metric.avg}{metric.unit}</span>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${isAboveAvg ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {isAboveAvg ? '↑' : '↓'} {Math.abs(diff)}{metric.unit} {isAboveAvg ? 'above' : 'below'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================================================================
              PERFORMANCE TREND CHARTS
              Line charts showing participation and quality over time
              ================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            
            {/* PARTICIPATION TREND CHART */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Participation Trend</h3>
              <div className="relative h-64">
                <svg viewBox="0 0 500 230" className="w-full h-full">
                  {/* Grid lines with Y-axis labels */}
                  {[0, 25, 50, 75, 100].map((val) => (
                    <g key={val}>
                      <line 
                        x1="60" 
                        y1={180 - (val * 1.5)} 
                        x2="480" 
                        y2={180 - (val * 1.5)} 
                        stroke="#e2e8f0" 
                        strokeWidth="1" 
                      />
                      <text
                        x="50"
                        y={185 - (val * 1.5)}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  ))}

                  {/* Y-axis label */}
                  <text
                    x="15"
                    y="110"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="600"
                    textAnchor="middle"
                    transform="rotate(-90 15 110)"
                  >
                    Participation %
                  </text>

                  {/* Line - Participation trend */}
                  {memberHistory.length > 1 && (
                    <polyline
                      points={memberHistory.map((record, index) => {
                        const x = 60 + (index * (420 / (memberHistory.length - 1)));
                        const y = 180 - (record.speech_percentage * 1.5);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data points with values */}
                  {memberHistory.map((record, index) => {
                    const x = 60 + (index * (420 / Math.max(memberHistory.length - 1, 1)));
                    const y = 180 - (record.speech_percentage * 1.5);
                    return (
                      <g key={index}>
                        <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                        <text
                          x={x}
                          y={y - 8}
                          fontSize="9"
                          fill="#3b82f6"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {record.speech_percentage}%
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis labels - Meeting dates */}
                  {memberHistory.map((record, index) => {
                    const x = 60 + (index * (420 / Math.max(memberHistory.length - 1, 1)));
                    return (
                      <text
                        key={index}
                        x={x}
                        y="200"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="500"
                        textAnchor="middle"
                      >
                        {formatShortDate(record.meeting_date)}
                      </text>
                    );
                  })}

                  {/* X-axis label */}
                  <text
                    x="270"
                    y="225"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Date
                  </text>
                </svg>
              </div>
            </div>

            {/* QUALITY TREND CHART */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Quality Trend</h3>
              <div className="relative h-64">
                <svg viewBox="0 0 500 230" className="w-full h-full">
                  {/* Grid lines with Y-axis labels */}
                  {[0, 2, 4, 6, 8, 10].map((val) => (
                    <g key={val}>
                      <line 
                        x1="60" 
                        y1={180 - (val * 15)} 
                        x2="480" 
                        y2={180 - (val * 15)} 
                        stroke="#e2e8f0" 
                        strokeWidth="1" 
                      />
                      <text
                        x="50"
                        y={185 - (val * 15)}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  ))}

                  {/* Y-axis label */}
                  <text
                    x="15"
                    y="110"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="600"
                    textAnchor="middle"
                    transform="rotate(-90 15 110)"
                  >
                    Quality Score
                  </text>

                  {/* Line - Quality trend */}
                  {memberHistory.length > 1 && (
                    <polyline
                      points={memberHistory.map((record, index) => {
                        const x = 60 + (index * (420 / (memberHistory.length - 1)));
                        const y = 180 - (record.contribution_quality_score * 15);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data points with values */}
                  {memberHistory.map((record, index) => {
                    const x = 60 + (index * (420 / Math.max(memberHistory.length - 1, 1)));
                    const y = 180 - (record.contribution_quality_score * 15);
                    return (
                      <g key={index}>
                        <circle cx={x} cy={y} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                        <text
                          x={x}
                          y={y - 8}
                          fontSize="9"
                          fill="#f59e0b"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {record.contribution_quality_score}
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis labels - Meeting dates */}
                  {memberHistory.map((record, index) => {
                    const x = 60 + (index * (420 / Math.max(memberHistory.length - 1, 1)));
                    return (
                      <text
                        key={index}
                        x={x}
                        y="200"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="500"
                        textAnchor="middle"
                      >
                        {formatShortDate(record.meeting_date)}
                      </text>
                    );
                  })}

                  {/* X-axis label */}
                  <text
                    x="270"
                    y="225"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Date
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* ==================================================================
              AI-POWERED INSIGHTS
              Automated analysis with strengths, improvements, and recommendations
              ================================================================== */}
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
                {/* STRENGTHS */}
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

                {/* AREAS TO IMPROVE */}
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

                {/* RECOMMENDATIONS */}
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
          MEETING VIEW - Specific Meeting Analysis
          Shows detailed breakdown for a single meeting
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
                <p className="text-3xl font-bold">{totalParticipants}</p>
              </div>
            </div>
          </div>

          {/* Meeting Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">High Participation</p>
              <p className="text-2xl font-bold text-emerald-600">{goodPercent}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Avg Camera</p>
              <p className="text-2xl font-bold text-slate-800">{avgCamera}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Interventions</p>
              <p className="text-2xl font-bold text-slate-800">{participants.reduce((sum, p) => sum + p.total_utterances, 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Avg Quality</p>
              <p className="text-2xl font-bold text-slate-800">{avgQuality}/10</p>
            </div>
          </div>

          {/* Meeting Participants Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-slate-700 px-3 py-2">
              <h3 className="text-sm font-bold text-white">Meeting Participants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Participant</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Camera</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Participation</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Interventions</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {participants.map((participant, index) => {
                    const qualityColor = getScoreColor(participant.contribution_quality_score, "quality");
                    const participation = getParticipationLevel(participant.speech_percentage);
                    const contributionBadge = getContributionTypeBadge(participant.contribution_type);

                    return (
                      <tr 
                        key={index} 
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedMember(participant.participant_name)}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                              {participant.participant_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <p className="font-semibold text-slate-800">{participant.participant_name}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-slate-800">{participant.camera_on_percentage}%</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${participation.color}`}
                                style={{ width: `${Math.min(participant.speech_percentage * 5, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-800">{participant.speech_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-slate-800">{participant.total_utterances}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded border ${contributionBadge.color} font-medium`}>
                            {contributionBadge.label}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded border ${qualityColor.lightBg} ${qualityColor.text} ${qualityColor.border} font-semibold`}>
                              {qualityColor.label}
                            </span>
                            <span className="font-bold text-slate-800">{participant.contribution_quality_score}/10</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================
          MEMBER MEETING VIEW - Individual in Specific Meeting
          Shows single member's performance in a specific meeting
          ======================================================================== */}
      {isMemberMeetingView && displayParticipants.length > 0 && (
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Participation</p>
              <p className="text-2xl font-bold text-slate-800">{displayParticipants[0].speech_percentage}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Camera</p>
              <p className="text-2xl font-bold text-slate-800">{displayParticipants[0].camera_on_percentage}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Interventions</p>
              <p className="text-2xl font-bold text-slate-800">{displayParticipants[0].total_utterances}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Quality</p>
              <p className="text-2xl font-bold text-slate-800">{displayParticipants[0].contribution_quality_score}/10</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/**
 * ============================================================================
 * END OF MEETING ANALYTICS DASHBOARD
 * ============================================================================
 * 
 * USAGE INSTRUCTIONS:
 * 
 * 1. This component requires API endpoints:
 *    - GET /api/meetings - Returns all meetings
 *    - GET /api/meetings/[recording_id] - Returns participants for a meeting
 * 
 * 2. Data structure expected:
 *    - meetings: { meeting_id, recording_id, meeting_date }
 *    - participants: { 
 *        participant_name, 
 *        speech_percentage, 
 *        camera_on_percentage,
 *        total_utterances,
 *        contribution_quality_score,
 *        contribution_type,
 *        sentiment,
 *        key_topics
 *      }
 * 
 * 3. Customization:
 *    - Update projectNames object for your projects
 *    - Modify color schemes in getScoreColor() function
 *    - Adjust insight generation logic in generateInsights()
 * 
 * 4. Features:
 *    - Project-level analytics with trends
 *    - Individual member performance tracking
 *    - Meeting-specific analysis
 *    - AI-powered insights
 *    - Responsive design
 * 
 * ============================================================================
 */
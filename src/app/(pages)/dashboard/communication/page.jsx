"use client";

import { useState, useEffect } from "react";
import CommunicationHeader from "@/src/components/communication/CommunicationHeader";
import CommunicationFilters from "@/src/components/communication/CommunicationFilters";
import TeamOverview from "@/src/components/communication/TeamOverview";
import IndividualAnalysis from "@/src/components/communication/IndividualAnalysis";

export default function CommunicationPage() {
  // English Assessment data (from Gold)
  const [englishParticipants, setEnglishParticipants] = useState([]);
  const [allEnglishParticipants, setAllEnglishParticipants] = useState([]);
  const [englishTeamStats, setEnglishTeamStats] = useState(null);
  
  // Grammar data (from Gold - aggregated)
  const [grammarParticipants, setGrammarParticipants] = useState([]);
  const [allGrammarParticipants, setAllGrammarParticipants] = useState([]);
  const [grammarTeamStats, setGrammarTeamStats] = useState(null);
  
  // Shared
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState("all");
  const [selectedMember, setSelectedMember] = useState(""); // Vacío = "All Members"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Meeting names mapping
  const meetingNames = {
    'mdp-aftd-phf': 'Pulse AI',
    'aty-qrdo-sbz': 'Recruitment AI'
  };

  useEffect(() => {
    fetchCommunicationData();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [selectedMeeting, selectedMember, allEnglishParticipants, allGrammarParticipants]);

  const fetchCommunicationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/communication');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.details || 'Failed to fetch communication data');
      }
      
      const data = await response.json();
      
      console.log('📊 Communication Data:', data); // Para debug
      
      // Set English Assessment data (main data source)
      setAllEnglishParticipants(data.english.participants);
      setEnglishParticipants(data.english.participants);
      setEnglishTeamStats(data.english.team_stats);
      
      // Set Grammar data (supplementary)
      setAllGrammarParticipants(data.grammar.participants);
      setGrammarParticipants(data.grammar.participants);
      setGrammarTeamStats(data.grammar.team_stats);
      
      // Set meetings
      setMeetings(data.meetings || []);
      
    } catch (err) {
      setError(err.message);
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterParticipants = () => {
    let filteredEnglish = allEnglishParticipants;
    let filteredGrammar = allGrammarParticipants;

    // Filter by meeting
    if (selectedMeeting !== "all") {
      filteredEnglish = filteredEnglish.filter(p => p.meeting_id === selectedMeeting);
      filteredGrammar = filteredGrammar.filter(p => p.meeting_id === selectedMeeting);
    }

    // Filter by member
    if (selectedMember) {
      filteredEnglish = filteredEnglish.filter(p => p.participant_name === selectedMember);
      filteredGrammar = filteredGrammar.filter(p => p.participant_name === selectedMember);
    }

    setEnglishParticipants(filteredEnglish);
    setGrammarParticipants(filteredGrammar);
  };

  const handleSelectParticipant = (name) => {
    setSelectedMember(name);
  };

  // Get unique members filtered by selected meeting
  const getFilteredMembers = () => {
    let membersToShow = [];
    
    if (selectedMeeting === "all") {
      // Mostrar todos los miembros
      membersToShow = [
        ...allEnglishParticipants.map(p => p.participant_name),
        ...allGrammarParticipants.map(p => p.participant_name)
      ];
    } else {
      // Mostrar solo miembros del meeting seleccionado
      const englishMembers = allEnglishParticipants
        .filter(p => p.meeting_id === selectedMeeting)
        .map(p => p.participant_name);
      
      const grammarMembers = allGrammarParticipants
        .filter(p => p.meeting_id === selectedMeeting)
        .map(p => p.participant_name);
      
      membersToShow = [...englishMembers, ...grammarMembers];
    }
    
    // Retornar lista única y ordenada
    return [...new Set(membersToShow)].sort();
  };

  const allMembers = getFilteredMembers();

  if (loading) {
    return (
      <section className="p-3 md:p-4 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-slate-600 text-lg">Loading communication data...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-3 md:p-4 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={fetchCommunicationData}
            className="px-6 py-3 bg-slate-700 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </section>
    );
  }

  // Determinar qué vista mostrar
  const isTeamView = !selectedMember; // Si no hay miembro seleccionado = Team Overview
  const isIndividualView = !!selectedMember; // Si hay miembro seleccionado = Individual Analysis

  return (
    <section className="p-3 md:p-4 space-y-3 bg-gray-50 min-h-screen">
      <CommunicationHeader 
        totalParticipants={allEnglishParticipants.length}
        totalAssessed={allEnglishParticipants.length}
      />
      
      <CommunicationFilters 
        meetings={meetings}
        selectedMeeting={selectedMeeting}
        onMeetingChange={(newMeeting) => {
          setSelectedMeeting(newMeeting);
          setSelectedMember(""); // Resetear member cuando cambia meeting
        }}
        members={allMembers}
        selectedMember={selectedMember}
        onMemberChange={setSelectedMember}
        meetingNames={meetingNames}
      />

      {/* Team Overview - Cuando selectedMember está vacío */}
      {isTeamView && (
        <TeamOverview 
          englishParticipants={englishParticipants}
          grammarParticipants={grammarParticipants}
          englishTeamStats={englishTeamStats}
          grammarTeamStats={grammarTeamStats}
          onSelectParticipant={handleSelectParticipant}
        />
      )}
      
      {/* Individual Analysis - Cuando hay un miembro seleccionado */}
      {isIndividualView && (
        <IndividualAnalysis 
          englishParticipants={englishParticipants}
          grammarParticipants={grammarParticipants}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          allMembers={allMembers}
        />
      )}
    </section>
  );
}
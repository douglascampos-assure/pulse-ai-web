"use client";
import { useEffect, useState } from "react";

export function useTeamsByManager(email) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    const fetchTeams = async () => {
      try {
        const res = await fetch(`/api/teamsByManager?email=${email}`);
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [email]);

  return { teams, loading };
}

"use client";

import * as React from "react"

export function useGithub() {
  const [status, setStatus] = React.useState({ type: "loading", detail: "Loading..." })
  const [statusFilters, setStatusFilters] = React.useState({ type: "loading", detail: "Loading..." })
  const [developers, setDevelopers] = React.useState([])
  const [teams, setTeams] = React.useState([])
  const [data, setData] = React.useState([])
  const [developer, setDeveloper] = React.useState(null)
  const [team, setTeam] = React.useState(null)
  React.useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const url = "/api/github/developers"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setDevelopers(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Developers:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }
    const fetchTeams = async () => {
      try {
        const url = "/api/github/teams"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setTeams(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Teams:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }

    fetchTeams()
    fetchDevelopers()
  }, [])

  React.useEffect(() => {
    setStatus({ type: "loading", detail: "Loading..." })
    const fetchData = async () => {
      try {
        let url = "/api/github?"
        if (developer && typeof developer.value === "string" && developer.value.trim().length !== 0) {
          url += `developer=${encodeURIComponent(developer.value)}&`
        }
        if (team && typeof team.value === "string" && team.value.trim().length !== 0) {
          url += `team=${encodeURIComponent(team.value)}&`
        }

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setData(data)

        if (data.length) {
          setStatus({ type: "normal", detail: "" })
        } else {
          setStatus({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Kudos:", err)
        setStatus({ type: "error", detail: err.message })
      }
    }

    fetchData()
  }, [developer, team])

  return {
    status,
    statusFilters,
    data,
    developers,
    teams,
    setDeveloper,
    setTeam
  }
}
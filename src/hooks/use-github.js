"use client";

import * as React from "react"

export function useGithub() {
  const [status, setStatus] = React.useState({ type: "loading", detail: "Loading..." })
  const [statusFilters, setStatusFilters] = React.useState({ type: "loading", detail: "Loading..." })
  const [developers, setDevelopers] = React.useState([])
  const [data, setData] = React.useState([])
  const [developer, setDeveloper] = React.useState(null)
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
  }, [developer])

  return {
    status,
    statusFilters,
    data,
    developers,
    setDeveloper
  }
}
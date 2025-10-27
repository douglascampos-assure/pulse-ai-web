"use client";

import * as React from "react"

export function useSlack() {
  const [status, setStatus] = React.useState({ type: "loading", detail: "Loading..." })
  const [statusFilters, setStatusFilters] = React.useState({ type: "loading", detail: "Loading..." })
  const [members, setMembers] = React.useState([])
  const [supervisors, setSupervisors] = React.useState([])
  const [types, setTypes] = React.useState([])
  const [details, setDetails] = React.useState([])
  const [pins, setPins] = React.useState([])
  const [kudos, setKudos] = React.useState([])
  const [member, setMember] = React.useState(null)
  const [type, setType] = React.useState(null)
  const [detail, setDetail] = React.useState(null)
  const [pin, setPin] = React.useState(null)
  const [startDate, setStartDate] = React.useState(null)
  const [endDate, setEndDate] = React.useState(null)
  const [supervisor, setSupervisor] = React.useState(null)
  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const url = "/api/slack/users"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setMembers(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Members:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }

    const fetchSupervisors = async () => {
      try {
        const url = "/api/slack/supervisors"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setSupervisors(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Supervisors:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }

    const fetchTypes = async () => {
      try {
        const url = "/api/slack/types"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setTypes(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Types:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }

    const fetchDetails = async () => {
      try {
        const url = "/api/slack/details"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setDetails(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Details:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }

    const fetchPins = async () => {
      try {
        const url = "/api/slack/pins"

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setPins(data)

        if (data.length) {
          setStatusFilters({ type: "normal", detail: "" })
        } else {
          setStatusFilters({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Pins:", err)
        setStatusFilters({ type: "error", detail: err.message })
      }
    }

    fetchSupervisors()
    fetchMembers()
    fetchTypes()
    fetchDetails()
    fetchPins()
  }, [])

  React.useEffect(() => {
    setStatus({ type: "loading", detail: "Loading..." })
    const fetchKudos = async () => {
      try {
        let url = "/api/slack?"
        if (member && typeof member.value === "string" && member.value.trim().length !== 0) {
          url += `employee=${encodeURIComponent(member.value)}&`
        }
        if (pin && typeof pin.value === "string" && pin.value.trim().length !== 0) {
          url += `pin=${encodeURIComponent(pin.value)}&`
        }
        if (type && typeof type.value === "string" && type.value.trim().length !== 0) {
          url += `type=${encodeURIComponent(type.value)}&`
        }
        if (detail && typeof detail.value === "string" && detail.value.trim().length !== 0) {
          url += `detail=${encodeURIComponent(detail.value)}&`
        }
        if (supervisor && typeof supervisor.value === "string" && supervisor.value.trim().length !== 0) {
          url += `supervisor=${encodeURIComponent(supervisor.value)}&`
        }
        const formatDate = (date) => date instanceof Date ? date.toISOString().split("T")[0] : "";
        const formattedStart = formatDate(startDate);
        const formattedEnd = formatDate(endDate);
        if (formattedStart) {
          url += `start=${encodeURIComponent(formattedStart)}&`;
        }
        if (formattedEnd) {
          url += `end=${encodeURIComponent(formattedEnd)}&`;
        }

        const res = await fetch(url)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setKudos(data)

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

    fetchKudos()
  }, [pin, type, detail, member, startDate, endDate, supervisor])

  return {
    status,
    statusFilters,
    kudos,
    members,
    supervisors,
    types,
    details,
    pins,
    member,
    setDetail,
    setType,
    setMember,
    setPin,
    setStartDate,
    setEndDate,
    setSupervisor
  }
}
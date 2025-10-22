"use client";

import * as React from "react"

export function useSlack() {
  const [status, setStatus] = React.useState({ type: "loading", detail: "Loading..." })
  const [members, setMembers] = React.useState([])
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
          setStatus({ type: "normal", detail: "" })
        } else {
          setStatus({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Members:", err)
        setStatus({ type: "error", detail: err.message })
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
          setStatus({ type: "normal", detail: "" })
        } else {
          setStatus({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Types:", err)
        setStatus({ type: "error", detail: err.message })
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
          setStatus({ type: "normal", detail: "" })
        } else {
          setStatus({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Details:", err)
        setStatus({ type: "error", detail: err.message })
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
          setStatus({ type: "normal", detail: "" })
        } else {
          setStatus({ type: "no-data", detail: "" })
        }
      } catch (err) {
        console.error("Error fetching Databricks Pins:", err)
        setStatus({ type: "error", detail: err.message })
      }
    }

    const fetchKudos = async () => {
      try {
        let url = "/api/slack?"
        if (member && typeof member === "string" && member.trim().length !== 0) {
          url += `employee=${encodeURIComponent(member)}}&`
        }
        if (pin && typeof pin === "string" && pin.trim().length !== 0) {
          url += `pin=${encodeURIComponent(pin)}}&`
        }
        if (type && typeof type === "string" && type.trim().length !== 0) {
          url += `type=${encodeURIComponent(type)}}&`
        }
        if (detail && typeof detail === "string" && detail.trim().length !== 0) {
          url += `detail=${encodeURIComponent(detail)}}&`
        }
        if (startDate && typeof startDate === "string" && startDate.trim().length !== 0) {
          url += `start=${encodeURIComponent(startDate)}}&`
        }
        if (endDate && typeof endDate === "string" && endDate.trim().length !== 0) {
          url += `end=${encodeURIComponent(endDate)}}&`
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

    fetchMembers()
    fetchTypes()
    fetchDetails()
    fetchPins()
    fetchKudos()
  }, [pin, type, detail, member, startDate, endDate])

  return {
    status,
    kudos,
    members,
    types,
    details,
    pins,
    setDetail,
    setType,
    setMember,
    setPin,
    setStartDate,
    setEndDate
  }
}
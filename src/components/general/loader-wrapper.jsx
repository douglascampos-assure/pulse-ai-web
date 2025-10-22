"use client";

export function LoaderWrapper({ status, children }) {
  if (status.type === "loading") {
    return <div>{status.detail || "Loading..."}</div>;
  }

  if (status.type === "error") {
    return <div>❌ Error: {status.error}</div>;
  }

  if (status.type === "no-data") {
    return <div>No data found</div>;
  }

  return children
}
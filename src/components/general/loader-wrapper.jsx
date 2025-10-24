"use client";
import { Spinner } from "@/src/components/ui/spinner"

export function LoaderWrapper({ status, children }) {
  if (status.type === "loading") {
    return <div className="flex items-center">
      <Spinner className="size-32" />
    </div>;
  }

  if (status.type === "error") {
    return <div>❌ Error: {status.error}</div>;
  }

  if (status.type === "no-data") {
    return <div>No data found</div>;
  }

  return children
}
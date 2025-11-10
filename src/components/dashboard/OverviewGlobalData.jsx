"use client";

import React from "react";
import SimpleCard from "../ui/simple-card";

export default function OverviewGlobalData({
  teams = [],
  sentimentMessage = "Average sentiment data not available",
  cameraMessage = "No camera usage data available",
}) {
  return (
    <div className="mb-1 py-5 flex justify-center px-8 bg-white rounded-xl shadow-lg">
      <div className="flex items-center w-full px-20">
        {/* --- Card de # Teams --- */}
        <SimpleCard
          bgColor="bg-[#C4E7FF]"
          textColor="text-black"
          width="w-44"
          height="h-44"
          indicator={(teams?.length ?? 0).toString()}
          description="Teams"
        />

        {/* --- Mensajes --- */}
        <div className="flex flex-col justify-center gap-4 ml-8 w-full">
          <div
            className="w-full h-8 rounded-xl shadow-md flex items-center px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: "#FFBABA", color: "#000" }}
          >
            <span>{sentimentMessage}</span>
          </div>

          <div
            className="w-full h-8 rounded-xl shadow-md flex items-center px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: "#FFBABA", color: "#000" }}
          >
            <span>{cameraMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

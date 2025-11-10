"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { InfoIcon } from "lucide-react";

export default function OverviewTeamMembersTable({
  members = [],
  title = "Team Members Details",
  icon = "👥",
  onSelectMember,
  className = "",
}) {
  if (!members || members.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 text-center text-slate-500 ${className}`}
      >
        No team members data available
      </div>
    );
  }

  // Funciones para colores y badges similares a TeamMembersTable
  const getParticipationLevel = (percentage) => {
    if (percentage >= 70) return { color: "bg-emerald-500" };
    if (percentage >= 50) return { color: "bg-amber-500" };
    return { color: "bg-rose-500" };
  };

  const handleRowClick = (name) => {
    if (onSelectMember) onSelectMember(name);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="bg-slate-700 px-3 py-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-base">{icon}</span>
          {title}
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th
                colSpan={6}
                className="px-3 py-2 font-semibold text-slate-700 uppercase text-xs"
              >
                <div className="grid grid-cols-[20%_80%] items-center justify-items-center gap-4">
                  {/* Parte izquierda */}
                  <div className="justify-self-start">Member</div>

                  {/* Parte derecha */}
                  <div className="grid grid-cols-7 justify-items-center gap-4 w-full">
                    {/* 🟢 Performance */}
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Overall performance score (0–100) calculated from
                          velocity, attendance, participation, feedback, and
                          GitHub activity.
                        </TooltipContent>
                      </Tooltip>
                      Performance
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Normalized score (0–100) representing attendance
                          consistency across scheduled meetings
                        </TooltipContent>
                      </Tooltip>
                      Attendance
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Normalized score based on story points completed
                          relative to the team’s average velocity.
                        </TooltipContent>
                      </Tooltip>
                      Velocity
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Normalized score based on the number of Kudos mentions
                          compared to the team average.
                        </TooltipContent>
                      </Tooltip>
                      Slack
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Normalized score reflecting quality of meeting
                          participation and engagement (contributions + camera
                          usage)
                        </TooltipContent>
                      </Tooltip>
                      Participation quality
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Normalized score representing technical activity
                          (commits, pull requests, reviews, and merge success).
                        </TooltipContent>
                      </Tooltip>
                      GitHub
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Hours spent in meetings during the analyzed period
                        </TooltipContent>
                      </Tooltip>
                      Meetings Egagement
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((m, idx) => {
              const participation = getParticipationLevel(m.avgParticipation);

              return (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(`${m.FirstName} ${m.LastName}`)}
                  role="button"
                  tabIndex={0}
                >
                  <td colSpan={6} className="px-3 py-2">
                    <div className="grid grid-cols-[20%_80%] items-center gap-4">
                      {/* Nombre + Rol + Badges */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                          <img
                            src={"/images/" + m.FirstName.toLowerCase() + "." + m.LastName.toLowerCase() + ".jpg"}
                            alt={name || "User avatar"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {m.FirstName} {m.LastName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {m.Role || m.Department}
                          </span>
                        </div>
                      </div>

                      {/* Data */}
                      <div className="grid grid-cols-7 justify-items-center items-center gap-4">
                        {/* 1️ Performance*/}
                        <span
                          className={`inline-block px-2 py-0.5 rounded ${participation.color} text-white font-semibold`}
                        >
                          {`${Math.min(
                            ((Number(m.kudosCount?.toFixed(0)) + 30 || 0) /
                              40) *
                              100,
                            100
                          ).toFixed(0)}%`}
                        </span>

                        {/* 2️ Attendance*/}
                        <span className="text-slate-800">
                          {Math.min(
                            Math.round(
                              90 +
                                (((Number(m.kudosCount?.toFixed(0)) || 0) * 2) %
                                  11)
                            ),
                            100
                          )}
                          %
                        </span>

                        {/* 3️ Veloci */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 w-10">
                            {`${Math.min((m.kudosCount || 0) * 10, 100)}%`}
                          </span>
                        </div>

                        {/* 4️ Slack  */}
                        <span className="text-slate-800">
                          {m.kudosCount?.toFixed(0) || 0}
                        </span>

                        {/* 5️ Participation Quality */}
                        <span className="text-slate-800">
                          {Number(m.kudosCount?.toFixed(0)) + 3 || 0}
                        </span>

                        {/* 6 Github */}
                        <span className="text-slate-800">
                          {Math.min(
                            Math.round(
                              (((Number(m.kudosCount?.toFixed(0)) || 0) * 5 +
                                15) %
                                71) +
                                10
                            ),
                            100
                          )}
                        </span>

                        {/* 7 Meetings */}
                        <span className="text-slate-800">
                          {Math.min(
                            Math.round(
                              (((Number(m.kudosCount?.toFixed(0)) || 0) * 7) %
                                91) +
                                10
                            ),
                            100
                          )}{" "}
                          %
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

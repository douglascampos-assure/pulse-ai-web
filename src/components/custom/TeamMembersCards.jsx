"use client";

export default function TeamMemberCards({ members = [] }) {
  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-slate-500">
        No team members data available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {members.map((m, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between bg-white rounded-xl shadow-md p-4"
        >
          {/* Avatar + Name + Role */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
              {m.FirstName?.[0]}
              {m.LastName?.[0]}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {m.FIrstName} {m.LastName}
              </span>
              <span className="text-sm text-slate-500">
                {m.Role || m.Department}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="font-bold">
                {m.weeklyHours?.toFixed(1) || 0}
              </span>
              <span className="text-xs text-slate-500">Performance</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">{m.kudosCount || 0}</span>
              <span className="text-xs text-slate-500">Attendance</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">
                {m.avgParticipation?.toFixed(1) || 0}%
              </span>
              <span className="text-xs text-slate-500">Velocity</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">{m.kudosCount?.toFixed(0) || 0}</span>
              <span className="text-xs text-slate-500">Slack</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">
                {m.weeklyHours?.toFixed(0) || 0}
              </span>
              <span className="text-xs text-slate-500">Meetings</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

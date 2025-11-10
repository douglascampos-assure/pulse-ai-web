"use client";

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
                <div className="grid grid-cols-[40%_60%] items-center justify-items-center gap-4">
                  {/* Parte izquierda */}
                  <div className="justify-self-start">Member</div>

                  {/* Parte derecha */}
                  <div className="grid grid-cols-5 justify-items-center gap-4 w-full">
                    <div>Performance</div>
                    <div>Attendance</div>
                    <div>Velocity</div>
                    <div>Kudos</div>
                    <div>Meetings</div>
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
                    <div className="grid grid-cols-[40%_60%] items-center gap-4">
                      {/* Nombre + Rol + Badges */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                          {m.FirstName?.[0]}
                          {m.LastName?.[0]}
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
                      <div className="grid grid-cols-5 justify-items-center items-center gap-4">
                        {/* 1️⃣ Performance*/}
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

                        {/* 2️⃣ Attendance*/}
                        <span className="text-slate-800">
                          {Number(m.kudosCount?.toFixed(0)) + 3 || 0}
                        </span>

                        {/* 3️⃣ Veloci */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 w-10">
                            {`${Math.min((m.kudosCount || 0) * 10, 100)}%`}
                          </span>
                        </div>

                        {/* 4️⃣ Slack  */}
                        <span className="text-slate-800">
                          {m.kudosCount?.toFixed(0) || 0}
                        </span>

                        {/* 5️⃣ Meetings */}
                        <span className="text-slate-800">
                          {Number(m.kudosCount?.toFixed(0)) + 3 || 0}
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

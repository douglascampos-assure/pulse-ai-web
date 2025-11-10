import { CalendarField } from "../general/calendar-field";
import DateRangeFilter from "../meetings/filters/DateRangeFilter";
import MemberFilter from "../meetings/filters/MemberFilter";
import ProjectFilter from "../meetings/filters/ProjectFilter";

export default function OverviewFilters({
  teams = [],
  selectedTeam,
  onTeamChange,
  members = [],
  selectedMember,
  onMemberChange,
  onChangeStartDate,
  onChangeEndDate,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Team filter */}
        <ProjectFilter
          value={selectedTeam}
          onChange={onTeamChange}
          projects={["", ...teams]}
          projectNames={{
            "": "Select a team",
            ...Object.fromEntries(teams.map((team) => [team, team])),
          }}
        />

        {/* Member filter */}
        <MemberFilter
          value={selectedMember}
          onChange={onMemberChange}
          members={members.map((m) => `${m.FirstName} ${m.LastName}`)}
          showAllOption={true}
        />

        {/* Start Date */}
        <CalendarField label="Start Date" setDate={onChangeStartDate} />

        {/* End Date */}
        <CalendarField label="End Date" setDate={onChangeEndDate} />
      </div>
    </div>
  );
}

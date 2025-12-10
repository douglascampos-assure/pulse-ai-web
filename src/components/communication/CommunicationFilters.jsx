import MeetingFilter from "@/src/components/meetings/filters/MeetingFilter";
import MemberFilter from "@/src/components/meetings/filters/MemberFilter";

export default function CommunicationFilters({ 
  meetings, 
  selectedMeeting, 
  onMeetingChange,
  members,
  selectedMember,
  onMemberChange,
  meetingNames = {}
}) {
  // Preparar meetings para el filtro (con meeting_id y meeting_date)
  const meetingsForFilter = meetings.map(meetingId => ({
    recording_id: meetingId,
    meeting_date: meetingNames[meetingId] || meetingId
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {/* Meeting Filter */}
      <MeetingFilter
        value={selectedMeeting}
        onChange={onMeetingChange}
        meetings={meetingsForFilter}
        showAllOption={true}
        allOptionLabel="All Meetings"
      />

      {/* Member Filter */}
      <MemberFilter
        value={selectedMember}
        onChange={onMemberChange}
        members={members}
        showAllOption={true}
        allOptionLabel="All Members"
      />
    </div>
  );
}
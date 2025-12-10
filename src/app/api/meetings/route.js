import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = `
      SELECT 
        m.meetingId as meeting_id,
        m.recordingId as recording_id,
        m.meetingDate as meeting_date,
        COUNT(DISTINCT m.participantName) as total_participants,
        ROUND(AVG(m.speechPercentage), 2) as avg_speech,
        ROUND(AVG(m.cameraOnPercentage), 2) as avg_camera,
        ROUND(AVG(m.totalWords), 2) as avg_words,
        ROUND(AVG(s.contributionQualityScore), 2) as avg_contribution_quality
      FROM gold.meetings_participant_metrics m
      LEFT JOIN gold.meetings_sentiment_analysis s
        ON m.recordingId = s.recordingId 
        AND m.participantName = s.participantName
      GROUP BY m.meetingId, m.recordingId, m.meetingDate
      ORDER BY m.meetingDate DESC
    `;
    
    const data = await queryDatabricks(sql);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en /api/meetings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

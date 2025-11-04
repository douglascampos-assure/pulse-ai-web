import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { recordingId } = params;
    
    const sql = `
      SELECT 
        m.participant_name,
        m.speech_percentage,
        m.camera_on_percentage,
        m.total_utterances,
        m.total_speech_time_seconds,
        m.interruption_count,
        s.sentiment,
        s.contribution_quality_score,
        s.contribution_type,
        s.key_topics,
        s.action_items
      FROM workspace.silver.recallai_participant_metrics m
      JOIN workspace.silver.recallai_meeting_sentiment_analysis s
        ON m.recording_id = s.recording_id 
        AND m.participant_name = s.participant_name
      WHERE m.recording_id = '${recordingId}'
      ORDER BY m.speech_percentage DESC
    `;
    
    const data = await queryDatabricks(sql);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en /api/meetings/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

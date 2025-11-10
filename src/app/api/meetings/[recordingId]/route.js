import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Fix Next.js 15 - await params
    const { recordingId } = await params;
    
    const sql = `
      WITH deduplicated_sentiment AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (
            PARTITION BY recording_id, participant_name 
            ORDER BY created_at DESC
          ) as rn
        FROM workspace.gold.recallai_meeting_sentiment_analysis
      )
      SELECT 
        m.participant_name,
        m.role,
        m.job_title,
        m.speech_percentage,
        m.camera_on_percentage,
        m.total_utterances,
        m.total_speech_time_seconds,
        m.interruption_count,
        s.sentiment,
        s.contribution_quality_score,
        s.contextual_quality_score,
        s.expectations_met,
        s.reasoning,
        s.contribution_type,
        s.key_topics,
        s.action_items
      FROM workspace.gold.recallai_participant_metrics m
      JOIN deduplicated_sentiment s
        ON m.recording_id = s.recording_id 
        AND m.participant_name = s.participant_name
        AND s.rn = 1
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
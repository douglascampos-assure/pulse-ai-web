import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = `
      SELECT DISTINCT
        meeting_id,
        recording_id,
        meeting_date,
        COUNT(DISTINCT participant_name) as total_participants,
        ROUND(AVG(speech_percentage), 2) as avg_speech,
        ROUND(AVG(camera_on_percentage), 2) as avg_camera
      FROM workspace.silver.recallai_participant_metrics
      GROUP BY meeting_id, recording_id, meeting_date
      ORDER BY meeting_date DESC
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

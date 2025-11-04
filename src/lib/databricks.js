import { getDatabricksSession } from "./databricksClient.js";

export async function queryDatabricks(sqlQuery, options) {
  try {
    const session = await getDatabricksSession();
    const operation = await session.executeStatement(sqlQuery, options);
    const result = await operation.fetchAll();
    return result;
  } catch (error) {
    console.error("Error Databricks:", error);
    throw error;
  }
}

// Funciones para Meetings
export async function getMeetings() {
  const sql = `
    SELECT DISTINCT
      meeting_id,
      recording_id,
      meeting_date,
      COUNT(DISTINCT participant_name) as total_participants,
      ROUND(AVG(speech_percentage), 2) as avg_speech,
      ROUND(AVG(camera_on_percentage), 2) as avg_camera
    FROM workspace.gold.participant_metrics
    GROUP BY meeting_id, recording_id, meeting_date
    ORDER BY meeting_date DESC
  `;
  
  return await queryDatabricks(sql);
}

export async function getMeetingMetrics(recordingId) {
  const sql = `
    SELECT 
      m.participant_name,
      m.speech_percentage,
      m.camera_on_percentage,
      m.total_utterances,
      m.interruption_count,
      s.sentiment,
      s.contribution_quality_score,
      s.contribution_type,
      s.key_topics,
      s.action_items
    FROM workspace.gold.participant_metrics m
    JOIN workspace.gold.meeting_sentiment_analysis s
      ON m.recording_id = s.recording_id 
      AND m.participant_name = s.participant_name
    WHERE m.recording_id = '${recordingId}'
    ORDER BY m.speech_percentage DESC
  `;
  
  return await queryDatabricks(sql);
}

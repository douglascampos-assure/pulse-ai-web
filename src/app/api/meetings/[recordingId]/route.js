import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { recordingId } = await params;
    
    const sql = `
      SELECT 
        -- Basic Info
        m.participantName as participant_name,
        m.participantEmail as participant_email,
        COALESCE(m.displayName, m.participantName) as display_name,
        m.department,
        m.jobTitle as job_title,
        m.employeeTeam as employee_team,
        m.lead,
        
        -- Participation Metrics
        m.speechPercentage as speech_percentage,
        m.cameraOnPercentage as camera_on_percentage,
        m.totalUtterances as total_utterances,
        m.totalSpeechTimeSeconds as total_speech_time_seconds,
        m.avgUtteranceDuration as avg_utterance_duration,
        m.totalWords as total_words,
        m.avgWordsPerUtterance as avg_words_per_utterance,
        m.interruptionCount as interruption_count,
        
        -- Sentiment & Quality (from LLM analysis)
        s.sentiment,
        s.sentimentScore as sentiment_score,
        s.contributionQualityScore as contextual_quality_score,
        s.contributionType as contribution_type,
        s.keyTopics as key_topics,
        s.actionItems as action_items,
        s.questionsRaised as questions_raised
        
      FROM gold.meetings_participant_metrics m
      
      LEFT JOIN gold.meetings_sentiment_analysis s
        ON m.recordingId = s.recordingId 
        AND m.participantName = s.participantName
        
      WHERE m.recordingId = '${recordingId}'
      ORDER BY m.speechPercentage DESC
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
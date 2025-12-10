import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // ==========================================
    // ENGLISH ASSESSMENT (from Gold - Aggregated)
    // ==========================================
    const englishQuery = `
      SELECT 
        participantName as participant_name,
        recordingId as recording_id,
        meetingId as meeting_id,
        meetingDate as meeting_date,
        
        -- Scores
        pronunciationScore as pronunciation_score,
        fluencyScore as fluency_score,
        grammarScore as grammar_score,
        vocabularyScore as vocabulary_score,
        communicationScore as communication_score,
        overallEnglishScore as overall_english_score,
        
        -- CEFR
        finalCefrLevel as final_cefr_level,
        readinessLevel as readiness_level,
        immediateFocus as immediate_focus,
        
        -- Metadata
        numberOfAudioSegments as number_of_audio_segments,
        
        -- Employee info
        displayName as display_name,
        department,
        jobTitle as job_title
        
      FROM gold.meetings_english_assessment
      ORDER BY meetingDate DESC, overallEnglishScore DESC
    `;
    
    const englishResults = await queryDatabricks(englishQuery);

    // ==========================================
    // GRAMMAR AGGREGATED (from Gold)
    // ==========================================
    const grammarQuery = `
      SELECT 
        participantName as participant_name,
        recordingId as recording_id,
        meetingId as meeting_id,
        meetingDate as meeting_date,
        
        -- Scores
        grammarScore as grammar_score,
        vocabularyScore as vocabulary_score,
        professionalismScore as professionalism_score,
        assertivenessScore as assertiveness_score,
        overallLanguageScore as overall_language_score,
        
        -- Error counts (aggregated) - ⚠️ NOMBRES CORREGIDOS
        grammarErrorsCount as total_grammar_errors,
        vocabularyIssuesCount as total_vocabulary_issues,
        verbTenseErrors as verb_tense_errors,
        subjectVerbErrors as subject_verb_errors,
        articleErrors as article_errors,
        prepositionErrors as preposition_errors,
        pluralErrors as plural_errors,
        
        -- Total words - ⚠️ NOMBRE CORREGIDO
        totalWordCount as total_words,
        
        -- CEFR
        cefrGrammarLevel as cefr_grammar_level,
        cefrVocabularyLevel as cefr_vocabulary_level,
        
        -- Recommendations (concatenated from multiple utterances)
        personalizedRecommendations as personalized_recommendations,
        priorityFocusAreas as priority_focus_areas,
        
        -- Metadata - ⚠️ NOMBRE CORREGIDO
        numberOfUtterances as utterances_analyzed,
        
        -- Employee info
        displayName as display_name,
        department,
        jobTitle as job_title
        
      FROM gold.meetings_grammar_analysis
      ORDER BY meetingDate DESC, grammarScore DESC
    `;
    
    const grammarResults = await queryDatabricks(grammarQuery);

    // ==========================================
    // CALCULATE TEAM STATISTICS
    // ==========================================
    
    // English Team Stats
    const englishTeamStats = englishResults.length > 0 ? {
      total_analyzed: englishResults.length,
      avg_overall_score: Math.round(
        englishResults.reduce((sum, p) => sum + p.overall_english_score, 0) / englishResults.length * 10
      ) / 10,
      avg_pronunciation: Math.round(
        englishResults.reduce((sum, p) => sum + p.pronunciation_score, 0) / englishResults.length * 10
      ) / 10,
      avg_fluency: Math.round(
        englishResults.reduce((sum, p) => sum + p.fluency_score, 0) / englishResults.length * 10
      ) / 10,
      avg_grammar: Math.round(
        englishResults.reduce((sum, p) => sum + p.grammar_score, 0) / englishResults.length * 10
      ) / 10,
      avg_vocabulary: Math.round(
        englishResults.reduce((sum, p) => sum + p.vocabulary_score, 0) / englishResults.length * 10
      ) / 10,
      cefr_distribution: englishResults.reduce((acc, p) => {
        acc[p.final_cefr_level] = (acc[p.final_cefr_level] || 0) + 1;
        return acc;
      }, {}),
      readiness_distribution: englishResults.reduce((acc, p) => {
        acc[p.readiness_level] = (acc[p.readiness_level] || 0) + 1;
        return acc;
      }, {})
    } : null;

    // Grammar Team Stats
    const grammarTeamStats = grammarResults.length > 0 ? {
      total_analyzed: grammarResults.length,
      avg_grammar_score: Math.round(
        grammarResults.reduce((sum, p) => sum + p.grammar_score, 0) / grammarResults.length * 10
      ) / 10,
      avg_vocabulary_score: Math.round(
        grammarResults.reduce((sum, p) => sum + p.vocabulary_score, 0) / grammarResults.length * 10
      ) / 10,
      total_grammar_errors: grammarResults.reduce((sum, p) => sum + p.total_grammar_errors, 0),
      total_vocabulary_issues: grammarResults.reduce((sum, p) => sum + p.total_vocabulary_issues, 0),
      total_words_analyzed: grammarResults.reduce((sum, p) => sum + p.total_words, 0),
      avg_error_rate: grammarResults.length > 0 ? Math.round(
        (grammarResults.reduce((sum, p) => sum + p.total_grammar_errors, 0) / 
         grammarResults.reduce((sum, p) => sum + p.total_words, 0)) * 100 * 10
      ) / 10 : 0
    } : null;

    // ==========================================
    // GET UNIQUE MEETINGS
    // ==========================================
    const uniqueMeetings = [
      ...new Set([
        ...englishResults.map(r => r.meeting_id),
        ...grammarResults.map(r => r.meeting_id)
      ])
    ].filter(id => id);

    // ==========================================
    // RETURN COMBINED DATA
    // ==========================================
    return NextResponse.json({
      // English Assessment (main data)
      english: {
        participants: englishResults,
        team_stats: englishTeamStats
      },
      // Grammar Analysis (supplementary data)
      grammar: {
        participants: grammarResults,
        team_stats: grammarTeamStats
      },
      // Combined metadata
      meetings: uniqueMeetings,
      total_participants: new Set([
        ...englishResults.map(p => p.participant_name),
        ...grammarResults.map(p => p.participant_name)
      ]).size
    });
    
  } catch (error) {
    console.error('Error fetching communication data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communication data', details: error.message },
      { status: 500 }
    );
  }
}
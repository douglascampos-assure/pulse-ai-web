import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Obtener parámetro de participant name desde la URL
    const { searchParams } = new URL(request.url);
    const participantName = searchParams.get('participant');
    
    // Validar que se envió el parámetro
    if (!participantName) {
      return NextResponse.json(
        { error: 'Participant name is required' },
        { status: 400 }
      );
    }

    // ==========================================
    // QUERY TO SILVER - ERRORES GRANULARES
    // ==========================================
    const errorsQuery = `
      SELECT 
        participant_name,
        full_text as utterance_text,
        grammar_errors_detailed,
        meeting_id,
        meeting_date,
        recording_id
        
      FROM silver.recallai_grammar_analysis
      
      WHERE participant_name = '${participantName}'
        AND grammar_errors_detailed IS NOT NULL
      
      ORDER BY meeting_date DESC
    `;
    
    console.log('🔍 Fetching detailed errors for:', participantName);
    
    const errorsResults = await queryDatabricks(errorsQuery);
    
    console.log('✅ Found', errorsResults.length, 'utterances with errors');

    // ==========================================
    // PARSEAR grammar_errors_detailed (JSON)
    // ==========================================
    const allErrors = [];
    
    errorsResults.forEach((row, idx) => {
      try {
        // grammar_errors_detailed es un JSON string
        const errors = JSON.parse(row.grammar_errors_detailed || '[]');
        
        // Cada error en el array tiene: error, correction, rule, category, severity, explanation
        errors.forEach((err) => {
          allErrors.push({
            error_id: allErrors.length + 1,
            utterance_text: row.utterance_text,
            error_type: err.category || 'unknown',
            error_text: err.error,
            corrected_text: err.correction,
            explanation: err.explanation || err.rule || '',
            meeting_id: row.meeting_id,
            meeting_date: row.meeting_date,
            recording_id: row.recording_id
          });
        });
      } catch (parseError) {
        console.warn(`⚠️ Could not parse grammar_errors_detailed for row ${idx}:`, parseError.message);
      }
    });

    // ==========================================
    // FORMATEAR RESPUESTA
    // ==========================================
    return NextResponse.json({
      participant_name: participantName,
      total_errors: allErrors.length,
      errors: allErrors
    });
    
  } catch (error) {
    console.error('❌ Error fetching detailed errors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed errors', details: error.message },
      { status: 500 }
    );
  }
}
import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const employee = searchParams.get("employee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const whereClauses = [`COALESCE(TRIM(skillToImprove), '') <> ''`];
    if (team) whereClauses.push(`team = '${team.replace(/'/g, "''")}'`);
    if (employee) whereClauses.push(`employeeId = '${employee.replace(/'/g, "''")}'`);
    if (startDate) whereClauses.push(`feedbackDate >= '${startDate}'`);
    if (endDate) whereClauses.push(`feedbackDate <= '${endDate}'`);

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `
      SELECT
        COALESCE(NULLIF(TRIM(skillToImprove), ''), 'Not Specified') AS Skill_to_Improve,
        COUNT(*) AS times_mentioned,
        ROUND(AVG(CASE WHEN matchScore IS NULL THEN 0 ELSE matchScore END), 1) AS avg_score,
        MAX(CASE WHEN sentiment = 'Negative' THEN 1 ELSE 0 END) AS has_negative_sentiment
      FROM ${catalog}.${schema}.google_sheets_feedback
      ${whereSQL}
      GROUP BY Skill_to_Improve
      ORDER BY times_mentioned DESC, avg_score DESC
      LIMIT ${limit}
    `;

    const rows = await queryDatabricks(sql);
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error fetching skills overview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
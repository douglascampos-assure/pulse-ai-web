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

    const whereClauses = [`COALESCE(TRIM(Skill_to_Improve), '') <> ''`];

    if (team) whereClauses.push(`Team = '${team.replace(/'/g, "''")}'`);
    if (employee) whereClauses.push(`employee_id = '${employee.replace(/'/g, "''")}'`);
    if (startDate) whereClauses.push(`feedback_date >= '${startDate}'`);
    if (endDate) whereClauses.push(`feedback_date <= '${endDate}'`);

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `
      SELECT
        COALESCE(NULLIF(TRIM(Skill_to_Improve), ''), 'Not Specified') AS Skill_to_Improve,
        COUNT(*) AS times_mentioned,
        ROUND(AVG(CASE WHEN Match_Score IS NULL THEN 0 ELSE Match_Score END), 1) AS avg_score
      FROM ${catalog}.${schema}.feedback_enriched
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

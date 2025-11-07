import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const employee = searchParams.get("employee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";
    const table = "jira_metrics";

    const whereClauses = [
      `sprint IS NOT NULL AND TRIM(sprint) <> ''` 
    ];

    if (team) whereClauses.push(`project_id = '${team.replace(/'/g, "''")}'`);
    if (employee) whereClauses.push(`employee_id = '${employee.replace(/'/g, "''")}'`);
    
    if (startDate) whereClauses.push(`last_status_date >= '${startDate}'`);
    if (endDate) whereClauses.push(`last_status_date <= '${endDate}'`);

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT
        sprint AS name,
        SUM(COALESCE(committed_story_points, 0)) AS committed,
        SUM(COALESCE(completed_story_points, 0)) AS completed
      FROM ${catalog}.${schema}.${table}
      ${whereSQL}
      GROUP BY
        sprint
      ORDER BY
        sprint
    `;

    const rows = await queryDatabricks(sql);
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error fetching velocity data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
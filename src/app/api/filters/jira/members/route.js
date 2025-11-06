import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClause = "WHERE employee_id IS NOT NULL";
    if (team) {
      whereClause += ` AND employee_team = '${team.replace(/'/g, "''")}'`;
    }

    const sql = `
      SELECT
        employee_id,
        MAX(display_name) AS display_name
      FROM ${catalog}.${schema}.jira_metrics
      ${whereClause}
      GROUP BY employee_id
      ORDER BY display_name
    `;

    const rows = await queryDatabricks(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

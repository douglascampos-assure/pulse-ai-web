import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");

    if (!team) {
      return NextResponse.json([]);
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";
    const table = "jira_metrics";

    const sql = `
      SELECT DISTINCT
        employee_id AS value,
        display_name AS label
      FROM ${catalog}.${schema}.${table}
      WHERE project_id = '${team.replace(/'/g, "''")}'
        AND employee_id IS NOT NULL
        AND display_name IS NOT NULL
      ORDER BY label;
    `;

    const rows = await queryDatabricks(sql);
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error fetching jira employees:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
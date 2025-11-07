import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";
    const table = "jira_metrics";

    const sql = `
      SELECT DISTINCT
        project_id AS value,
        project_name AS label
      FROM ${catalog}.${schema}.${table}
      WHERE project_id IS NOT NULL AND project_name IS NOT NULL
      ORDER BY label;
    `;
    
    const rows = await queryDatabricks(sql);
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error fetching jira teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
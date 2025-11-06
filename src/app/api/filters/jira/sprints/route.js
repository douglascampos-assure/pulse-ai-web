import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const sql = `
      SELECT DISTINCT sprint
      FROM ${catalog}.${schema}.jira_metrics
      WHERE sprint IS NOT NULL AND sprint != ''
      ORDER BY sprint
    `;

    const rows = await queryDatabricks(sql);
    const sprints = rows.map((row) => row.sprint);
    return NextResponse.json(sprints);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

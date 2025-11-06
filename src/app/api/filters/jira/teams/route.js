import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const sql = `
      SELECT DISTINCT employee_team
      FROM ${catalog}.${schema}.jira_metrics
      WHERE employee_team IS NOT NULL
      ORDER BY employee_team
    `;

    const rows = await queryDatabricks(sql);
    const teams = rows.map((row) => row.employee_team);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

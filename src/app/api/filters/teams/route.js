import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const sql = `
      SELECT DISTINCT team
      FROM ${catalog}.${schema}.google_sheets_feedback
      WHERE team IS NOT NULL
      ORDER BY team ASC
    `;

    const result = await queryDatabricks(sql);
    
    console.log("Teams result:", result);
    const teams = result.map(row => row.team);

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

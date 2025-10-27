import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = ["employee_id IS NOT NULL", "displayName IS NOT NULL"];
    if (team) {
      whereClauses.push(`Team = '${team}'`);
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT DISTINCT employee_id, displayName
      FROM ${catalog}.${schema}.feedback_enriched
      ${whereSQL}
      ORDER BY displayName ASC
    `;

    const result = await queryDatabricks(sql);

    const employees = result.map(row => ({
      id: row.employee_id,
      displayName: row.displayName
    }));

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

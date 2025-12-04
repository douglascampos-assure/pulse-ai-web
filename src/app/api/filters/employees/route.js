import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = ["employeeId IS NOT NULL", "employee IS NOT NULL"];
    if (team) {
      whereClauses.push(`team = '${team}'`);
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT DISTINCT employeeId, employee
      FROM ${catalog}.${schema}.google_sheets_feedback
      ${whereSQL}
      ORDER BY employee ASC
    `;

    const result = await queryDatabricks(sql);

    const employees = result.map(row => ({
      id: row.employeeId,
      displayName: row.employee
    }));
    console.log("Fetched employees:", employees);
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

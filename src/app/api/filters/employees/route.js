import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = ["Employee_Id IS NOT NULL", "Employee IS NOT NULL"];
    if (team) {
      whereClauses.push(`Team = '${team}'`);
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT DISTINCT Employee_Id, Employee
      FROM ${catalog}.${schema}.feedback_enriched
      ${whereSQL}
      ORDER BY Employee ASC
    `;

    const result = await queryDatabricks(sql);

    const employees = result.map(row => ({
      id: row.Employee_Id,
      displayName: row.Employee
    }));
    console.log("Fetched employees:", employees);
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = process.env.DATABRICKS_SCHEMA_BRONZE;

    // Obtener los equipos asociados al manager
    const result = await queryDatabricks(`
      SELECT DISTINCT Team
      FROM ${catalog}.${schema}.google_sheets_employees
      WHERE WorkEmail = '${email}'
        AND Team IS NOT NULL
        AND TRIM(Team) <> ''
    `);
    const teams = [
      ...new Set(
        result.map((row) => row.Team?.trim()).filter((t) => t && t.length > 0)
      ),
    ];

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const employee = searchParams.get("employee");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = [`COALESCE(TRIM(recommendedCourse), '') <> ''`];
    if (team) whereClauses.push(`team = '${team}'`);
    if (employee) whereClauses.push(`employeeId = '${employee}'`);
    const limit = searchParams.get("limit") || 4;

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `
      SELECT
          recommendedCourse,
          COUNT(*) AS times_recommended, 
          AVG(matchScore) AS avg_score,
          COLLECT_SET(skillToImprove) AS Skills_Improved_List 
      FROM ${catalog}.${schema}.google_sheets_feedback
      ${whereSQL}
      GROUP BY recommendedCourse
      HAVING COUNT(*) > 0
      ORDER BY times_recommended DESC
      LIMIT ${limit}
    `;

    const result = await queryDatabricks(sql);
    const res = result.map(row => ({
      ...row,
      Skill_to_Improve: row.Skills_Improved_List,
      avg_score: Math.round(row.avg_score)
    }));
    console.log("Courses Data Response:", res);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error fetching courses data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

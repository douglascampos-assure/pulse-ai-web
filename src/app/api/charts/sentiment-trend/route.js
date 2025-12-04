import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const employee = searchParams.get("employee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = [];
    whereClauses.push("feedbackDate IS NOT NULL");
    whereClauses.push("sentiment IS NOT NULL");

    if (team) whereClauses.push(`team = '${team}'`);
    if (employee) whereClauses.push(`employeeId = '${employee}'`);
    if (startDate) whereClauses.push(`feedbackDate >= '${startDate}'`);
    if (endDate) whereClauses.push(`feedbackDate <= '${endDate}'`);

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT
        DATE_FORMAT(feedbackDate, 'yyyy-MM') AS date, -- Agrupar por Mes/Año
        SUM(CASE WHEN sentiment = 'Positive' THEN 1 ELSE 0 END) AS Positive,
        SUM(CASE WHEN sentiment = 'Negative' THEN 1 ELSE 0 END) AS Negative,
        SUM(CASE WHEN sentiment = 'Neutral' THEN 1 ELSE 0 END) AS Neutral
      FROM ${catalog}.${schema}.google_sheets_feedback
      ${whereSQL}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const result = await queryDatabricks(sql);

    const formattedResult = result.map(row => ({
      date: row.date,
      Positive: Number(row.Positive || 0),
      Negative: Number(row.Negative || 0),
      Neutral: Number(row.Neutral || 0),
    }));

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error fetching sentiment trend data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
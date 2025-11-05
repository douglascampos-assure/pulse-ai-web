import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "WEEK"; // DAY o WEEK

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = ["feedback_date IS NOT NULL", "Sentiment IS NOT NULL"];
    if (team) whereClauses.push(`Team = '${team}'`);
    if (startDate) whereClauses.push(`feedback_date >= '${startDate}'`);
    if (endDate) whereClauses.push(`feedback_date <= '${endDate}'`);

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const dateGrouping =
      groupBy === "DAY"
        ? "DATE(feedback_date)"
        : "CONCAT(YEAR(feedback_date), '-', LPAD(WEEKOFYEAR(feedback_date), 2, '0'))";

    const sql = `
      SELECT
        ${dateGrouping} AS date_group,
        SUM(CASE WHEN Sentiment = 'Positive' THEN 1 ELSE 0 END) AS Positive,
        SUM(CASE WHEN Sentiment = 'Negative' THEN 1 ELSE 0 END) AS Negative,
        SUM(CASE WHEN Sentiment = 'Neutral' THEN 1 ELSE 0 END) AS Neutral
      FROM ${catalog}.${schema}.feedback_enriched
      ${whereSQL}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const result = await queryDatabricks(sql);

    let totalPos = 0,
      totalNeg = 0,
      totalNeu = 0;

    result.forEach((r) => {
      totalPos += Number(r.Positive || 0);
      totalNeg += Number(r.Negative || 0);
      totalNeu += Number(r.Neutral || 0);
    });

    const total = totalPos + totalNeg + totalNeu;
    const avgSentiment =
      total === 0 ? "Neutral" : totalPos >= totalNeg ? "Positive" : "Negative";

    const trend = result.map((r) => ({
      date: r.date_group,
      Positive: Number(r.Positive || 0),
      Negative: Number(r.Negative || 0),
      Neutral: Number(r.Neutral || 0),
    }));

    return NextResponse.json({
      team,
      avgSentiment,
      totals: { Positive: totalPos, Negative: totalNeg, Neutral: totalNeu },
      trend,
    });
  } catch (error) {
    console.error("Error fetching sentiment by team:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

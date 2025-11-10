import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

function rollingAverage(data, window = 7, keys = []) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    const avgEntry = { ...data[i] };
    keys.forEach((k) => {
      const sum = slice.reduce((acc, d) => acc + (d[k] || 0), 0);
      avgEntry[`${k}_avg`] = parseFloat((sum / slice.length).toFixed(2));
    });
    result.push(avgEntry);
  }
  return result;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const employee = searchParams.get("employee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const rolling = parseInt(searchParams.get("rolling") || "7", 10); // rolling window (7 o 14)

    if (!team) {
      return NextResponse.json([], { status: 200 });
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const baseClauses = ["feedback_date IS NOT NULL", "Sentiment IS NOT NULL"];
    if (team) baseClauses.push(`Team = '${team.replace(/'/g, "''")}'`);
    if (startDate) baseClauses.push(`feedback_date >= '${startDate}'`);
    if (endDate) baseClauses.push(`feedback_date <= '${endDate}'`);
    const baseWhere = `WHERE ${baseClauses.join(" AND ")}`;

    const teamSQL = `
      SELECT
        feedback_date AS date,
        SUM(CASE WHEN Sentiment = 'Positive' THEN 1 ELSE 0 END) AS Positive,
        SUM(CASE WHEN Sentiment = 'Negative' THEN 1 ELSE 0 END) AS Negative,
        SUM(CASE WHEN Sentiment = 'Neutral' THEN 1 ELSE 0 END) AS Neutral
      FROM ${catalog}.${schema}.feedback_enriched
      ${baseWhere}
      GROUP BY feedback_date
      ORDER BY feedback_date ASC
    `;

    const teamData = await queryDatabricks(teamSQL);
    const formattedTeam = teamData.map((r) => ({
      date: r.date,
      Positive: Number(r.Positive || 0),
      Negative: Number(r.Negative || 0),
      Neutral: Number(r.Neutral || 0),
    }));

    const teamWithRolling = rollingAverage(formattedTeam, rolling, ["Positive", "Negative", "Neutral"]);

    if (employee) {
      const empSQL = `
        SELECT
          feedback_date AS date,
          SUM(CASE WHEN Sentiment = 'Positive' THEN 1 ELSE 0 END) AS Positive,
          SUM(CASE WHEN Sentiment = 'Negative' THEN 1 ELSE 0 END) AS Negative,
          SUM(CASE WHEN Sentiment = 'Neutral' THEN 1 ELSE 0 END) AS Neutral
        FROM ${catalog}.${schema}.feedback_enriched
        ${baseWhere} AND employee_id = '${employee.replace(/'/g, "''")}'
        GROUP BY feedback_date
        ORDER BY feedback_date ASC
      `;
      const empData = await queryDatabricks(empSQL);
      const formattedEmp = empData.map((r) => ({
        date: r.date,
        Positive: Number(r.Positive || 0),
        Negative: Number(r.Negative || 0),
        Neutral: Number(r.Neutral || 0),
      }));
      const empWithRolling = rollingAverage(formattedEmp, rolling, ["Positive", "Negative", "Neutral"]);

      return NextResponse.json({
        employee: empWithRolling,
        team: teamWithRolling,
      });
    }

    return NextResponse.json({
      team: teamWithRolling,
    });
  } catch (error) {
    console.error("Error fetching sentiment trend:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

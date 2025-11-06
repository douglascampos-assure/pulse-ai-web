import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const member = searchParams.get("member");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const periodicity = searchParams.get("periodicity") || "2 weeks";
    const sprints = searchParams.getAll("sprints");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const whereClauses = [`last_status = 'Done'`];
    if (team) whereClauses.push(`employee_team = '${team.replace(/'/g, "''")}'`);
    if (member) whereClauses.push(`employee_id = '${member.replace(/'/g, "''")}'`);
    if (sprints.length > 0) {
      const sprintList = sprints.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
      whereClauses.push(`sprint IN (${sprintList})`);
    } else {
      if (startDate) whereClauses.push(`done_date >= '${startDate}'`);
      if (endDate) whereClauses.push(`done_date <= '${endDate}'`);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    let groupBy;
    switch (periodicity) {
      case "1 week":
        groupBy = "DATE_TRUNC('WEEK', done_date)";
        break;
      case "1 month":
        groupBy = "DATE_TRUNC('MONTH', done_date)";
        break;
      case "sprints":
        groupBy = "sprint";
        break;
      case "2 weeks":
      default:
        // Improved grouping for 2 weeks to produce readable labels
        groupBy = "CONCAT(DATE_FORMAT(DATE_TRUNC('WEEK', done_date), 'yyyy-MM-dd'), ' - ', DATE_FORMAT(DATE_ADD(DATE_TRUNC('WEEK', done_date), 13), 'yyyy-MM-dd'))";
        break;
    }

    const sql = `
      SELECT
        ${groupBy} as period,
        project_type,
        COUNT(issue_key) as ticket_count
      FROM ${catalog}.${schema}.jira_metrics
      ${whereSQL}
      GROUP BY period, project_type
      ORDER BY period
    `;

    const rows = await queryDatabricks(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching throughput data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

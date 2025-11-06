import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const member = searchParams.get("member");
    const sprints = searchParams.getAll("sprints");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    const whereClauses = [];
    if (team) whereClauses.push(`employee_team = '${team.replace(/'/g, "''")}'`);
    if (member) whereClauses.push(`employee_id = '${member.replace(/'/g, "''")}'`);
    if (sprints.length > 0) {
      const sprintList = sprints.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
      whereClauses.push(`sprint IN (${sprintList})`);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `
      SELECT
        sprint,
        SUM(committed_story_points) as committed,
        SUM(completed_story_points) as completed
      FROM ${catalog}.${schema}.jira_metrics
      ${whereSQL}
      GROUP BY sprint
      ORDER BY sprint
    `;

    const rows = await queryDatabricks(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching velocity data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

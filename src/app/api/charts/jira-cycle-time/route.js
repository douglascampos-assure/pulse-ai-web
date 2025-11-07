import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const employee = searchParams.get("employee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const periodicity = searchParams.get("periodicity") || "2week"; 

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";
    const table = "jira_metrics"; 

    const DATE_COLUMN_FOR_GROUPING = "done_date"; 

    const whereClauses = [
      `done_date IS NOT NULL`, 
      `in_progress_date IS NOT NULL`, 
      `DATEDIFF(CAST(done_date AS DATE), CAST(in_progress_date AS DATE)) >= 0`
    ];

    if (team) whereClauses.push(`project_id = '${team.replace(/'/g, "''")}'`);
    if (employee) whereClauses.push(`employee_id = '${employee.replace(/'/g, "''")}'`);
    if (startDate) whereClauses.push(`${DATE_COLUMN_FOR_GROUPING} >= '${startDate}'`);
    if (endDate) whereClauses.push(`${DATE_COLUMN_FOR_GROUPING} <= '${endDate}'`);

    let periodColumn;
    let orderByColumn = "period ASC";

    switch (periodicity) {
      case "sprint":
        periodColumn = "sprint";
        whereClauses.push(`sprint IS NOT NULL AND TRIM(sprint) <> ''`);
        orderByColumn = `MIN(${DATE_COLUMN_FOR_GROUPING}) ASC`; 
        break;
      case "1week":
        periodColumn = `date_trunc('week', ${DATE_COLUMN_FOR_GROUPING})`;
        break;
      case "1month":
        periodColumn = `date_trunc('month', ${DATE_COLUMN_FOR_GROUPING})`;
        break;
      case "2week":
      default:
        periodColumn = `date_add('1970-01-05', (floor(datediff(${DATE_COLUMN_FOR_GROUPING}, '1970-01-05') / 14) * 14))`;
        break;
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;
    
    const sql = `
      SELECT
        ${periodColumn} AS period,
        AVG(DATEDIFF(CAST(done_date AS DATE), CAST(in_progress_date AS DATE))) AS avg_cycle_time_days
      FROM ${catalog}.${schema}.${table}
      ${whereSQL}
      GROUP BY
        period
      ORDER BY
        ${orderByColumn}
    `;

    const rows = await queryDatabricks(sql);
    
    const formattedRows = rows.map(row => ({
      ...row,
      period: row.period instanceof Date ? row.period.toISOString().split('T')[0] : row.period,
      avg_cycle_time_days: parseFloat(row.avg_cycle_time_days.toFixed(2)),
    }));

    return NextResponse.json(Array.isArray(rows) ? formattedRows : []);
  } catch (error) {
    console.error("Error fetching cycle time data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
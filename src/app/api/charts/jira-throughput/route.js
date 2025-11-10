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

    // const ISSUE_TYPE_COLUMN = "issue_type"; 
    // const DATE_COLUMN_FOR_GROUPING = "last_status_date"; 
    // const whereClauses = [
    //   `last_status IN ('Done', 'CODE REVIEW', 'Closed')`, 
    //   `${ISSUE_TYPE_COLUMN} IS NOT NULL`
    // ];

    const whereClauses = [
      `done_date IS NOT NULL`,
      `issue_type IS NOT NULL`
    ];

    if (team) whereClauses.push(`project_id = '${team.replace(/'/g, "''")}'`);
    if (employee) whereClauses.push(`employee_id = '${employee.replace(/'/g, "''")}'`);
    if (startDate) whereClauses.push(`done_date >= '${startDate}'`);
    if (endDate) whereClauses.push(`done_date <= '${endDate}'`);

    let periodColumn;
    let orderByColumn = "period ASC";

    switch (periodicity) {
      case "sprint":
        periodColumn = "sprint";
        whereClauses.push(`sprint IS NOT NULL AND TRIM(sprint) <> ''`);
        orderByColumn = "MIN(done_date) ASC"; 
        break;
      case "1week":
        periodColumn = "date_trunc('week', done_date)";
        break;
      case "1month":
        periodColumn = "date_trunc('month', done_date)";
        break;
      case "2week":
      default:
        periodColumn = `date_add('1970-01-05', 
          CAST(
            (floor(datediff(done_date, '1970-01-05') / 14) * 14) 
          AS INT)
        )`;
        break;
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT
        ${periodColumn} AS period,
        issue_type,
        COUNT(DISTINCT issue_key) AS count
      FROM ${catalog}.${schema}.${table}
      ${whereSQL}
      GROUP BY
        period, issue_type
      ORDER BY
        ${orderByColumn}
    `;

    const rows = await queryDatabricks(sql);
    
    const formattedRows = rows.map(row => ({
      ...row,
      period: row.period instanceof Date ? row.period.toISOString().split('T')[0] : row.period,
    }));
    console.log("Fetched throughput data rows:", formattedRows);

    return NextResponse.json(Array.isArray(rows) ? formattedRows : []);
  } catch (error) {
    console.error("Error fetching throughput data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}